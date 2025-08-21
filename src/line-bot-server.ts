import 'dotenv/config';
import express from 'express';
import {
  Client,
  middleware,
  WebhookEvent,
  MessageEvent,
  TextMessage,
  PostbackEvent,
  MiddlewareConfig,
  ClientConfig
} from '@line/bot-sdk';
import { GameEngine } from './game-engine.js';
import { AIProviderFactory, getProviderConfigFromEnv } from './providers/ai-provider-factory.js';
import { Difficulty, GameConfig } from './types/game.js';

// LINE Bot設定
const lineConfig: ClientConfig & MiddlewareConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
  channelSecret: process.env.LINE_CHANNEL_SECRET || ''
};

// LINE クライアント
const client = new Client(lineConfig);

// ユーザーセッション管理
class UserSessionManager {
  private sessions: Map<string, {
    gameEngine: GameEngine;
    isGameActive: boolean;
    difficulty?: Difficulty;
    lastActivity: Date;
  }> = new Map();

  async getOrCreateSession(userId: string) {
    let session = this.sessions.get(userId);
    
    if (!session || !session.isGameActive) {
      // 新しいセッションを作成
      const availableProvider = await this.initializeAIProvider();
      const gameConfig: GameConfig = {
        aiProvider: availableProvider,
        maxConversationHistory: 15,
        autoSave: false,
        debugMode: process.env.DEBUG === 'true'
      };

      const configs = getProviderConfigFromEnv();
      const gameEngine = new GameEngine(
        AIProviderFactory.createProvider(availableProvider as any, configs[availableProvider as keyof typeof configs]),
        gameConfig
      );

      session = {
        gameEngine,
        isGameActive: true,
        lastActivity: new Date()
      };
      
      this.sessions.set(userId, session);
    } else {
      // 最終活動時間を更新
      session.lastActivity = new Date();
    }

    return session;
  }

  private async initializeAIProvider(): Promise<string> {
    const configs = getProviderConfigFromEnv();
    const availableProvider = await AIProviderFactory.detectAvailableProvider(configs);
    
    if (!availableProvider) {
      throw new Error('利用可能なAIプロバイダーが見つかりません。');
    }

    return availableProvider;
  }

  getDifficulties() {
    return [
      { label: 'さくら (初級)', data: 'easy' },
      { label: 'あや (中級)', data: 'medium' },
      { label: 'みさき (上級)', data: 'hard' }
    ];
  }

  // 非アクティブセッションのクリーンアップ（1時間後）
  cleanupInactiveSessions() {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    for (const [userId, session] of this.sessions.entries()) {
      if (session.lastActivity < oneHourAgo) {
        this.sessions.delete(userId);
      }
    }
  }
}

const sessionManager = new UserSessionManager();

// 定期的なセッションクリーンアップ
setInterval(() => {
  sessionManager.cleanupInactiveSessions();
}, 30 * 60 * 1000); // 30分ごと

export class LineBotServer {
  public app: express.Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = Number(process.env.PORT) || 3000;
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware() {
    this.app.use(express.json());
  }

  private setupRoutes() {
    // ヘルスチェック用エンドポイント
    this.app.get('/', (req, res) => {
      res.json({ 
        status: 'ok', 
        message: 'AI彼女ゲーム LINE Bot サーバー',
        timestamp: new Date().toISOString()
      });
    });

    // LINE Webhook エンドポイント
    this.app.post('/webhook', middleware(lineConfig), async (req, res) => {
      try {
        const events: WebhookEvent[] = req.body.events;
        
        await Promise.all(events.map(async (event) => {
          await this.handleEvent(event);
        }));

        res.status(200).send('OK');
      } catch (error) {
        console.error('Webhook処理エラー:', error);
        res.status(500).send('Internal Server Error');
      }
    });
  }

