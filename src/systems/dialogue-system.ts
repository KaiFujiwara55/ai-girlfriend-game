import { CharacterPersonality, RelationshipStage, EmotionState } from '../types/game.js';

export interface DialoguePattern {
  situation: string;
  stage: RelationshipStage;
  emotionCondition?: Partial<EmotionState>;
  patterns: string[];
}

export class DialogueSystem {
  
  /**
   * キャラクター別の特殊セリフパターンを取得
   */
  static getSpecialDialoguePatterns(character: CharacterPersonality): DialoguePattern[] {
    switch (character.name) {
      case 'さくら':
        return this.getSakuraDialoguePatterns();
      case 'あや':
        return this.getAyaDialoguePatterns();
      case 'みさき':
        return this.getMisakiDialoguePatterns();
      default:
        return [];
    }
  }

  /**
   * さくらのセリフパターン
   */
  private static getSakuraDialoguePatterns(): DialoguePattern[] {
    return [
      {
        situation: 'greeting',
        stage: 'stranger',
        patterns: [
          'あ、こんにちは！初めまして、さくらです [MOOD:+2] [TENSION:+3]',
          'えっと...こんにちは。あの、私さくらって言います [MOOD:+1] [TENSION:+4]',
          'こんにちは！よろしくお願いします♪ [MOOD:+3] [AFFECTION:+1]'
        ]
      },
      {
        situation: 'praise',
        stage: 'friend',
        patterns: [
          'えへへ...ありがとう！嬉しいな [MOOD:+5] [AFFECTION:+3] [TRUST:+2]',
          'そんなことないよ〜でも、そう言ってくれると嬉しい♪ [MOOD:+4] [AFFECTION:+4]',
          'わあ、本当？ありがとう！ [MOOD:+6] [AFFECTION:+2] [INTEREST:+1]'
        ]
      },
      {
        situation: 'cooking_topic',
        stage: 'friend',
        patterns: [
          'お料理の話？大好き！今度一緒に作りませんか？ [MOOD:+4] [AFFECTION:+3] [INTEREST:+5]',
          'えっと...手作りのお菓子とか、作ってみたいです [MOOD:+3] [AFFECTION:+2] [INTEREST:+4]',
          'お母さんに教えてもらったレシピがあるんです♪ [MOOD:+5] [TRUST:+2] [INTEREST:+3]'
        ]
      },
      {
        situation: 'confession_approach',
        stage: 'romantic_interest',
        emotionCondition: { affection: 60 },
        patterns: [
          'えっ...私も...実は... [MOOD:+3] [TENSION:+8] [AFFECTION:+5]',
          'そんな風に思ってくれてたんですね...嬉しいです [MOOD:+5] [AFFECTION:+7] [TRUST:+3]',
          'わあ...どうしよう、心臓がどきどきして... [TENSION:+10] [AFFECTION:+6] [MOOD:+4]'
        ]
      }
    ];
  }

  /**
   * あやのセリフパターン
   */
  private static getAyaDialoguePatterns(): DialoguePattern[] {
    return [
      {
        situation: 'greeting',
        stage: 'stranger',
        patterns: [
          'あ...あや、よ。別に自己紹介したくてしたわけじゃないからね [MOOD:-1] [TENSION:+5]',
          'あやです...まあ、よろしく [MOOD:+0] [TENSION:+3]',
          '...あや。それだけよ [MOOD:-2] [TENSION:+4]'
        ]
      },
      {
        situation: 'praise',
        stage: 'friend',
        patterns: [
          'べ、別にあんたに褒められても嬉しくなんか...ちょっとだけよ [MOOD:+3] [AFFECTION:+4] [TENSION:+6]',
          '当然でしょ？私を誰だと思ってるのよ [MOOD:+2] [AFFECTION:+2] [TRUST:+1]',
          'ふん...まあ、悪い気はしないわね [MOOD:+4] [AFFECTION:+3] [TENSION:+3]'
        ]
      },
      {
        situation: 'study_topic',
        stage: 'friend',
        patterns: [
          'あんたも勉強してるのね...まあ、悪くないわ [MOOD:+2] [INTEREST:+4] [AFFECTION:+1]',
          '勉強は大切よ。努力しない人は嫌いなの [MOOD:+1] [INTEREST:+3] [TRUST:+2]',
          'へえ...まあまあね。でももっと頑張りなさい [MOOD:+0] [INTEREST:+2] [AFFECTION:+1]'
        ]
      },
      {
        situation: 'confession_approach',
        stage: 'romantic_interest',
        emotionCondition: { affection: 75 },
        patterns: [
          'え...えええ！？な、何よそれ...べ、別に... [MOOD:+5] [TENSION:+15] [AFFECTION:+8]',
          'は...？あんた何言って...バカじゃないの...でも... [MOOD:+4] [TENSION:+12] [AFFECTION:+6]',
          'ちょ...ちょっと待ちなさいよ！突然そんなこと... [TENSION:+18] [AFFECTION:+7] [MOOD:+3]'
        ]
      },
      {
        situation: 'tsundere_moment',
        stage: 'close_friend',
        patterns: [
          'べ、別にあんたのことなんて...でも、まあ... [MOOD:+2] [AFFECTION:+3] [TENSION:+7]',
          'ふん！あんたってほんとバカね...でも嫌いじゃないわ [MOOD:+3] [AFFECTION:+4] [TENSION:+5]',
          '...たまにはいいこと言うじゃない [MOOD:+4] [AFFECTION:+2] [TRUST:+2]'
        ]
      }
    ];
  }

