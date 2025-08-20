import 'dotenv/config';
import { GeminiProvider } from '../providers/gemini-provider.js';
import { GameEngine } from '../game-engine.js';
import { getProviderConfigFromEnv } from '../providers/ai-provider-factory.js';

async function testGeminiLive() {
  console.log('🚀 Gemini API Live Test\n');

  try {
    // プロバイダー設定を取得
    const configs = getProviderConfigFromEnv();
    const geminiConfig = configs.gemini;

    console.log('📝 Configuration:');
    console.log(`API Key: ${geminiConfig.apiKey.substring(0, 10)}...`);
    console.log(`Model: ${geminiConfig.model}\n`);

    // Geminiプロバイダーのテスト
    console.log('🔍 Testing Gemini Provider...');
    const provider = new GeminiProvider(geminiConfig);
    
    const testMessages = [
      { role: 'system' as const, content: 'あなたは優しくて明るいAI彼女の「さくら」です。' },
      { role: 'user' as const, content: 'こんにちは！' }
    ];

    const response = await provider.chat(testMessages);
    console.log('✅ Provider Response:', response.content);
    console.log('📊 Usage:', response.usage);

    // ゲームエンジンのテスト
    console.log('\n🎮 Testing Game Engine Integration...');
    const gameConfig = {
      aiProvider: 'gemini',
      maxConversationHistory: 15,
      autoSave: false,
      debugMode: false
    };

    const engine = new GameEngine(provider, gameConfig);
    engine.initializeGame('easy');

    // さくらとの会話をテスト
    console.log('\n💬 Testing conversation with Sakura...');
    const result = await engine.processUserInput('こんにちは、初めまして！');
    
    console.log('🌸 Sakura:', result.aiResponse);
    console.log('💝 Emotion changes:', result.emotionChange);
    console.log('❤️ Relationship:', result.relationshipStage);
    
    // 感情状態を表示
    console.log('\n' + engine.visualizeEmotions());

    // 2回目の会話
    console.log('\n💬 Second conversation...');
    const result2 = await engine.processUserInput('料理は得意ですか？');
    console.log('🌸 Sakura:', result2.aiResponse);
    console.log('💝 Emotion changes:', result2.emotionChange);

    console.log('\n✅ All tests passed! Gemini API is working perfectly! 🎉');
    console.log('\n🎯 Ready to play the game!');
    console.log('💡 Run "npm run dev" in a proper terminal to start the interactive game.');

  } catch (error) {
    console.error('❌ Test failed:', error);
    
    if (error instanceof Error && error.message.includes('API key')) {
      console.log('\n💡 Please check your GEMINI_API_KEY in .env file');
    }
  }
}

testGeminiLive().catch(console.error);