import { AIProvider } from './types/ai-provider.js';
import { GameState, GameConfig, Difficulty, ConversationEntry } from './types/game.js';
import { getCharacterByDifficulty } from './characters/character-data.js';
import { EmotionSystem } from './systems/emotion-system.js';
import { PromptSystem } from './systems/prompt-system.js';
import { ConversationManager } from './systems/conversation-manager.js';
import { DialogueSystem } from './systems/dialogue-system.js';

export class GameEngine {
  private gameState!: GameState;
  private aiProvider: AIProvider;
  private config: GameConfig;
  private conversationManager: ConversationManager;
  private dialogueSystem: DialogueSystem;

  constructor(aiProvider: AIProvider, config: GameConfig) {
    this.aiProvider = aiProvider;
    this.config = config;
    this.conversationManager = new ConversationManager(config.maxConversationHistory || 20);
    this.dialogueSystem = new DialogueSystem();
  }

  /**
   * ゲームを初期化
   */
  initializeGame(difficulty: Difficulty) {
    const character = getCharacterByDifficulty(difficulty);
    const initialEmotion = EmotionSystem.createInitialEmotionState();

    this.gameState = {
      character,
      relationshipStage: 'stranger',
      emotionState: initialEmotion,
      conversationHistory: [],
      gameProgress: {
        turnCount: 0,
        startTime: new Date(),
        specialEvents: [],
        confessionAttempted: false,
        confessionSuccessful: false,
        failedConfessions: 0
      }
    };
  }

  /**
   * ユーザー入力を処理してAI応答を生成
   */
  async processUserInput(userInput: string): Promise<{
    aiResponse: string;
    emotionChange: any;
    relationshipStage: string;
    isGameEnding?: boolean;
    endingType?: 'success' | 'failure';
  }> {
    if (!this.gameState) {
      throw new Error('Game not initialized. Call initializeGame first.');
    }

    this.gameState.gameProgress.turnCount++;

    // 繰り返しパターンを検出
    const repetitionInfo = this.conversationManager.detectRepetitivePatterns(
      this.gameState.conversationHistory
    );

    // 話題ベースの感情変化を事前計算
    let topicBasedEmotion = EmotionSystem.calculateTopicResponse(userInput, this.gameState.character);
    
    // 繰り返しペナルティを適用
    if (repetitionInfo.isRepetitive) {
      topicBasedEmotion = EmotionSystem.applyRepetitionPenalty(
        topicBasedEmotion,
        repetitionInfo.repetitionScore,
        repetitionInfo.isRepetitive
      );
    }

    // AIプロンプトを生成
    const promptContext = {
      character: this.gameState.character,
      emotionState: this.gameState.emotionState,
      relationshipStage: this.gameState.relationshipStage,
      conversationHistory: this.gameState.conversationHistory,
      userInput,
      turnCount: this.gameState.gameProgress.turnCount
    };

    const prompt = PromptSystem.generatePrompt(promptContext);

    if (this.config.debugMode) {
      console.log('Generated prompt:', prompt);
    }

    // AI応答を取得
    const aiResponse = await this.getAIResponse(prompt);

    // AI応答から告白検出タグをチェック
    if (this.detectConfessionInResponse(aiResponse)) {
      // 告白が検出された場合の処理
      return await this.handleConfessionFromResponse(aiResponse, topicBasedEmotion);
    }

    // AI応答から感情変化を抽出
    const aiEmotionChange = EmotionSystem.extractEmotionChange(aiResponse);

    // 話題ベースの感情変化とマージ
    const combinedEmotionChange = this.mergeEmotionChanges(topicBasedEmotion, aiEmotionChange);

    // 感情状態を更新
    this.gameState.emotionState = EmotionSystem.applyEmotionChange(
      this.gameState.emotionState,
      combinedEmotionChange,
      this.gameState.character
    );

    // 関係性段階を更新
    const newRelationshipStage = EmotionSystem.determineRelationshipStage(this.gameState.emotionState);
    this.gameState.relationshipStage = newRelationshipStage;

    // 会話履歴を更新
    const conversationEntry = this.conversationManager.createConversationEntry(
      this.gameState.gameProgress.turnCount,
      userInput,
      aiResponse,
      combinedEmotionChange
    );

    this.gameState.conversationHistory.push(conversationEntry);
    this.gameState.conversationHistory = this.conversationManager.manageHistory(
      this.gameState.conversationHistory
    );

    // 特別イベントのチェック
    this.checkSpecialEvents();

    return {
      aiResponse: this.cleanResponse(aiResponse),
      emotionChange: combinedEmotionChange,
      relationshipStage: newRelationshipStage
    };
  }

