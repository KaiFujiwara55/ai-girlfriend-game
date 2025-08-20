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
  private conversationManager: ConversationManager;
  private config: GameConfig;

  constructor(aiProvider: AIProvider, config: GameConfig) {
    this.aiProvider = aiProvider;
    this.config = config;
    this.conversationManager = new ConversationManager(config.maxConversationHistory);
  }

  /**
   * ゲームを初期化
   */
  initializeGame(difficulty: Difficulty): void {
    const character = getCharacterByDifficulty(difficulty);
    
    this.gameState = {
      character,
      relationshipStage: 'stranger',
      emotionState: EmotionSystem.createInitialEmotionState(),
      conversationHistory: [],
      gameProgress: {
        turnCount: 0,
        startTime: new Date(),
        specialEvents: []
      }
    };

    if (this.config.debugMode) {
      console.log('Game initialized with character:', character.name);
      console.log('Initial emotion state:', this.gameState.emotionState);
    }
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

    // 告白チェック
    if (this.isConfessionAttempt(userInput)) {
      return await this.handleConfession();
    }

    // 話題ベースの感情変化を事前計算
    const topicBasedEmotion = EmotionSystem.calculateTopicResponse(userInput, this.gameState.character);

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
   * 告白処理
   */
  private async handleConfession(): Promise<any> {
    const isSuccess = EmotionSystem.isConfessionSuccessful(
      this.gameState.emotionState,
      this.gameState.character
    );

    const confessionResponse = DialogueSystem.generateConfessionResponse(
      this.gameState.character,
      this.gameState.emotionState,
      isSuccess
    );

    // 告白結果による感情変化
    const emotionChange = isSuccess 
      ? { affection: 20, trust: 10, mood: 15, tension: -5 }
      : { affection: -5, trust: 2, mood: -8, tension: 8 };

    // 感情状態を更新
    this.gameState.emotionState = EmotionSystem.applyEmotionChange(
      this.gameState.emotionState,
      emotionChange,
      this.gameState.character
    );

    // 告白イベントを記録
    this.gameState.gameProgress.specialEvents.push(
      isSuccess ? 'confession_success' : 'confession_failure'
    );

    return {
      aiResponse: this.cleanResponse(confessionResponse),
      emotionChange,
      relationshipStage: isSuccess ? 'lover' : this.gameState.relationshipStage,
      isGameEnding: true,
      endingType: isSuccess ? 'success' : 'failure'
    };
  }

  /**
   * AI応答を取得
   */
  private async getAIResponse(prompt: string): Promise<string> {
    try {
      const messages = [
        { role: 'system' as const, content: prompt },
        { role: 'user' as const, content: 'Please respond as the character.' }
      ];

      const response = await this.aiProvider.chat(messages, {
        temperature: 0.8,
        maxTokens: 300
      });

      return response.content;
    } catch (error) {
      console.error('Failed to get AI response:', error);
      return this.getFallbackResponse();
    }
  }

  /**
   * フォールバック応答（AI障害時）
   */
  private getFallbackResponse(): string {
    const fallbacks = [
      'そうですね... [MOOD:+1] [AFFECTION:+1]',
      'なるほど、そういうことですか [MOOD:+0] [INTEREST:+2]',
      'うーん、そうですね [MOOD:+1] [TRUST:+1]'
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  /**
   * 告白の判定
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
   * 感情変化をマージ
   */
  private mergeEmotionChanges(emotion1: any, emotion2: any): any {
    const merged: any = { ...emotion1 };
    
    for (const [key, value] of Object.entries(emotion2)) {
      if (merged[key] !== undefined) {
        merged[key] += value as number;
      } else {
        merged[key] = value;
      }
    }
    
    return merged;
  }

  /**
   * AI応答をクリーンアップ（感情タグとプロンプト内容を除去）
   */
  private cleanResponse(response: string): string {
    let cleaned = response;
    
    // 感情タグを除去
    cleaned = cleaned.replace(/\[(MOOD|TRUST|TENSION|AFFECTION|INTEREST):[+-]?\d+\]/gi, '');
    
    // プロンプト関連の内容を除去
    const promptPatterns = [
      // システムプロンプトの引用
      /システム[:：].*$/gm,
      /System[:：].*$/gm,
      /# キャラクター設定.*$/gm,
      /## 基本情報.*$/gm,
      /あなたは.*として.*$/gm,
      /キャラ名[:：].*$/gm,
      /性格[:：].*$/gm,
      /ルール[:：].*$/gm,
      
      // プロンプトの指示文
      /.*として.*応答してください.*$/gm,
      /.*らしい反応を示してください.*$/gm,
      /返答には必ず.*を含めてください.*$/gm,
      /感情変化タグを.*含めてください.*$/gm,
      
      // デバッグ情報
      /=== AI PROMPT DEBUG ===[\s\S]*?========================/g,
      
      // 長い説明文やプロンプトの繰り返し
      /.*キャラクターとして一貫して振る舞ってください.*$/gm,
      /.*自然で魅力的な会話を心がけてください.*$/gm,
      
      // マークダウンヘッダー
      /^#{1,6}\s.*$/gm,
      
      // 冗長な改行
      /\n{3,}/g
    ];
    
    // 各パターンを適用
    for (const pattern of promptPatterns) {
      cleaned = cleaned.replace(pattern, '');
    }
    
    // 先頭・末尾の空白や改行を整理
    cleaned = cleaned.trim();
    
    // 複数の空白を単一に
    cleaned = cleaned.replace(/\s+/g, ' ');
    
    // 空の応答の場合はフォールバック
    if (!cleaned || cleaned.length < 3) {
      const characterName = this.gameState?.character.name || '';
      const fallbacks = [
        'そうですね...',
        'うーん...',
        'なるほど...',
        'そうなんですね',
        '分かりました'
      ];
      cleaned = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }
    
    return cleaned;
  }

  /**
   * 特別イベントをチェック
   */
  private checkSpecialEvents(): void {
    const { affection, trust } = this.gameState.emotionState;
    const turnCount = this.gameState.gameProgress.turnCount;

    // 初回の高好感度反応
    if (affection >= 30 && !this.gameState.gameProgress.specialEvents.includes('first_positive_reaction')) {
      this.gameState.gameProgress.specialEvents.push('first_positive_reaction');
    }

    // 信頼関係の確立
    if (trust >= 50 && !this.gameState.gameProgress.specialEvents.includes('trust_established')) {
      this.gameState.gameProgress.specialEvents.push('trust_established');
    }

    // 長時間の会話
    if (turnCount >= 20 && !this.gameState.gameProgress.specialEvents.includes('long_conversation')) {
      this.gameState.gameProgress.specialEvents.push('long_conversation');
    }
  }

  /**
   * 現在のゲーム状態を取得
   */
  getGameState(): GameState {
    return { ...this.gameState };
  }

  /**
   * 会話統計を取得
   */
  getConversationStats() {
    return this.conversationManager.getConversationStats(this.gameState.conversationHistory);
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
   * 感情状態の可視化
   */
  visualizeEmotions(): string {
    return EmotionSystem.visualizeEmotions(this.gameState.emotionState);
  }

  /**
   * ゲーム状態をリセット
   */
  resetGame(): void {
    this.gameState = null as any;
  }
}