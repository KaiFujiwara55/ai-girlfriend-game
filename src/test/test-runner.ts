import { GameEngine } from '../game-engine.js';
import { AIProvider, AIResponse, AIMessage, AIProviderConfig } from '../types/ai-provider.js';
import { EmotionSystem } from '../systems/emotion-system.js';
import { getCharacterByDifficulty } from '../characters/character-data.js';
import { PromptSystem } from '../systems/prompt-system.js';
import { ConversationManager } from '../systems/conversation-manager.js';

// モックAIプロバイダー
class MockAIProvider implements AIProvider {
  name = 'mock';

  async chat(messages: AIMessage[]): Promise<AIResponse> {
    const systemMessage = messages.find(m => m.role === 'system')?.content || '';
    const userMessage = messages.find(m => m.role === 'user')?.content || '';
    
    // 簡単なルールベースの応答（プロンプト全体をチェック）
    let response = '';
    if (systemMessage.includes('告白') || userMessage.includes('告白')) {
      response = 'え...そんな... [CONFESSION_DETECTED] [MOOD:+5] [AFFECTION:+3] [TENSION:+8]';
    } else if (systemMessage.includes('hello') || systemMessage.includes('こんにちは')) {
      response = 'こんにちは！よろしくお願いします [MOOD:+2] [AFFECTION:+1]';
    } else if (systemMessage.includes('料理') || systemMessage.includes('cooking')) {
      response = 'お料理、好きなんですか？ [MOOD:+3] [AFFECTION:+2] [INTEREST:+4]';
    } else if (systemMessage.includes('好き') || userMessage.includes('好き')) {
      response = 'え...そんな... [CONFESSION_DETECTED] [MOOD:+5] [AFFECTION:+3] [TENSION:+8]';
    } else {
      response = 'そうですね... [MOOD:+1] [AFFECTION:+1]';
    }

    return {
      content: response,
      usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 }
    };
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async getAvailableModels(): Promise<string[]> {
    return ['mock-model'];
  }
}

class TestRunner {
  private passed = 0;
  private failed = 0;

  test(name: string, testFn: () => boolean | Promise<boolean>) {
    return new Promise<void>(async (resolve) => {
      try {
        console.log(`🧪 Testing: ${name}`);
        const result = await testFn();
        if (result) {
          console.log(`✅ PASS: ${name}`);
          this.passed++;
        } else {
          console.log(`❌ FAIL: ${name}`);
          this.failed++;
        }
      } catch (error) {
        console.log(`❌ ERROR: ${name} - ${error}`);
        this.failed++;
      }
      resolve();
    });
  }