  /**
   * AI応答を取得
   */
  private async getAIResponse(prompt: string): Promise<string> {
    const messages = [
      { role: 'system' as const, content: prompt },
      { role: 'user' as const, content: '' }
    ];

    const response = await this.aiProvider.chat(messages);
    return response.content;
  }

  /**
   * 告白判定
   */
  private isConfessionAttempt(input: string): boolean {
    const confessionKeywords = [
      '告白', 'こくはく', '好き', 'すき', '付き合', 'つきあ',
      '恋人', 'こいびと', '愛し', 'あいし', '大切', 'たいせつ'
    ];

    const lowerInput = input.toLowerCase();
    return confessionKeywords.some(keyword => lowerInput.includes(keyword));
  }

  /**
   * 告白処理
   */
  private async handleConfession(): Promise<any> {
    if (!this.gameState) {
      throw new Error('Game state not initialized');
    }

    const currentAffection = this.gameState.emotionState.affection;
    const requiredAffection = this.getRequiredAffection();

    if (currentAffection >= requiredAffection) {
      // 成功時
      const successResponse = DialogueSystem.getSuccessConfessionResponse(
        this.gameState.character,
        this.gameState.emotionState
      );

      this.gameState.gameProgress.confessionAttempted = true;
      this.gameState.gameProgress.confessionSuccessful = true;

      return {
        aiResponse: successResponse,
        emotionChange: { affection: 10, trust: 5, mood: 10 },
        relationshipStage: 'lover',
        isGameEnding: true,
        endingType: 'success'
      };
    } else {
      // 失敗時
      const failureResponse = DialogueSystem.getFailureConfessionResponse(
        this.gameState.character,
        this.gameState.emotionState,
        requiredAffection - currentAffection
      );

      this.gameState.gameProgress.failedConfessions = 
        (this.gameState.gameProgress.failedConfessions || 0) + 1;

      if (this.gameState.gameProgress.failedConfessions >= 3) {
        return {
          aiResponse: failureResponse,
          emotionChange: { affection: -5, mood: -5, tension: 5 },
          relationshipStage: this.gameState.relationshipStage,
          isGameEnding: true,
          endingType: 'failure'
        };
      }

      return {
        aiResponse: failureResponse,
        emotionChange: { affection: -2, mood: -3, tension: 3 },
        relationshipStage: this.gameState.relationshipStage
      };
    }
  }

  /**
   * 難易度に応じた必要好感度を取得
   */
  private getRequiredAffection(): number {
    switch (this.gameState.character.name) {
      case 'さくら':
        return 60;
      case 'あや':
        return 75;
      case 'みさき':
        return 90;
      default:
        return 70;
    }
  }

  /**
   * 感情変化をマージ
   */
  private mergeEmotionChanges(
    topicBased: Partial<import('./types/game.js').EmotionState>,
    aiBased: Partial<import('./types/game.js').EmotionState>
  ): Partial<import('./types/game.js').EmotionState> {
    const merged: Partial<import('./types/game.js').EmotionState> = {};

    const allKeys = new Set([
      ...Object.keys(topicBased),
      ...Object.keys(aiBased)
    ]);

    for (const key of allKeys) {
      const topicValue = (topicBased as any)[key] || 0;
      const aiValue = (aiBased as any)[key] || 0;
      (merged as any)[key] = topicValue + aiValue;
    }

    return merged;
  }

  /**
   * 特別イベントのチェック
   */
  private checkSpecialEvents() {
    const { emotionState, gameProgress } = this.gameState;

    // 高好感度イベント
    if (emotionState.affection >= 80 && !gameProgress.specialEvents.includes('high_affection')) {
      gameProgress.specialEvents.push('high_affection');
    }

    // 高信頼度イベント
    if (emotionState.trust >= 85 && !gameProgress.specialEvents.includes('high_trust')) {
      gameProgress.specialEvents.push('high_trust');
    }
  }