  private async handleEvent(event: WebhookEvent) {
    if (event.type === 'message' && event.message.type === 'text') {
      await this.handleTextMessage(event as MessageEvent & { message: TextMessage });
    } else if (event.type === 'postback') {
      await this.handlePostback(event as PostbackEvent);
    }
  }

  private async handleTextMessage(event: MessageEvent & { message: TextMessage }) {
    const userId = event.source.userId;
    if (!userId) return;

    const userMessage = event.message.text;
    const session = await sessionManager.getOrCreateSession(userId);

    try {
      // 特殊コマンドの処理
      if (userMessage.toLowerCase() === 'help' || userMessage === 'ヘルプ') {
        await this.sendHelpMessage(event.replyToken);
        return;
      }

      if (userMessage.toLowerCase() === 'status' || userMessage === 'ステータス') {
        await this.sendStatusMessage(event.replyToken, session);
        return;
      }

      if (userMessage.toLowerCase() === 'reset' || userMessage === 'リセット') {
        await this.resetGame(event.replyToken, userId);
        return;
      }

      // ゲームが初期化されていない場合は難易度選択を促す
      if (!session.difficulty) {
        await this.sendDifficultySelection(event.replyToken);
        return;
      }

      // ゲーム処理
      const result = await session.gameEngine.processUserInput(userMessage);
      
      let responseMessage = `${session.gameEngine.getGameState().character.name}: ${result.aiResponse}`;
      
      // 感情変化の表示
      const emotionChanges = this.formatEmotionChanges(result.emotionChange);
      if (emotionChanges) {
        responseMessage += `\n\n${emotionChanges}`;
      }

      await client.replyMessage(event.replyToken, {
        type: 'text',
        text: responseMessage
      });

      // ゲーム終了チェック
      if (result.isGameEnding) {
        await this.handleGameEnding(userId, result.endingType!);
      }

    } catch (error) {
      console.error('メッセージ処理エラー:', error);
      await client.replyMessage(event.replyToken, {
        type: 'text',
        text: 'エラーが発生しました。もう一度お試しください。'
      });
    }
  }

  private async handlePostback(event: PostbackEvent) {
    const userId = event.source.userId;
    if (!userId) return;

    const data = event.postback.data;
    const session = await sessionManager.getOrCreateSession(userId);

    try {
      if (data.startsWith('difficulty_')) {
        const difficulty = data.replace('difficulty_', '') as Difficulty;
        session.difficulty = difficulty;
        session.gameEngine.initializeGame(difficulty);

        const character = session.gameEngine.getGameState().character;
        const introduction = this.getCharacterIntroduction(difficulty);

        await client.replyMessage(event.replyToken, {
          type: 'text',
          text: `✨ ${introduction}\n\n💬 それでは会話を始めましょう！自然にお話しください。`
        });
      }
    } catch (error) {
      console.error('Postback処理エラー:', error);
      await client.replyMessage(event.replyToken, {
        type: 'text',
        text: 'エラーが発生しました。もう一度お試しください。'
      });
    }
  }

  private async sendDifficultySelection(replyToken: string) {
    const difficulties = sessionManager.getDifficulties();

    await client.replyMessage(replyToken, {
      type: 'template',
      altText: 'お相手を選んでください',
      template: {
        type: 'buttons',
        title: '💝 お相手を選んでください',
        text: 'どの女の子と会話したいですか？',
        actions: difficulties.map(diff => ({
          type: 'postback',
          label: diff.label,
          data: `difficulty_${diff.data}`
        }))
      }
    });
  }

  private async sendHelpMessage(replyToken: string) {
    const helpText = `📖 === ヘルプ ===
・自然に会話してください
・「ステータス」で現在の状態を確認
・「リセット」でゲームをやり直し
・「ヘルプ」でこのメッセージを表示

💘 準備ができたら告白してみてください！
================`;

    await client.replyMessage(replyToken, {
      type: 'text',
      text: helpText
    });
  }

