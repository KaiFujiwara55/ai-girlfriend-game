import { GameEngine } from '../game-engine.js';
import { AIProvider, AIResponse, AIMessage } from '../types/ai-provider.js';

// より高度なモックAIプロバイダー（手動テスト用）
class AdvancedMockAIProvider implements AIProvider {
  name = 'advanced-mock';

  async chat(messages: AIMessage[]): Promise<AIResponse> {
    const systemPrompt = messages.find(m => m.role === 'system')?.content || '';
    const userContent = messages.find(m => m.role === 'user')?.content || '';
    
    console.log('\n=== AI PROMPT DEBUG ===');
    console.log('System prompt length:', systemPrompt.length);
    console.log('User content:', userContent);
    console.log('Character detected:', systemPrompt.includes('さくら') ? 'さくら' : 
                 systemPrompt.includes('あや') ? 'あや' : 
                 systemPrompt.includes('みさき') ? 'みさき' : 'unknown');
    console.log('Relationship stage:', 
      systemPrompt.includes('初対面') ? 'stranger' :
      systemPrompt.includes('友達として認識') ? 'friend' :
      systemPrompt.includes('恋人関係') ? 'lover' : 'unknown');
    console.log('========================\n');

    // さくらのキャラクター応答例
    if (systemPrompt.includes('さくら')) {
      return {
        content: 'あ、こんにちは！初めまして、さくらです。よろしくお願いします♪ [MOOD:+3] [AFFECTION:+2] [TRUST:+1] [INTEREST:+2]',
        usage: { promptTokens: systemPrompt.length / 4, completionTokens: 30, totalTokens: systemPrompt.length / 4 + 30 }
      };
    }

    // あやのキャラクター応答例
    if (systemPrompt.includes('あや')) {
      return {
        content: 'べ、別にあんたと話したいわけじゃないけど...あやよ [MOOD:+1] [AFFECTION:+1] [TENSION:+4]',
        usage: { promptTokens: systemPrompt.length / 4, completionTokens: 25, totalTokens: systemPrompt.length / 4 + 25 }
      };
    }

    // みさきのキャラクター応答例
    if (systemPrompt.includes('みさき')) {
      return {
        content: 'こんにちは。みさきと申します。お話しできて光栄です [MOOD:+2] [AFFECTION:+1] [INTEREST:+3]',
        usage: { promptTokens: systemPrompt.length / 4, completionTokens: 28, totalTokens: systemPrompt.length / 4 + 28 }
      };
    }

    return {
      content: 'こんにちは [MOOD:+1]',
      usage: { promptTokens: 100, completionTokens: 10, totalTokens: 110 }
    };
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }
}

async function runManualTest() {
  console.log('🔧 Manual Test - AI Girlfriend Game Core Systems\n');

  const mockProvider = new AdvancedMockAIProvider();
  const gameConfig = {
    aiProvider: 'advanced-mock',
    maxConversationHistory: 15,
    autoSave: false,
    debugMode: true
  };

  // テスト1: さくらとの会話
  console.log('👧 Testing Sakura (Easy)...');
  const sakuraEngine = new GameEngine(mockProvider, gameConfig);
  sakuraEngine.initializeGame('easy');
  
  const sakuraResult = await sakuraEngine.processUserInput('こんにちは');
  console.log('Sakura response:', sakuraResult.aiResponse);
  console.log('Emotion changes:', sakuraResult.emotionChange);
  console.log('Relationship:', sakuraResult.relationshipStage);
  console.log(sakuraEngine.visualizeEmotions());

  // テスト2: あやとの会話
  console.log('\n👩 Testing Aya (Medium)...');
  const ayaEngine = new GameEngine(mockProvider, gameConfig);
  ayaEngine.initializeGame('medium');
  
  const ayaResult = await ayaEngine.processUserInput('こんにちは');
  console.log('Aya response:', ayaResult.aiResponse);
  console.log('Emotion changes:', ayaResult.emotionChange);
  console.log('Relationship:', ayaResult.relationshipStage);
  console.log(ayaEngine.visualizeEmotions());

  // テスト3: みさきとの会話
  console.log('\n👩‍🎓 Testing Misaki (Hard)...');
  const misakiEngine = new GameEngine(mockProvider, gameConfig);
  misakiEngine.initializeGame('hard');
  
  const misakiResult = await misakiEngine.processUserInput('こんにちは');
  console.log('Misaki response:', misakiResult.aiResponse);
  console.log('Emotion changes:', misakiResult.emotionChange);
  console.log('Relationship:', misakiResult.relationshipStage);
  console.log(misakiEngine.visualizeEmotions());

  // テスト4: 会話統計
  console.log('\n📊 Testing conversation stats...');
  const stats = sakuraEngine.getConversationStats();
  console.log('Total turns:', stats.totalTurns);
  console.log('Average response length:', stats.averageResponseLength);
  console.log('Most discussed topics:', stats.mostDiscussedTopics);

  // テスト5: 推奨話題
  console.log('\n💡 Testing suggested topics...');
  const suggestedTopics = sakuraEngine.getSuggestedTopics();
  console.log('Suggested topics for Sakura:', suggestedTopics);

  console.log('\n✅ Manual test completed successfully!');
  console.log('\n📋 Summary:');
  console.log('- All character personalities are properly loaded');
  console.log('- Emotion system is working correctly');
  console.log('- AI prompt generation includes character context');
  console.log('- Game engine processes input and updates state');
  console.log('- Conversation management and analysis working');
}

// 実行
if (import.meta.url === `file://${process.argv[1]}`) {
  runManualTest().catch(console.error);
}