  /**
   * AI応答から不要な要素を削除
   */
  private cleanResponse(response: string): string {
    // 感情タグとプロンプトの痕跡を削除
    let cleaned = response;

    // 感情タグを削除
    cleaned = cleaned.replace(/\[(MOOD|TRUST|TENSION|AFFECTION|INTEREST|CONFESSION_DETECTED):[+-]?\d+\]/gi, '');

    // よくあるプロンプトの痕跡を削除
    const promptPatterns = [
      /システム[:：].*$/gm,
      /# キャラクター設定.*$/gm,
      /# 現在の.*$/gm,
      /# 会話履歴.*$/gm,
      /# 行動指針.*$/gm,
      /# 感情表現ルール.*$/gm,
      /# 重要な指示.*$/gm,
      /.*として.*応答してください.*$/gm,
      /^\*.*\*$/gm,
      /^##.*$/gm
    ];

    for (const pattern of promptPatterns) {
      cleaned = cleaned.replace(pattern, '');
    }

    // 連続する改行を1つに
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

    // 前後の空白を削除
    cleaned = cleaned.trim();

    return cleaned;
  }

  private detectConfessionInResponse(response: string): boolean {
    return response.includes('[CONFESSION_DETECTED]');
  }

  private async handleConfessionFromResponse(
    aiResponse: string,
    topicBasedEmotion: Partial<import('./types/game.js').EmotionState>
  ): Promise<any> {
    if (!this.gameState) {
      throw new Error('Game state not initialized');
    }

    // AI応答から感情変化を抽出
    const aiEmotionChange = EmotionSystem.extractEmotionChange(aiResponse);
    const combinedEmotionChange = this.mergeEmotionChanges(topicBasedEmotion, aiEmotionChange);

    // 感情状態を更新
    this.gameState.emotionState = EmotionSystem.applyEmotionChange(
      this.gameState.emotionState,
      combinedEmotionChange,
      this.gameState.character
    );

    // 告白成功判定
    const currentAffection = this.gameState.emotionState.affection;
    const requiredAffection = this.getRequiredAffection();

    if (currentAffection >= requiredAffection) {
      // 成功時の処理
      this.gameState.gameProgress.confessionAttempted = true;
      this.gameState.gameProgress.confessionSuccessful = true;

      // 成功時の追加感情ボーナス
      const successBonus: Partial<import('./types/game.js').EmotionState> = {
        affection: 10,
        trust: 5,
        mood: 10,
        tension: -5,
        interest: 5
      };

      this.gameState.emotionState = EmotionSystem.applyEmotionChange(
        this.gameState.emotionState,
        successBonus,
        this.gameState.character
      );

      return {
        aiResponse: this.cleanResponse(aiResponse),
        emotionChange: { ...combinedEmotionChange, ...successBonus },
        relationshipStage: 'lover',
        isGameEnding: true,
        endingType: 'success'
      };
    } else {
      // 失敗時の処理
      this.gameState.gameProgress.confessionAttempted = true;
      this.gameState.gameProgress.failedConfessions = 
        (this.gameState.gameProgress.failedConfessions || 0) + 1;

      if (this.gameState.gameProgress.failedConfessions >= 3) {
        return {
          aiResponse: this.cleanResponse(aiResponse),
          emotionChange: combinedEmotionChange,
          relationshipStage: this.gameState.relationshipStage,
          isGameEnding: true,
          endingType: 'failure'
        };
      }

      return {
        aiResponse: this.cleanResponse(aiResponse),
        emotionChange: combinedEmotionChange,
        relationshipStage: this.gameState.relationshipStage
      };
    }
  }

  /**
   * ゲーム状態を取得
   */
  getGameState(): GameState {
    return this.gameState;
  }

  /**
   * 感情状態の可視化
   */
  visualizeEmotions(): string {
    const emotions = this.gameState.emotionState;
    const bars: string[] = [];

    const emotionList = [
      { name: '😊 気分', value: emotions.mood, max: 100 },
      { name: '💖 好感度', value: emotions.affection, max: 100 },
      { name: '🤝 信頼度', value: emotions.trust, max: 100 },
      { name: '😰 緊張度', value: emotions.tension, max: 100 },
      { name: '✨ 興味度', value: emotions.interest, max: 100 }
    ];

    for (const emotion of emotionList) {
      const percentage = Math.max(0, Math.min(100, (emotion.value / emotion.max) * 100));
      const filled = Math.floor(percentage / 5);
      const bar = '█'.repeat(filled) + '░'.repeat(20 - filled);
      bars.push(`${emotion.name}: ${bar} ${emotion.value}/${emotion.max}`);
    }

    return bars.join('\n');
  }

  /**
   * 推奨話題を取得
   */
  getSuggestedTopics(): string[] {
    return this.conversationManager.getSuggestedTopics(
      this.gameState.conversationHistory,
      this.gameState.character
    );
  }

  /**
   * 会話統計を取得
   */
  getConversationStats() {
    return this.conversationManager.getConversationStats(this.gameState.conversationHistory);
  }
}