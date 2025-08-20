import 'dotenv/config';
import readlineSync from 'readline-sync';
import { GameEngine } from './game-engine.js';
import { AIProviderFactory, getProviderConfigFromEnv } from './providers/ai-provider-factory.js';
import { Difficulty, GameConfig } from './types/game.js';

class AIGirlfriendGame {
  private gameEngine?: GameEngine;
  private selectedProvider?: string;

  async start() {
    console.log('=== 🌸 AI彼女告白ゲーム（改良版）🌸 ===');
    console.log('深化したキャラクターとの心温まる会話を楽しもう！\n');

    try {
      // AIプロバイダーの初期化
      const availableProvider = await this.initializeAIProvider();
      
      // ゲーム設定
      const gameConfig: GameConfig = {
        aiProvider: availableProvider,
        maxConversationHistory: 15,
        autoSave: false,
        debugMode: process.env.DEBUG === 'true'
      };

      const configs = getProviderConfigFromEnv();
      this.gameEngine = new GameEngine(
        AIProviderFactory.createProvider(availableProvider as any, configs[availableProvider as keyof typeof configs]),
        gameConfig
      );

      // 難易度選択
      const difficulty = this.selectDifficulty();
      
      // ゲーム開始
      this.gameEngine.initializeGame(difficulty);
      console.log(`\n✨ ${this.getCharacterIntroduction(difficulty)}\n`);

      // メインゲームループ
      await this.gameLoop();

    } catch (error) {
      console.error('ゲーム開始中にエラーが発生しました:', error);
      process.exit(1);
    }
  }

  private async initializeAIProvider(): Promise<string> {
    console.log('AIプロバイダーを初期化中...');
    
    const configs = getProviderConfigFromEnv();
    
    // 利用可能なプロバイダーを検出
    const availableProvider = await AIProviderFactory.detectAvailableProvider(configs);
    
    if (!availableProvider) {
      console.error('❌ 利用可能なAIプロバイダーが見つかりません。');
      console.log('\n以下の環境変数を設定してください:');
      console.log('- GEMINI_API_KEY または GOOGLE_API_KEY (Google Gemini用) 🆓無料！');
      console.log('- ANTHROPIC_API_KEY (Claude用)');
      console.log('- OPENAI_API_KEY (OpenAI用)');
      console.log('\n💡 推奨: Gemini APIは無料で1日1500リクエスト利用可能です！');
      console.log('   https://aistudio.google.com/app/apikey でAPIキーを取得してください。');
      process.exit(1);
    }

    console.log(`✅ ${availableProvider}プロバイダーを使用します\n`);
    return availableProvider;
  }

  private selectDifficulty(): Difficulty {
    console.log('💝 お相手を選んでください:');
    console.log('1. さくら (初級) - 素直で優しい女の子');
    console.log('2. あや (中級) - ツンデレな女の子');
    console.log('3. みさき (上級) - クールで知的な女の子');

    while (true) {
      const choice = readlineSync.question('\n選択 (1-3): ');
      
      switch (choice) {
        case '1':
          return 'easy';
        case '2':
          return 'medium';
        case '3':
          return 'hard';
        default:
          console.log('❌ 1-3の数字を入力してください。');
      }
    }
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

  private async gameLoop() {
    if (!this.gameEngine) return;

    console.log('💬 会話を始めましょう！');
    console.log('💡 ヒント: "help"で操作説明、"status"で現在の状態を確認できます');
    console.log('💘 準備ができたら "告白" と入力してみてください\n');

    let isGameActive = true;

    while (isGameActive) {
      try {
        // ユーザー入力
        const userInput = readlineSync.question('> あなた: ');

        // 特殊コマンドの処理
        if (userInput.toLowerCase() === 'help') {
          this.showHelp();
          continue;
        }

        if (userInput.toLowerCase() === 'status') {
          this.showStatus();
          continue;
        }

        if (userInput.toLowerCase() === 'quit') {
          console.log('👋 ゲームを終了します。お疲れ様でした！');
          break;
        }

        // ゲーム処理
        const result = await this.gameEngine.processUserInput(userInput);
        
        // AI応答の表示
        const character = this.gameEngine.getGameState().character;
        console.log(`${character.name}: ${result.aiResponse}`);
        
        // 感情状態の表示
        this.displayEmotionStatus(result.emotionChange);

        // ゲーム終了チェック
        if (result.isGameEnding) {
          isGameActive = false;
          this.showGameEnding(result.endingType!);
        }

      } catch (error) {
        console.error('❌ エラーが発生しました:', error);
        console.log('もう一度お試しください。');
      }
    }
  }

  private showHelp() {
    console.log('\n📖 === ヘルプ ===');
    console.log('- 自然に会話してください');
    console.log('- "status" - 現在の感情状態と関係を確認');
    console.log('- "help" - このヘルプを表示');
    console.log('- "quit" - ゲームを終了');
    console.log('- "告白" - 告白する（準備ができたら）');
    console.log('================\n');
  }

  private showStatus() {
    if (!this.gameEngine) return;

    const gameState = this.gameEngine.getGameState();
    const stats = this.gameEngine.getConversationStats();
    
    console.log('\n📊 === 現在の状況 ===');
    console.log(`キャラクター: ${gameState.character.name}`);
    console.log(`関係性: ${this.getRelationshipDescription(gameState.relationshipStage)}`);
    console.log(`会話回数: ${stats.totalTurns}回`);
    console.log(this.gameEngine.visualizeEmotions());
    
    const suggestedTopics = this.gameEngine.getSuggestedTopics();
    if (suggestedTopics.length > 0) {
      console.log(`\n💡 おすすめ話題: ${suggestedTopics.join('、')}`);
    }
    console.log('==================\n');
  }

  private displayEmotionStatus(emotionChange: any) {
    const changes: string[] = [];
    
    for (const [emotion, change] of Object.entries(emotionChange) as [string, number][]) {
      if (change !== 0) {
        const emoji = change > 0 ? '📈' : '📉';
        const emotionName = this.getEmotionName(emotion);
        changes.push(`${emotionName}${emoji}${change > 0 ? '+' : ''}${change}`);
      }
    }
    
    if (changes.length > 0) {
      console.log(`(${changes.join(', ')})`);
    }
    console.log('');
  }

  private getEmotionName(emotion: string): string {
    const names: { [key: string]: string } = {
      mood: '気分',
      trust: '信頼',
      tension: '緊張',
      affection: '好感',
      interest: '興味'
    };
    return names[emotion] || emotion;
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

  private showGameEnding(endingType: 'success' | 'failure') {
    console.log('\n' + '='.repeat(50));
    
    if (endingType === 'success') {
      console.log('🎉 告白成功！おめでとうございます！ 🎉');
      console.log('二人は恋人として新しいスタートを切りました。');
      console.log('素敵な恋愛の始まりですね！');
    } else {
      console.log('💔 告白は失敗でした...');
      console.log('でも諦めないで！もっと関係を深めてから再挑戦してみませんか？');
      console.log('次回はきっと成功できるはずです！');
    }
    
    const stats = this.gameEngine!.getConversationStats();
    console.log(`\n📊 ゲーム結果:`);
    console.log(`会話回数: ${stats.totalTurns}回`);
    console.log(`話題: ${stats.mostDiscussedTopics.slice(0, 3).join('、')}`);
    
    console.log('\n' + '='.repeat(50));
    console.log('🌸 ゲームをお楽しみいただき、ありがとうございました！ 🌸');
  }
}

// メイン実行
if (import.meta.url === `file://${process.argv[1]}`) {
  const game = new AIGirlfriendGame();
  game.start().catch(console.error);
}