  /**
   * みさきのセリフパターン
   */
  private static getMisakiDialoguePatterns(): DialoguePattern[] {
    return [
      {
        situation: 'greeting',
        stage: 'stranger',
        patterns: [
          '初めまして。みさきと申します。よろしくお願いいたします [MOOD:+0] [TENSION:+1]',
          'こんにちは。私はみさきです [MOOD:+1] [TRUST:+1]',
          'みさきです。お会いできて光栄です [MOOD:+2] [INTEREST:+2]'
        ]
      },
      {
        situation: 'intellectual_topic',
        stage: 'friend',
        patterns: [
          '興味深いですね。その観点は考えていませんでした [MOOD:+3] [INTEREST:+6] [AFFECTION:+2]',
          'なるほど、論理的な思考ですね。私も同感です [MOOD:+4] [INTEREST:+5] [TRUST:+3]',
          'その件については私も研究したことがあります [MOOD:+2] [INTEREST:+7] [AFFECTION:+1]'
        ]
      },
      {
        situation: 'emotional_topic',
        stage: 'close_friend',
        patterns: [
          '感情的な話題は...少し苦手ですが、理解しようと思います [MOOD:+1] [TRUST:+2] [TENSION:+3]',
          'そうですね...感情について論理的に分析するのは難しいものです [MOOD:+2] [INTEREST:+3] [AFFECTION:+1]',
          '私には感情的な表現は難しいですが...あなたとの時間は有意義です [MOOD:+3] [AFFECTION:+4] [TRUST:+2]'
        ]
      },
      {
        situation: 'confession_approach',
        stage: 'romantic_interest',
        emotionCondition: { affection: 90 },
        patterns: [
          'それは...論理的に分析すると...でも、私の感情が... [MOOD:+2] [TENSION:+8] [AFFECTION:+5]',
          '予期していませんでした。私の計算では...しかし心拍数が... [MOOD:+3] [TENSION:+10] [AFFECTION:+6]',
          'これは...感情と理性の間で矛盾が生じています... [MOOD:+4] [TENSION:+12] [AFFECTION:+7]'
        ]
      },
      {
        situation: 'rare_emotion',
        stage: 'lover',
        patterns: [
          'あなたといると...論理では説明できない感情を覚えます [MOOD:+5] [AFFECTION:+8] [TRUST:+4]',
          '不思議です...あなたのことを考えると、いつもと違う自分が... [MOOD:+6] [AFFECTION:+9] [TENSION:+2]',
          'これが恋という感情なのでしょうか...研究対象として興味深いです [MOOD:+4] [AFFECTION:+7] [INTEREST:+3]'
        ]
      }
    ];
  }

  /**
   * 状況に応じた適切なセリフパターンを選択
   */
  static selectAppropriateDialogue(
    character: CharacterPersonality,
    situation: string,
    stage: RelationshipStage,
    emotionState: EmotionState
  ): string | null {
    const patterns = this.getSpecialDialoguePatterns(character);
    
    const matchingPatterns = patterns.filter(pattern => {
      // 状況と段階がマッチするかチェック
      if (pattern.situation !== situation || pattern.stage !== stage) {
        return false;
      }
      
      // 感情条件がある場合はチェック
      if (pattern.emotionCondition) {
        for (const [emotion, threshold] of Object.entries(pattern.emotionCondition)) {
          const currentValue = emotionState[emotion as keyof EmotionState];
          if (currentValue < threshold) {
            return false;
          }
        }
      }
      
      return true;
    });

    if (matchingPatterns.length === 0) {
      return null;
    }

    // ランダムに一つのパターンを選択
    const selectedPattern = matchingPatterns[Math.floor(Math.random() * matchingPatterns.length)];
    const selectedDialogue = selectedPattern.patterns[Math.floor(Math.random() * selectedPattern.patterns.length)];
    
    return selectedDialogue;
  }

