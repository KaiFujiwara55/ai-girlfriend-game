import { ConversationEntry, CharacterPersonality } from '../types/game.js';

export interface TopicAnalysis {
  detectedTopics: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  keywords: string[];
  emotionalTone: string[];
}

export class ConversationManager {
  private maxHistorySize: number;

  constructor(maxHistorySize: number = 20) {
    this.maxHistorySize = maxHistorySize;
  }

  /**
   * 新しい会話エントリを作成
   */
  createConversationEntry(
    turn: number,
    userInput: string,
    aiResponse: string,
    emotionChange: any = {}
  ): ConversationEntry {
    return {
      turn,
      userInput,
      aiResponse,
      emotionChange,
      timestamp: new Date(),
      detectedTopics: this.detectTopics(userInput)
    };
  }

  /**
   * 会話履歴を管理（最大数を超えた場合は古いものを削除）
   */
  manageHistory(history: ConversationEntry[]): ConversationEntry[] {
    if (history.length <= this.maxHistorySize) {
      return history;
    }

    // 最新のものを保持し、古いものを削除
    return history.slice(-this.maxHistorySize);
  }

  /**
   * ユーザー入力から話題を検出
   */
  private detectTopics(userInput: string): string[] {
    const topics: string[] = [];
    const input = userInput.toLowerCase();

    // 話題カテゴリの定義
    const topicPatterns = {
      '料理・食べ物': ['料理', '食べ物', 'レシピ', '美味しい', '手作り', '食事', '食べる', 'ご飯', 'お菓子'],
      '家族': ['家族', '兄弟', '姉妹', '両親', '実家', 'お母さん', 'お父さん', '家'],
      '自然・動物': ['自然', '動物', '花', '散歩', 'ペット', '犬', '猫', '鳥', '植物'],
      '学習・知識': ['勉強', '本', '知識', '学習', '成績', '学校', '授業', 'テスト'],
      '芸術・文化': ['音楽', '美術', '文学', 'クラシック', '芸術', '映画', '絵画'],
      '科学・学術': ['科学', '研究', '論文', '実験', '理論', '数学', '物理', '化学'],
      '哲学・思想': ['哲学', '思想', '倫理', '論理', '合理的', '考える', '意味'],
      '感情・気持ち': ['嬉しい', '悲しい', '楽しい', 'つらい', '好き', '嫌い', '感動'],
      '将来・夢': ['将来', '夢', '目標', '希望', '計画', 'やりたい', 'なりたい'],
      '友人関係': ['友達', '友人', '仲間', '一緒', 'みんな', 'クラス', '同級生'],
      '恋愛': ['恋愛', '好き', '愛', '付き合う', 'デート', '恋人', '気持ち', '告白'],
      '趣味・娯楽': ['趣味', '楽しい', 'ゲーム', 'スポーツ', '読書', '映画鑑賞', '音楽鑑賞'],
      '日常生活': ['毎日', '普段', '生活', '日常', 'いつも', '習慣', 'ルーティン']
    };

    // キーワードマッチングで話題を検出
    for (const [topic, keywords] of Object.entries(topicPatterns)) {
      for (const keyword of keywords) {
        if (input.includes(keyword)) {
          if (!topics.includes(topic)) {
            topics.push(topic);
          }
          break;
        }
      }
    }

    return topics;
  }

