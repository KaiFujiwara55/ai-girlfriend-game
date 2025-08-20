import { EmotionState, CharacterPersonality, RelationshipStage } from '../types/game.js';

export class EmotionSystem {
  private static readonly EMOTION_BOUNDS = {
    mood: { min: -100, max: 100 },
    trust: { min: 0, max: 100 },
    tension: { min: 0, max: 100 },
    affection: { min: 0, max: 100 },
    interest: { min: 0, max: 100 }
  };

  /**
   * 初期感情状態を作成
   */
  static createInitialEmotionState(): EmotionState {
    return {
      mood: 0,
      trust: 10,
      tension: 20,
      affection: 0,
      interest: 30
    };
  }

  /**
   * 感情値を安全な範囲内に調整
   */
  static clampEmotions(emotions: EmotionState): EmotionState {
    const result: EmotionState = { ...emotions };
    
    for (const [key, bounds] of Object.entries(this.EMOTION_BOUNDS)) {
      const emotionKey = key as keyof EmotionState;
      result[emotionKey] = Math.max(bounds.min, Math.min(bounds.max, result[emotionKey]));
    }
    
    return result;
  }

  /**
   * 感情変化を適用
   */
  static applyEmotionChange(
    currentEmotion: EmotionState,
    change: Partial<EmotionState>,
    character: CharacterPersonality
  ): EmotionState {
    const newEmotion = { ...currentEmotion };
    
    // キャラクターの性格による感情変動の調整
    const profile = character.emotionalProfile;
    
    if (change.mood !== undefined) {
      const adjustedChange = change.mood * (0.5 + profile.moodiness);
      newEmotion.mood += adjustedChange;
    }
    
    if (change.trust !== undefined) {
      const adjustedChange = change.trust * profile.trustingness;
      newEmotion.trust += adjustedChange;
    }
    
    if (change.tension !== undefined) {
      const adjustedChange = change.tension * (0.5 + profile.shyness);
      newEmotion.tension += adjustedChange;
    }
    
    if (change.affection !== undefined) {
      const adjustedChange = change.affection * profile.openness;
      newEmotion.affection += adjustedChange;
    }
    
    if (change.interest !== undefined) {
      newEmotion.interest += change.interest || 0;
    }
    
    return this.clampEmotions(newEmotion);
  }

  /**
   * AIの返答から感情変化を抽出
   */
  static extractEmotionChange(aiResponse: string): Partial<EmotionState> {
    const emotionChange: Partial<EmotionState> = {};
    
    // 各感情タグを正規表現で抽出
    const patterns = {
      mood: /\[MOOD:([+-]?\d+)\]/i,
      trust: /\[TRUST:([+-]?\d+)\]/i,
      tension: /\[TENSION:([+-]?\d+)\]/i,
      affection: /\[AFFECTION:([+-]?\d+)\]/i,
      interest: /\[INTEREST:([+-]?\d+)\]/i
    };
    
    for (const [emotion, pattern] of Object.entries(patterns)) {
      const match = aiResponse.match(pattern);
      if (match && match[1]) {
        const value = parseInt(match[1], 10);
        if (!isNaN(value)) {
          emotionChange[emotion as keyof EmotionState] = value;
        }
      }
    }
    
    // 古い形式のMOODタグもサポート（後方互換性）
    if (!emotionChange.affection) {
      const oldMoodMatch = aiResponse.match(/\[MOOD:([+-]?\d+)\]/i);
      if (oldMoodMatch && oldMoodMatch[1]) {
        const value = parseInt(oldMoodMatch[1], 10);
        if (!isNaN(value)) {
          emotionChange.affection = value;
        }
      }
    }
    
    return emotionChange;
  }

  /**
   * 現在の関係性段階を判定
   */
  static determineRelationshipStage(emotions: EmotionState): RelationshipStage {
    const { trust, affection, tension } = emotions;
    
    if (affection >= 80 && trust >= 70) {
      return 'lover';
    } else if (affection >= 60 && trust >= 60) {
      return 'romantic_interest';
    } else if (affection >= 40 && trust >= 50) {
      return 'close_friend';
    } else if (affection >= 20 && trust >= 30) {
      return 'friend';
    } else if (trust >= 15) {
      return 'acquaintance';
    } else {
      return 'stranger';
    }
  }

  /**
   * 感情状態の可視化文字列を生成
   */
  static visualizeEmotions(emotions: EmotionState): string {
    const getBar = (value: number, max: number) => {
      const normalized = Math.max(0, Math.min(max, value));
      const barLength = 10;
      const filled = Math.round((normalized / max) * barLength);
      return '█'.repeat(filled) + '░'.repeat(barLength - filled);
    };
    
    const getMoodBar = (value: number) => {
      const normalized = (value + 100) / 200; // -100~100 を 0~1 に変換
      const barLength = 10;
      const filled = Math.round(normalized * barLength);
      return '█'.repeat(filled) + '░'.repeat(barLength - filled);
    };
    
    return `
感情状態:
  気分    ${getMoodBar(emotions.mood)} (${emotions.mood.toFixed(0)})
  信頼度  ${getBar(emotions.trust, 100)} (${emotions.trust.toFixed(0)})
  緊張度  ${getBar(emotions.tension, 100)} (${emotions.tension.toFixed(0)})
  好感度  ${getBar(emotions.affection, 100)} (${emotions.affection.toFixed(0)})
  興味度  ${getBar(emotions.interest, 100)} (${emotions.interest.toFixed(0)})`;
  }

  /**
   * 告白成功判定
   */
  static isConfessionSuccessful(
    emotions: EmotionState,
    character: CharacterPersonality
  ): boolean {
    const { affection, trust, tension } = emotions;
    
    // 基本条件：好感度が閾値以上
    if (affection < character.successThreshold) {
      return false;
    }
    
    // 追加条件：信頼度と緊張度のバランス
    const minTrust = character.successThreshold * 0.6; // 閾値の60%以上の信頼度が必要
    const maxTension = 70; // 緊張度が70以下である必要
    
    return trust >= minTrust && tension <= maxTension;
  }

  /**
   * 特定の話題に対する感情反応を計算
   */
  static calculateTopicResponse(
    userInput: string,
    character: CharacterPersonality
  ): Partial<EmotionState> {
    const response: Partial<EmotionState> = {};
    
    for (const topic of character.topicReactions) {
      const foundKeywords = topic.keywords.filter(keyword =>
        userInput.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (foundKeywords.length > 0) {
        // キーワードが見つかった場合の反応
        const intensity = foundKeywords.length / topic.keywords.length;
        const baseChange = intensity > 0.5 ? topic.positiveResponse : topic.negativeResponse;
        
        // 話題に応じて異なる感情に影響
        switch (topic.category) {
          case '家族':
          case '優しさ・思いやり':
            response.affection = (response.affection || 0) + baseChange;
            response.trust = (response.trust || 0) + Math.max(0, baseChange * 0.5);
            break;
            
          case '学習・知識':
          case '科学・学術':
            response.interest = (response.interest || 0) + baseChange;
            response.affection = (response.affection || 0) + baseChange * 0.7;
            break;
            
          case '競争・対立':
          case '感情論':
            response.mood = (response.mood || 0) + baseChange;
            response.tension = (response.tension || 0) + Math.abs(baseChange);
            break;
            
          default:
            response.affection = (response.affection || 0) + baseChange;
        }
      }
    }
    
    return response;
  }
}