  async run() {
    console.log('🚀 Starting AI Girlfriend Game Tests\n');

    // テスト1: キャラクターデータの読み込み
    await this.test('Character data loading', () => {
      const sakura = getCharacterByDifficulty('easy');
      const aya = getCharacterByDifficulty('medium');
      const misaki = getCharacterByDifficulty('hard');

      return sakura.name === 'さくら' && 
             aya.name === 'あや' && 
             misaki.name === 'みさき';
    });

    // テスト2: 感情システム
    await this.test('Emotion system initialization', () => {
      const emotions = EmotionSystem.createInitialEmotionState();
      return emotions.mood === 0 && emotions.trust === 10 && emotions.affection === 0;
    });

    // テスト3: 感情変化の適用
    await this.test('Emotion change application', () => {
      const character = getCharacterByDifficulty('easy');
      const initialEmotion = EmotionSystem.createInitialEmotionState();
      const change = { affection: 5, mood: 3 };
      
      const newEmotion = EmotionSystem.applyEmotionChange(initialEmotion, change, character);
      
      return newEmotion.affection > initialEmotion.affection && 
             newEmotion.mood > initialEmotion.mood;
    });

    // テスト4: 感情タグの抽出
    await this.test('Emotion tag extraction', () => {
      const response = 'こんにちは！[MOOD:+3] [AFFECTION:+2]';
      const emotions = EmotionSystem.extractEmotionChange(response);
      
      return emotions.mood === 3 && emotions.affection === 2;
    });

    // テスト5: 関係性段階の判定
    await this.test('Relationship stage determination', () => {
      const lowEmotion = { mood: 0, trust: 5, tension: 20, affection: 10, interest: 20 };
      const highEmotion = { mood: 50, trust: 70, tension: 10, affection: 80, interest: 60 };
      
      const lowStage = EmotionSystem.determineRelationshipStage(lowEmotion);
      const highStage = EmotionSystem.determineRelationshipStage(highEmotion);
      
      return lowStage === 'stranger' && highStage === 'lover';
    });

    // テスト6: プロンプト生成
    await this.test('Prompt generation', () => {
      const character = getCharacterByDifficulty('easy');
      const emotionState = EmotionSystem.createInitialEmotionState();
      const prompt = PromptSystem.generatePrompt({
        character,
        emotionState,
        relationshipStage: 'friend',
        conversationHistory: [],
        userInput: 'こんにちは',
        turnCount: 1
      });
      
      return prompt.includes(character.name) && 
             prompt.includes('友達として認識') &&
             prompt.includes('こんにちは');
    });

    // テスト7: 会話マネージャー
    await this.test('Conversation manager', () => {
      const manager = new ConversationManager(5);
      const entry = manager.createConversationEntry(1, 'こんにちは', 'こんにちは！', {});
      
      return entry.turn === 1 && 
             entry.userInput === 'こんにちは' && 
             entry.detectedTopics !== undefined;
    });

    // テスト8: ゲームエンジンの初期化
    await this.test('Game engine initialization', () => {
      const mockProvider = new MockAIProvider();
      const gameConfig = {
        aiProvider: 'mock',
        maxConversationHistory: 10,
        autoSave: false,
        debugMode: false
      };
      
      const engine = new GameEngine(mockProvider, gameConfig);
      engine.initializeGame('easy');
      
      const gameState = engine.getGameState();
      return gameState.character.name === 'さくら';
    });

    // テスト9: ユーザー入力の処理
    await this.test('User input processing', async () => {
      const mockProvider = new MockAIProvider();
      const gameConfig = {
        aiProvider: 'mock',
        maxConversationHistory: 10,
        autoSave: false,
        debugMode: false
      };
      
      const engine = new GameEngine(mockProvider, gameConfig);
      engine.initializeGame('easy');
      
      const result = await engine.processUserInput('こんにちは');
      
      console.log('Debug - AI response:', result.aiResponse);
      console.log('Debug - Emotion change:', result.emotionChange);
      
      return result.aiResponse.length > 0 && 
             result.emotionChange !== undefined;
    });

    // テスト10: 告白システム
    await this.test('Confession system', async () => {
      const mockProvider = new MockAIProvider();
      const gameConfig = {
        aiProvider: 'mock',
        maxConversationHistory: 10,
        autoSave: false,
        debugMode: true
      };
      
      const engine = new GameEngine(mockProvider, gameConfig);
      engine.initializeGame('easy');
      
      // 好感度を上げて告白成功するようにする
      const gameState = engine.getGameState();
      gameState.emotionState.affection = 70; // さくらの成功条件は60以上
      
      const result = await engine.processUserInput('告白します');
      
      console.log('Debug - Confession result:', result);
      
      return result.isGameEnding === true && 
             (result.endingType === 'success' || result.endingType === 'failure');
    });

    console.log(`\n📊 Test Results:`);
    console.log(`✅ Passed: ${this.passed}`);
    console.log(`❌ Failed: ${this.failed}`);
    console.log(`📈 Total: ${this.passed + this.failed}`);
    
    if (this.failed === 0) {
      console.log('\n🎉 All tests passed!');
      return true;
    } else {
      console.log(`\n💥 ${this.failed} test(s) failed.`);
      return false;
    }
  }
}

// テスト実行
if (import.meta.url === `file://${process.argv[1]}`) {
  const runner = new TestRunner();
  runner.run()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Test execution failed:', error);
      process.exit(1);
    });
}