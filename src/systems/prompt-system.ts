import { CharacterPersonality, EmotionState, RelationshipStage, ConversationEntry } from '../types/game.js';

export interface PromptContext {
  character: CharacterPersonality;
  emotionState: EmotionState;
  relationshipStage: RelationshipStage;
  conversationHistory: ConversationEntry[];
  userInput: string;
  turnCount: number;
}

export class PromptSystem {
  
  /**
   * メインプロンプトを生成
   */
  static generatePrompt(context: PromptContext): string {
    const {
      character,
      emotionState,
      relationshipStage,
      conversationHistory,
      userInput,
      turnCount
    } = context;

    // 基本キャラクター設定部分
    const characterSection = this.buildCharacterSection(character);
    
    // 現在の状況・感情状態部分
    const situationSection = this.buildSituationSection(emotionState, relationshipStage, turnCount);
    
    // 会話履歴・コンテキスト部分
    const historySection = this.buildHistorySection(conversationHistory);
    
    // 関係性段階に応じた行動指針
    const guidanceSection = this.buildGuidanceSection(relationshipStage, character);
    
    // 感情表現ルール
    const emotionRulesSection = this.buildEmotionRulesSection();
    
    // 応答の長さ制御
    const responseLengthGuidance = this.buildResponseLengthGuidance(userInput);

    return `${characterSection}

${situationSection}

${historySection}

${guidanceSection}

${emotionRulesSection}

${responseLengthGuidance}

# 重要な指示
- あなたは${character.name}として一貫して振る舞ってください
- ${character.name}の性格、価値観、口調を必ず反映してください
- 返答には必ず感情変化タグを含めてください
- 自然で魅力的な会話を心がけてください
- 相手の発言に対して${character.name}らしい反応を示してください

ユーザーの発言: "${userInput}"

${character.name}として、上記の発言に応答してください:`;
  }

  /**
   * キャラクター設定セクション
   */
  private static buildCharacterSection(character: CharacterPersonality): string {
    return `# キャラクター設定
## 基本情報
- 名前: ${character.name}
- 年齢: ${character.age}歳
- 性格特性: ${character.traits.join('、')}

## 人物像
${character.background}

## 価値観・信念
${character.values.map(value => `- ${value}`).join('\n')}

## 話し方の特徴
${character.speechPattern}

## 興味・関心
好きなもの: ${character.interests.join('、')}
苦手なもの: ${character.dislikes.join('、')}
趣味: ${character.hobbies.join('、')}`;
  }

  /**
   * 現在の状況セクション
   */
  private static buildSituationSection(
    emotionState: EmotionState,
    relationshipStage: RelationshipStage,
    turnCount: number
  ): string {
    const relationshipDescription = this.getRelationshipDescription(relationshipStage);
    
    return `# 現在の状況
## 関係性
${relationshipDescription}

## 現在の感情状態
- 気分: ${this.getEmotionDescription('mood', emotionState.mood)}
- 信頼度: ${this.getEmotionDescription('trust', emotionState.trust)}
- 緊張度: ${this.getEmotionDescription('tension', emotionState.tension)}
- 好感度: ${this.getEmotionDescription('affection', emotionState.affection)}
- 興味度: ${this.getEmotionDescription('interest', emotionState.interest)}

## 会話の進行
これは${turnCount}回目の発言です。`;
  }

  /**
   * 会話履歴セクション
   */
  private static buildHistorySection(conversationHistory: ConversationEntry[]): string {
    if (conversationHistory.length === 0) {
      return `# 会話履歴
これが最初の会話です。初対面としての反応を心がけてください。`;
    }

    const recentHistory = conversationHistory.slice(-3); // 最新3回分
    const historyText = recentHistory.map(entry => 
      `ユーザー: "${entry.userInput}"\nあなたの返答: "${entry.aiResponse}"`
    ).join('\n\n');

    const mentionedTopics = this.extractMentionedTopics(conversationHistory);
    
    return `# 会話履歴
## 最近の会話 (最新3回分)
${historyText}

## これまでに話題に上がったこと
${mentionedTopics.length > 0 ? mentionedTopics.join('、') : 'まだ特定の話題は出ていません'}

## 継続性への注意
これまでの会話内容と矛盾しないように気をつけてください。`;
  }

  /**
   * 関係性段階別ガイダンス
   */
  private static buildGuidanceSection(
    relationshipStage: RelationshipStage,
    character: CharacterPersonality
  ): string {
    const stageGuidance = this.getStageGuidance(relationshipStage, character);
    
    return `# 行動指針
## 現在の関係性段階での振る舞い
${stageGuidance}

## ${character.name}としての反応パターン
${this.getCharacterSpecificGuidance(character)}`;
  }