  private async sendStatusMessage(replyToken: string, session: any) {
    if (!session.difficulty) {
      await client.replyMessage(replyToken, {
        type: 'text',
        text: 'まず相手を選んでください。'
      });
      return;
    }

    const gameState = session.gameEngine.getGameState();
    const stats = session.gameEngine.getConversationStats();
    const emotions = session.gameEngine.visualizeEmotions();

    const statusText = `📊 === 現在の状況 ===
キャラクター: ${gameState.character.name}
関係性: ${this.getRelationshipDescription(gameState.relationshipStage)}
会話回数: ${stats.totalTurns}回

${emotions}
==================`;

    await client.replyMessage(replyToken, {
      type: 'text',
      text: statusText
    });
  }

  private async resetGame(replyToken: string, userId: string) {
    // セッションを削除
    const session = await sessionManager.getOrCreateSession(userId);
    session.isGameActive = false;

    await client.replyMessage(replyToken, {
      type: 'text',
      text: 'ゲームをリセットしました。新しい相手を選んでください。'
    });

    // 新しい難易度選択を送信
    setTimeout(async () => {
      await this.sendDifficultySelection(replyToken);
    }, 1000);
  }

  private async handleGameEnding(userId: string, endingType: 'success' | 'failure') {
    const session = await sessionManager.getOrCreateSession(userId);
    session.isGameActive = false;

    let endingMessage = '';
    if (endingType === 'success') {
      endingMessage = '🎉 告白成功！おめでとうございます！ 🎉\n二人は恋人として新しいスタートを切りました。\n素敵な恋愛の始まりですね！';
    } else {
      endingMessage = '💔 告白は失敗でした...\nでも諦めないで！もっと関係を深めてから再挑戦してみませんか？';
    }

    const stats = session.gameEngine.getConversationStats();
    const resultText = `${endingMessage}\n\n📊 ゲーム結果:\n会話回数: ${stats.totalTurns}回\n\n🌸 またお楽しみください！新しいゲームを始めるには「リセット」と入力してください。`;

    // Push message（別途実装が必要な場合）
    // await client.pushMessage(userId, { type: 'text', text: resultText });
  }

  private formatEmotionChanges(emotionChange: any): string {
    const changes: string[] = [];
    const emotionNames: { [key: string]: string } = {
      mood: '😊気分',
      trust: '🤝信頼',
      tension: '😰緊張',
      affection: '💖好感',
      interest: '✨興味'
    };

    for (const [emotion, change] of Object.entries(emotionChange) as [string, number][]) {
      if (change !== 0) {
        const emoji = change > 0 ? '📈' : '📉';
        const name = emotionNames[emotion] || emotion;
        changes.push(`${name}${emoji}${change > 0 ? '+' : ''}${change}`);
      }
    }

    return changes.length > 0 ? `(${changes.join(', ')})` : '';
  }

  private getCharacterIntroduction(difficulty: Difficulty): string {
    switch (difficulty) {
      case 'easy':
        return 'あなたのお相手は さくら です。\n田舎出身の心優しい女の子。料理が得意で、家族思いです。';
      case 'medium':
        return 'あなたのお相手は あや です。\n成績優秀だけどツンデレ。素直になれない女の子です。';
      case 'hard':
        return 'あなたのお相手は みさき です。\nクールで知的。論理的思考を重視する女の子です。';
      default:
        return '';
    }
  }

  private getRelationshipDescription(stage: string): string {
    const descriptions: { [key: string]: string } = {
      stranger: '初対面',
      acquaintance: '知り合い',
      friend: '友達',
      close_friend: '親友',
      romantic_interest: '特別な人',
      lover: '恋人'
    };
    return descriptions[stage] || stage;
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`🤖 LINE Bot サーバーが起動しました: http://localhost:${this.port}`);
      console.log(`📱 Webhook URL: http://localhost:${this.port}/webhook`);
    });
  }
}

// Vercel serverless function用のエクスポート
const server = new LineBotServer();
export default server.app;

// サーバー起動（直接実行の場合）
if (require.main === module) {
  server.start();
}