  /**
   * 告白時の特別なセリフを生成
   */
  static generateConfessionResponse(
    character: CharacterPersonality,
    emotionState: EmotionState,
    isSuccess: boolean
  ): string {
    if (isSuccess) {
      return this.getSuccessConfessionResponse(character, emotionState);
    } else {
      return this.getFailureConfessionResponse(character, emotionState);
    }
  }

  private static getSuccessConfessionResponse(character: CharacterPersonality, emotionState: EmotionState): string {
    switch (character.name) {
      case 'さくら':
        return [
          '私も...ずっとそう思ってたの！嬉しいです♪ [MOOD:+10] [AFFECTION:+15] [TRUST:+5]',
          'えへへ...実は私もあなたのこと、好きだったんです [MOOD:+12] [AFFECTION:+20] [TENSION:+5]',
          'わあ...夢みたい！私たち、お付き合いできるんですね♪ [MOOD:+15] [AFFECTION:+18] [TRUST:+8]'
        ][Math.floor(Math.random() * 3)];
        
      case 'あや':
        return [
          'ば...バカね！そんなの...当然でしょ？ずっと待ってたんだから [MOOD:+8] [AFFECTION:+18] [TENSION:+10]',
          'ふん！やっと気づいたのね...べ、別に嬉しくなんか...嘘よ、すっごく嬉しい [MOOD:+10] [AFFECTION:+20] [TRUST:+5]',
          '遅すぎるのよ！でも...まあ、付き合ってあげるわ [MOOD:+9] [AFFECTION:+16] [TENSION:+8]'
        ][Math.floor(Math.random() * 3)];
        
      case 'みさき':
        return [
          'これが恋愛感情の相互作用というものですね...はい、お受けします [MOOD:+6] [AFFECTION:+15] [TRUST:+10]',
          '論理的に考えて、私たちは相性が良いと思います...はい [MOOD:+7] [AFFECTION:+18] [INTEREST:+5]',
          'あなたとなら...感情的な体験も悪くないかもしれません [MOOD:+8] [AFFECTION:+16] [TRUST:+8]'
        ][Math.floor(Math.random() * 3)];
        
      default:
        return '私も同じ気持ちです...よろしくお願いします [MOOD:+10] [AFFECTION:+15] [TRUST:+5]';
    }
  }

  private static getFailureConfessionResponse(character: CharacterPersonality, emotionState: EmotionState): string {
    switch (character.name) {
      case 'さくら':
        return [
          'ごめんなさい...まだ心の準備ができていなくて... [MOOD:-3] [TENSION:+8] [TRUST:+2]',
          'えっと...嬉しいんですが、もう少し時間をください [MOOD:-1] [AFFECTION:+2] [TENSION:+5]',
          'すみません...今はまだ、お返事できません... [MOOD:-4] [TENSION:+10] [TRUST:+1]'
        ][Math.floor(Math.random() * 3)];
        
      case 'あや':
        return [
          'は...？何よ突然...まだそんな気持ちには... [MOOD:-2] [TENSION:+12] [AFFECTION:-1]',
          'バカじゃないの？私がそんな簡単に... [MOOD:-5] [TENSION:+8] [AFFECTION:-2]',
          'ちょっと...まだ早いわよ。そんなに簡単じゃないの [MOOD:-3] [TENSION:+10] [TRUST:+1]'
        ][Math.floor(Math.random() * 3)];
        
      case 'みさき':
        return [
          '申し訳ありませんが、まだその段階には至っていないと分析します [MOOD:-1] [TENSION:+5] [INTEREST:+2]',
          '論理的に考えて、時期尚早だと思われます [MOOD:-2] [TENSION:+3] [TRUST:+1]',
          'その感情は理解しますが、私にはまだ対応する準備が... [MOOD:-3] [TENSION:+8] [AFFECTION:+1]'
        ][Math.floor(Math.random() * 3)];
        
      default:
        return 'ごめんなさい...まだそういう気持ちには... [MOOD:-2] [TENSION:+5] [TRUST:+1]';
    }
  }
}