  /**
   * 感情表現ルール
   */
  private static buildEmotionRulesSection(): string {
    return `# 感情表現ルール
## 必須タグ
返答の中に以下のタグを自然に含めてください（複数可）:
- [MOOD:±数値] - 気分の変化 (-10〜+10)
- [TRUST:±数値] - 信頼度の変化 (0〜+10)
- [TENSION:±数値] - 緊張度の変化 (-10〜+10、マイナスはリラックス)
- [AFFECTION:±数値] - 好感度の変化 (-5〜+10)
- [INTEREST:±数値] - 興味度の変化 (-5〜+10)

## 特殊イベントタグ
- [CONFESSION_DETECTED] - ユーザーから明確な告白を受けた場合のみ使用

## 告白の判定基準
以下のような明確な恋愛感情の表現があった場合にのみ[CONFESSION_DETECTED]タグを使用:
- 「君が好き」「あなたが好き」などの直接的な好意の表明
- 「付き合って」「恋人になって」などの交際の申し込み
- 「愛してる」などの愛の告白

以下は告白として扱わない:
- 「料理が好き」「音楽が好き」など対象物への好意
- 「好きかも」「気になる」などの曖昧な表現
- 友人としての好意の表現

## タグの使用例
"そうなんだ…すごいね [MOOD:+3] [INTEREST:+2]"
"え、そんなことないよ！[TENSION:+2] [AFFECTION:+1]"
"え…！今、なんて…？[CONFESSION_DETECTED] [TENSION:+5] [AFFECTION:+3]"`;
  }

  private static buildResponseLengthGuidance(userInput: string): string {
    const inputLength = userInput.length;
    let guidance = '# 応答の長さ\n';
    
    if (inputLength <= 10) {
      guidance += '- ユーザーの入力が短いため、1-2文で簡潔に応答してください\n';
      guidance += '- 自然な相槌や短い反応を心がけてください';
    } else if (inputLength <= 30) {
      guidance += '- 2-3文程度の標準的な長さで応答してください\n';
      guidance += '- 会話のキャッチボールを意識してください';
    } else {
      guidance += '- ユーザーが詳しく話しているため、3-4文で丁寧に応答してください\n';
      guidance += '- 相手の話題に深く共感し、会話を発展させてください';
    }
    
    return guidance;
  }

  /**
   * 感情の説明文を生成
   */
  private static getEmotionDescription(emotion: string, value: number): string {
    switch (emotion) {
      case 'mood':
        if (value > 50) return `とても良い (${value})`;
        if (value > 20) return `良い (${value})`;
        if (value > -20) return `普通 (${value})`;
        if (value > -50) return `少し悪い (${value})`;
        return `悪い (${value})`;
      
      case 'trust':
        if (value > 80) return `深く信頼している (${value})`;
        if (value > 60) return `信頼している (${value})`;
        if (value > 40) return `ある程度信頼 (${value})`;
        if (value > 20) return `様子見 (${value})`;
        return `警戒している (${value})`;
      
      case 'tension':
        if (value > 80) return `とても緊張 (${value})`;
        if (value > 60) return `緊張している (${value})`;
        if (value > 40) return `少し緊張 (${value})`;
        if (value > 20) return `リラックス (${value})`;
        return `とてもリラックス (${value})`;
      
      case 'affection':
        if (value > 80) return `とても好き (${value})`;
        if (value > 60) return `好き (${value})`;
        if (value > 40) return `親しみを感じる (${value})`;
        if (value > 20) return `好印象 (${value})`;
        return `普通 (${value})`;
      
      case 'interest':
        if (value > 80) return `とても興味深い (${value})`;
        if (value > 60) return `興味がある (${value})`;
        if (value > 40) return `関心がある (${value})`;
        if (value > 20) return `少し興味 (${value})`;
        return `あまり興味なし (${value})`;
      
      default:
        return `${value}`;
    }
  }

  /**
   * 関係性の説明
   */
  private static getRelationshipDescription(stage: RelationshipStage): string {
    switch (stage) {
      case 'stranger':
        return '初対面または最初の段階。警戒心があり、距離を置いた態度。';
      case 'acquaintance':
        return '知り合い程度。少し打ち解けてきたが、まだ表面的な関係。';
      case 'friend':
        return '友達として認識。ある程度の信頼関係があり、自然に会話できる。';
      case 'close_friend':
        return '親しい友人。お互いを理解し合い、個人的な話もできる関係。';
      case 'romantic_interest':
        return '恋愛感情を意識し始めた段階。特別な存在として見ている。';
      case 'lover':
        return '恋人関係。深い愛情と信頼で結ばれた特別な関係。';
    }
  }

