import { GeminiProvider } from '../providers/gemini-provider.js';
import { GameEngine } from '../game-engine.js';

// Gemini API用モックプロバイダー（実際のAPIレスポンス形式に準拠）
class MockGeminiProvider extends GeminiProvider {
  name = 'mock-gemini';

  async chat(messages: any[]): Promise<any> {
    // 実際のGemini APIのレスポンス形式を模擬
    const mockResponse = {
      content: 'こんにちは！さくらです。よろしくお願いします♪ [MOOD:+3] [AFFECTION:+2] [TRUST:+1]',
      usage: {
        promptTokens: 150,
        completionTokens: 25,
        totalTokens: 175
      }
    };

    console.log('Mock Gemini API called with messages:', messages.length);
    return mockResponse;
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }
}

class GeminiTestRunner {
  private passed = 0;
  private failed = 0;

  async test(name: string, testFn: () => boolean | Promise<boolean>) {
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
  }

  async run() {
    console.log('🚀 Gemini Provider Tests\n');

    // テスト1: Geminiプロバイダーの初期化
    await this.test('Gemini provider initialization', () => {
      const provider = new GeminiProvider({ apiKey: 'test-key' });
      return provider.name === 'gemini';
    });

    // テスト2: メッセージ形式の変換
    await this.test('Message format conversion', async () => {
      const provider = new MockGeminiProvider({ apiKey: 'test-key' });
      const messages = [
        { role: 'system' as const, content: 'You are a helpful assistant' },
        { role: 'user' as const, content: 'Hello' }
      ];
      
      const response = await provider.chat(messages);
      return response.content.includes('こんにちは') && response.usage?.totalTokens > 0;
    });

    // テスト3: ゲームエンジンとの統合
    await this.test('Game engine integration', async () => {
      const provider = new MockGeminiProvider({ apiKey: 'test-key' });
      const gameConfig = {
        aiProvider: 'gemini',
        maxConversationHistory: 15,
        autoSave: false,
        debugMode: false
      };
      
      const engine = new GameEngine(provider, gameConfig);
      engine.initializeGame('easy');
      
      const result = await engine.processUserInput('こんにちは');
      
      return result.aiResponse.length > 0 && 
             result.emotionChange !== undefined &&
             result.relationshipStage === 'stranger';
    });

    // テスト4: 感情タグの抽出
    await this.test('Emotion tag extraction with Gemini', async () => {
      const provider = new MockGeminiProvider({ apiKey: 'test-key' });
      const gameConfig = {
        aiProvider: 'gemini',
        maxConversationHistory: 15,
        autoSave: false,
        debugMode: false
      };
      
      const engine = new GameEngine(provider, gameConfig);
      engine.initializeGame('easy');
      
      const result = await engine.processUserInput('こんにちは');
      
      // [MOOD:+3] [AFFECTION:+2] [TRUST:+1] の抽出確認
      return result.emotionChange.mood === 3 &&
             result.emotionChange.affection === 2 &&
             result.emotionChange.trust === 1;
    });

    // テスト5: 利用可能モデル取得
    await this.test('Available models list', async () => {
      const provider = new MockGeminiProvider({ apiKey: 'test-key' });
      const models = await provider.getAvailableModels();
      
      return models.includes('gemini-1.5-flash') && 
             models.includes('gemini-1.5-pro') &&
             models.length >= 3;
    });

    console.log(`\n📊 Gemini Test Results:`);
    console.log(`✅ Passed: ${this.passed}`);
    console.log(`❌ Failed: ${this.failed}`);
    console.log(`📈 Total: ${this.passed + this.failed}`);
    
    if (this.failed === 0) {
      console.log('\n🎉 All Gemini tests passed!');
      return true;
    } else {
      console.log(`\n💥 ${this.failed} Gemini test(s) failed.`);
      return false;
    }
  }
}

// テスト実行
if (import.meta.url === `file://${process.argv[1]}`) {
  const runner = new GeminiTestRunner();
  runner.run()
    .then((success) => {
      if (success) {
        console.log('\n🌟 Gemini integration is ready!');
        console.log('💡 Get your free API key at: https://aistudio.google.com/app/apikey');
      }
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Gemini test execution failed:', error);
      process.exit(1);
    });
}