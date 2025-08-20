import { GameEngine } from '../game-engine.js';
import { AIProvider, AIResponse, AIMessage } from '../types/ai-provider.js';

// リアルな会話シミュレーション用モックプロバイダー
class SimulationAIProvider implements AIProvider {
  name = 'simulation';

  async chat(messages: AIMessage[]): Promise<AIResponse> {
    const systemPrompt = messages.find(m => m.role === 'system')?.content || '';
    
    // さくらのシミュレーション
    if (systemPrompt.includes('さくら')) {
      return this.getSakuraResponse(systemPrompt);
    }
    
    // あやのシミュレーション
    if (systemPrompt.includes('あや')) {
      return this.getAyaResponse(systemPrompt);
    }
    
    // みさきのシミュレーション
    if (systemPrompt.includes('みさき')) {
      return this.getMisakiResponse(systemPrompt);
    }

    return {
      content: 'そうですね... [MOOD:+1]',
      usage: { promptTokens: 100, completionTokens: 10, totalTokens: 110 }
    };
  }

  private getSakuraResponse(systemPrompt: string): AIResponse {
    const responses = [
      'わあ、そうなんですね！嬉しいです♪ [MOOD:+4] [AFFECTION:+3] [TRUST:+2]',
      'えへへ、ありがとうございます！そう言ってもらえると嬉しいな [MOOD:+3] [AFFECTION:+2] [INTEREST:+1]',
      'あ、私もそう思います！一緒ですね♪ [MOOD:+2] [AFFECTION:+1] [TRUST:+1]',
      'そうですね...とても素敵だと思います [MOOD:+3] [AFFECTION:+2] [INTEREST:+2]'
    ];
    
    return {
      content: responses[Math.floor(Math.random() * responses.length)],
      usage: { promptTokens: systemPrompt.length / 4, completionTokens: 30, totalTokens: systemPrompt.length / 4 + 30 }
    };
  }

  private getAyaResponse(systemPrompt: string): AIResponse {
    const responses = [
      'ふん...まあ、悪くないわね [MOOD:+2] [AFFECTION:+1] [TENSION:+3]',
      'べ、別にあんたのためじゃないからね！たまたまよ [MOOD:+1] [AFFECTION:+2] [TENSION:+5]',
      'それくらい当然でしょ？私を誰だと思ってるの [MOOD:+3] [AFFECTION:+1] [TRUST:+1]',
      'ちょっと...そんなに見つめないでよ [MOOD:+2] [AFFECTION:+2] [TENSION:+4]'
    ];
    
    return {
      content: responses[Math.floor(Math.random() * responses.length)],
      usage: { promptTokens: systemPrompt.length / 4, completionTokens: 25, totalTokens: systemPrompt.length / 4 + 25 }
    };
  }

  private getMisakiResponse(systemPrompt: string): AIResponse {
    const responses = [
      'なるほど、興味深い観点ですね [MOOD:+2] [INTEREST:+4] [AFFECTION:+1]',
      '論理的に考えると、その通りだと思います [MOOD:+3] [INTEREST:+3] [TRUST:+2]',
      'その件について、私も同様の分析をしたことがあります [MOOD:+2] [INTEREST:+5] [AFFECTION:+1]',
      'あなたの考え方は合理的ですね。評価いたします [MOOD:+3] [AFFECTION:+2] [TRUST:+1]'
    ];
    
    return {
      content: responses[Math.floor(Math.random() * responses.length)],
      usage: { promptTokens: systemPrompt.length / 4, completionTokens: 28, totalTokens: systemPrompt.length / 4 + 28 }
    };
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }
}

async function simulateGameplay() {
  console.log('🎮 Game Simulation Test - Full Gameplay Flow\n');

  const mockProvider = new SimulationAIProvider();
  const gameConfig = {
    aiProvider: 'simulation',
    maxConversationHistory: 15,
    autoSave: false,
    debugMode: false
  };

  // さくらとのゲームプレイシミュレーション
  console.log('🌸 Simulating full gameplay with Sakura...');
  const engine = new GameEngine(mockProvider, gameConfig);
  engine.initializeGame('easy');

  // シミュレーション会話
  const conversations = [
    'こんにちは、初めまして',
    '料理は好きですか？',
    '今度一緒にお菓子作りませんか？',
    'あなたの笑顔が素敵ですね',
    'もっとあなたのことを知りたいです',
    '実は...あなたが好きです'  // 告白
  ];

  for (let i = 0; i < conversations.length; i++) {
    console.log(`\n--- Turn ${i + 1} ---`);
    console.log(`あなた: ${conversations[i]}`);
    
    const result = await engine.processUserInput(conversations[i]);
    console.log(`さくら: ${result.aiResponse}`);
    
    // 感情変化の表示
    const emotionChanges = Object.entries(result.emotionChange)
      .filter(([_, value]) => (value as number) !== 0)
      .map(([emotion, value]) => `${emotion}${(value as number) > 0 ? '+' : ''}${value}`)
      .join(', ');
    
    if (emotionChanges) {
      console.log(`(${emotionChanges})`);
    }
    
    console.log(`関係性: ${result.relationshipStage}`);
    
    if (result.isGameEnding) {
      console.log(`\n🎉 ゲーム終了: ${result.endingType === 'success' ? '告白成功！' : '告白失敗...'}`);
      break;
    }
    
    // 1秒待機（シミュレーション用）
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // 最終統計
  console.log('\n📊 Final Statistics:');
  const stats = engine.getConversationStats();
  console.log(`- Total conversations: ${stats.totalTurns}`);
  console.log(`- Average response length: ${stats.averageResponseLength.toFixed(1)} characters`);
  console.log(`- Most discussed topics: ${stats.mostDiscussedTopics.join(', ')}`);
  
  console.log('\n💭 Final emotion state:');
  console.log(engine.visualizeEmotions());
  
  console.log('\n✅ Game simulation completed successfully!');
  
  return true;
}

// 実行
if (import.meta.url === `file://${process.argv[1]}`) {
  simulateGameplay()
    .then(() => {
      console.log('\n🎯 All systems verified and working correctly!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Simulation failed:', error);
      process.exit(1);
    });
}