  /**
   * 関係性段階別の指針
   */
  private static getStageGuidance(stage: RelationshipStage, character: CharacterPersonality): string {
    const baseGuidance = this.getBaseStageGuidance(stage);
    const characterSpecific = this.getCharacterStageGuidance(stage, character);
    
    return `${baseGuidance}\n\n${character.name}の性格を考慮した振る舞い:\n${characterSpecific}`;
  }

  private static getBaseStageGuidance(stage: RelationshipStage): string {
    switch (stage) {
      case 'stranger':
        return '- 丁寧で少し距離のある態度\n- 個人的な情報は控えめに\n- 相手を探るような質問や反応';
      case 'acquaintance':
        return '- 徐々に打ち解けた態度\n- 基本的な個人情報は共有OK\n- まだ深い話題は避ける傾向';
      case 'friend':
        return '- 自然で親しみやすい態度\n- ある程度の個人的な話もOK\n- 相手のことを気にかける反応';
      case 'close_friend':
        return '- 親密で信頼できる関係性を表現\n- 個人的な悩みや秘密も共有\n- 相手のことを深く理解しようとする';
      case 'romantic_interest':
        return '- 特別感のある態度\n- 恋愛的な緊張や意識を表現\n- 相手の気持ちを確かめるような発言';
      case 'lover':
        return '- 愛情深く特別な関係性を表現\n- 深い絆と理解を示す\n- 将来的な話題も自然に出る';
    }
  }

  private static getCharacterStageGuidance(stage: RelationshipStage, character: CharacterPersonality): string {
    // キャラクター別の段階的振る舞いの詳細はここに実装
    // 各キャラクターの性格に応じてカスタマイズ
    switch (character.name) {
      case 'さくら':
        return this.getSakuraStageGuidance(stage);
      case 'あや':
        return this.getAyaStageGuidance(stage);
      case 'みさき':
        return this.getMisakiStageGuidance(stage);
      default:
        return '';
    }
  }

  private static getSakuraStageGuidance(stage: RelationshipStage): string {
    switch (stage) {
      case 'stranger':
        return 'さくらは人見知りしつつも、持ち前の優しさで温かく接する';
      case 'friend':
        return 'さくらは家族のような親しみやすさを見せ、料理や家庭的な話題を好む';
      case 'romantic_interest':
        return 'さくらは恥ずかしがりながらも素直に気持ちを表現し、将来への憧れを示す';
      default:
        return '';
    }
  }

  private static getAyaStageGuidance(stage: RelationshipStage): string {
    switch (stage) {
      case 'stranger':
        return 'あやはツンデレを発揮し、興味があっても素直になれない';
      case 'friend':
        return 'あやは時々デレを見せるようになり、知的な話題で打ち解ける';
      case 'romantic_interest':
        return 'あやのツンデレが激しくなり、「別に」「たまたま」などの言い訳が増える';
      default:
        return '';
    }
  }

  private static getMisakiStageGuidance(stage: RelationshipStage): string {
    switch (stage) {
      case 'stranger':
        return 'みさきは論理的で冷静な態度を保ち、相手を観察・分析する';
      case 'friend':
        return 'みさきは知的な議論を楽しみ、相手の思考力に興味を示す';
      case 'romantic_interest':
        return 'みさきは感情と論理の間で混乱し、普段とは違う一面を少し見せる';
      default:
        return '';
    }
  }

  private static getCharacterSpecificGuidance(character: CharacterPersonality): string {
    return `- ${character.name}の口調: ${character.speechPattern}
- 興味を示す話題: ${character.interests.slice(0, 3).join('、')}
- 避ける傾向の話題: ${character.dislikes.slice(0, 2).join('、')}
- 感情の変動パターン: ${this.getEmotionalPattern(character)}`;
  }

  private static getEmotionalPattern(character: CharacterPersonality): string {
    const profile = character.emotionalProfile;
    const patterns = [];
    
    if (profile.moodiness > 0.6) patterns.push('気分の変動が大きい');
    if (profile.trustingness > 0.6) patterns.push('人を信頼しやすい');
    if (profile.shyness > 0.6) patterns.push('恥ずかしがりやすい');
    if (profile.openness < 0.4) patterns.push('心を開くのに時間がかかる');
    
    return patterns.join('、') || '感情が安定している';
  }

  private static extractMentionedTopics(history: ConversationEntry[]): string[] {
    const topics = new Set<string>();
    history.forEach(entry => {
      entry.detectedTopics.forEach(topic => topics.add(topic));
    });
    return Array.from(topics);
  }
}