  /**
   * 会話の流れを分析
   */
  analyzeConversationFlow(history: ConversationEntry[]): {
    dominantTopics: string[];
    conversationTrend: 'improving' | 'declining' | 'stable';
    engagementLevel: number;
    recentMood: 'positive' | 'negative' | 'neutral';
  } {
    if (history.length === 0) {
      return {
        dominantTopics: [],
        conversationTrend: 'stable',
        engagementLevel: 0,
        recentMood: 'neutral'
      };
    }

    // 頻出話題の分析
    const topicCount: { [key: string]: number } = {};
    history.forEach(entry => {
      entry.detectedTopics.forEach(topic => {
        topicCount[topic] = (topicCount[topic] || 0) + 1;
      });
    });

    const dominantTopics = Object.entries(topicCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([topic]) => topic);

    // 感情トレンドの分析（最新5回の好感度変化を見る）
    const recentEntries = history.slice(-5);
    let totalAffectionChange = 0;
    let changeCount = 0;

    recentEntries.forEach(entry => {
      if (entry.emotionChange.affection !== undefined) {
        totalAffectionChange += entry.emotionChange.affection;
        changeCount++;
      }
    });

    const averageChange = changeCount > 0 ? totalAffectionChange / changeCount : 0;
    let conversationTrend: 'improving' | 'declining' | 'stable';
    
    if (averageChange > 1) {
      conversationTrend = 'improving';
    } else if (averageChange < -1) {
      conversationTrend = 'declining';
    } else {
      conversationTrend = 'stable';
    }

    // エンゲージメントレベル（話題の多様性と応答の長さ）
    const uniqueTopics = new Set<string>();
    history.forEach(entry => entry.detectedTopics.forEach(topic => uniqueTopics.add(topic)));
    const engagementLevel = Math.min(100, uniqueTopics.size * 10 + history.length * 2);

    // 最近のムード分析
    const recentMoodChanges = recentEntries
      .map(entry => entry.emotionChange.mood || 0)
      .filter(change => change !== 0);
    
    const averageMood = recentMoodChanges.length > 0 
      ? recentMoodChanges.reduce((sum, change) => sum + change, 0) / recentMoodChanges.length 
      : 0;

    const recentMood = averageMood > 1 ? 'positive' : averageMood < -1 ? 'negative' : 'neutral';

    return {
      dominantTopics,
      conversationTrend,
      engagementLevel,
      recentMood
    };
  }

  /**
   * コンテキストに基づく推奨話題を提案
   */
  getSuggestedTopics(
    history: ConversationEntry[],
    character: CharacterPersonality
  ): string[] {
    const analysis = this.analyzeConversationFlow(history);
    const suggestions: string[] = [];

    // キャラクターの興味に基づく話題
    const characterTopics = this.mapInterestsToTopics(character.interests);
    suggestions.push(...characterTopics.slice(0, 2));

    // まだ話していない話題を提案
    const discussedTopics = new Set(analysis.dominantTopics);
    const undiscussedTopics = characterTopics.filter(topic => !discussedTopics.has(topic));
    suggestions.push(...undiscussedTopics.slice(0, 2));

    // 関係性を深める話題
    if (history.length > 5) {
      suggestions.push('将来・夢', '感情・気持ち');
    }

    // 重複を除去して返す
    return [...new Set(suggestions)].slice(0, 4);
  }

  /**
   * 興味を話題にマッピング
   */
  private mapInterestsToTopics(interests: string[]): string[] {
    const mapping: { [key: string]: string } = {
      '料理': '料理・食べ物',
      '散歩': '自然・動物',
      '動物': '自然・動物',
      '読書': '学習・知識',
      'ガーデニング': '自然・動物',
      'クラシック音楽': '芸術・文化',
      '美術館': '芸術・文化',
      '科学': '科学・学術',
      '哲学': '哲学・思想',
      'チェス': '趣味・娯楽'
    };

    return interests
      .map(interest => {
        for (const [key, topic] of Object.entries(mapping)) {
          if (interest.includes(key)) {
            return topic;
          }
        }
        return null;
      })
      .filter(topic => topic !== null) as string[];
  }

  /**
   * 会話の統計情報を取得
   */
  getConversationStats(history: ConversationEntry[]): {
    totalTurns: number;
    averageResponseLength: number;
    mostDiscussedTopics: string[];
    emotionalJourney: { turn: number; affection: number; mood: number }[];
  } {
    const stats = {
      totalTurns: history.length,
      averageResponseLength: 0,
      mostDiscussedTopics: [] as string[],
      emotionalJourney: [] as { turn: number; affection: number; mood: number }[]
    };

    if (history.length === 0) {
      return stats;
    }

    // 平均応答長
    const totalLength = history.reduce((sum, entry) => sum + entry.aiResponse.length, 0);
    stats.averageResponseLength = totalLength / history.length;

    // 最多話題
    const topicCount: { [key: string]: number } = {};
    history.forEach(entry => {
      entry.detectedTopics.forEach(topic => {
        topicCount[topic] = (topicCount[topic] || 0) + 1;
      });
    });

    stats.mostDiscussedTopics = Object.entries(topicCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([topic]) => topic);

    // 感情の軌跡
    let runningAffection = 0;
    let runningMood = 0;

    stats.emotionalJourney = history.map(entry => {
      runningAffection += entry.emotionChange.affection || 0;
      runningMood += entry.emotionChange.mood || 0;
      
      return {
        turn: entry.turn,
        affection: runningAffection,
        mood: runningMood
      };
    });

    return stats;
  }
}