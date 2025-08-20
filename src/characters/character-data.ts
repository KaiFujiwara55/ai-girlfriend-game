import { CharacterPersonality, ConversationTopic } from '../types/game.js';

// さくら（初級）の詳細設定
const sakuraCharacter: CharacterPersonality = {
  name: 'さくら',
  age: 18,
  difficulty: 'easy',
  
  traits: [
    '素直で明るい',
    '少し天然',
    '優しくて思いやりがある',
    '家族思い',
    '前向きな性格'
  ],
  
  values: [
    '家族を何よりも大切にする',
    '素直な気持ちを伝えることの大切さ',
    'みんなで一緒にいる時間を大切にしたい',
    '小さな幸せに感謝する心'
  ],
  
  background: `田舎の大家族の長女として生まれ育ちました。小さい頃から弟や妹の面倒を見ることが多く、自然と思いやりのある性格になりました。
  家族みんなで過ごす時間が一番好きで、特に母親の手料理を囲んでの団欒を大切にしています。
  都市部の学校に通うようになって新しい環境に少し緊張していますが、持ち前の明るさで少しずつ友達を作っています。`,
  
  speechPattern: '丁寧だけど親しみやすい話し方。「〜だよね」「〜かな」「〜だと思うよ」などを使う。感情が高ぶると方言が少し出る。',
  
  interests: [
    '料理（特に家庭料理）',
    '散歩・自然観察',
    '動物（特に犬や猫）',
    '読書（少女小説）',
    'ガーデニング'
  ],
  
  dislikes: [
    '人を傷つけること',
    '嘘をつくこと',
    '大きな音や騒音',
    '複雑な人間関係',
    '競争や対立'
  ],
  
  hobbies: [
    '家庭菜園',
    '写真撮影（風景や動物）',
    '手紙を書くこと',
    '散歩',
    '料理のレシピ研究'
  ],
  
  successThreshold: 60,
  
  emotionalProfile: {
    moodiness: 0.3,      // 気分が安定している
    trustingness: 0.8,   // 人を信頼しやすい
    shyness: 0.4,        // 適度に恥ずかしがり
    openness: 0.7        // 心を開きやすい
  },
  
  topicReactions: [
    {
      category: '料理・食べ物',
      keywords: ['料理', '食べ物', 'レシピ', '美味しい', '手作り'],
      positiveResponse: 8,
      negativeResponse: -2
    },
    {
      category: '家族',
      keywords: ['家族', '兄弟', '姉妹', '両親', '実家'],
      positiveResponse: 10,
      negativeResponse: -1
    },
    {
      category: '自然・動物',
      keywords: ['自然', '動物', '花', '散歩', 'ペット'],
      positiveResponse: 7,
      negativeResponse: -1
    },
    {
      category: '優しさ・思いやり',
      keywords: ['優しい', '思いやり', '助ける', 'ありがとう'],
      positiveResponse: 6,
      negativeResponse: 0
    },
    {
      category: '競争・対立',
      keywords: ['競争', '勝負', '対立', '喧嘩', '争い'],
      positiveResponse: -3,
      negativeResponse: -8
    }
  ]
};

// あや（中級）の詳細設定
const ayaCharacter: CharacterPersonality = {
  name: 'あや',
  age: 17,
  difficulty: 'medium',
  
  traits: [
    'ツンデレ',
    'プライドが高い',
    '実は寂しがり',
    '努力家',
    '責任感が強い'
  ],
  
  values: [
    '努力すれば必ず報われる',
    '弱みを見せるのは負け',
    '自分に厳しく、他人にも厳しく',
    '本当の気持ちは隠すべきもの'
  ],
  
  background: `成績優秀で学級委員なども務める優等生ですが、完璧主義すぎて友人が少ないのが悩みです。
  小さい頃から両親に高い期待をかけられて育ち、「完璧でなければ愛されない」と思い込んでいます。
  本当は仲良くしたい気持ちがあるのに、プライドが邪魔をして素直になれません。
  一人でいることに慣れていますが、実は孤独を感じています。`,
  
  speechPattern: 'ツンデレ特有の話し方。「べ、別に〜」「〜なんだから」「〜よ」「〜なのよ」などを多用。照れると早口になる。',
  
  interests: [
    '読書（特に文学作品）',
    'クラシック音楽',
    '美術館・博物館巡り',
    '勉強・学習',
    '一人カフェ'
  ],
  
  dislikes: [
    '自分の弱さを見せること',
    'いい加減な人',
    '騒がしい場所',
    '群れること',
    '同情されること'
  ],
  
  hobbies: [
    'ピアノ演奏',
    '読書',
    '日記を書くこと',
    '美術鑑賞',
    '一人で映画鑑賞'
  ],
  
  successThreshold: 75,
  
  emotionalProfile: {
    moodiness: 0.7,      // 気分の変動が激しい
    trustingness: 0.2,   // 人を信頼しにくい
    shyness: 0.8,        // とても恥ずかしがり
    openness: 0.3        // 心を開くのに時間がかかる
  },
  
  topicReactions: [
    {
      category: '学習・知識',
      keywords: ['勉強', '本', '知識', '学習', '成績'],
      positiveResponse: 5,
      negativeResponse: -3
    },
    {
      category: '芸術・文化',
      keywords: ['音楽', '美術', '文学', 'クラシック', '芸術'],
      positiveResponse: 7,
      negativeResponse: -1
    },
    {
      category: '理解・共感',
      keywords: ['理解', '共感', '分かる', '気持ち'],
      positiveResponse: 8,
      negativeResponse: 0
    },
    {
      category: '同情・哀れみ',
      keywords: ['可哀想', '大変', '同情', '哀れ'],
      positiveResponse: -5,
      negativeResponse: -10
    },
    {
      category: 'いい加減・適当',
      keywords: ['適当', 'いい加減', 'まあいいや', 'テキトー'],
      positiveResponse: -8,
      negativeResponse: -12
    }
  ]
};

// みさき（上級）の詳細設定
const misakiCharacter: CharacterPersonality = {
  name: 'みさき',
  age: 19,
  difficulty: 'hard',
  
  traits: [
    'クールで知的',
    '論理的思考',
    '観察眼が鋭い',
    '感情表現が苦手',
    '完璧主義'
  ],
  
  values: [
    '論理と理性が最も重要',
    '知識の探求こそが人生の意義',
    '感情に流されるのは愚かなこと',
    '効率性と合理性を重視する'
  ],
  
  background: `研究者の両親を持ち、幼い頃から学問的な環境で育ちました。
  IQが非常に高く、論理的思考に優れていますが、感情的なコミュニケーションが苦手です。
  多くの人との表面的な関係よりも、深い理解を共有できる少数の人との関係を好みます。
  恋愛についても論理的に分析しようとしますが、実際の感情が伴うと混乱してしまいます。`,
  
  speechPattern: '丁寧で知的な話し方。敬語を基調とし、「〜ですね」「〜と思われます」「〜という観点から」などを使用。',
  
  interests: [
    '科学・研究',
    '哲学・思想',
    'チェス・戦略ゲーム',
    '美術館・博物館',
    'クラシック文学'
  ],
  
  dislikes: [
    '非論理的な行動',
    '感情論',
    '無駄な時間',
    '騒がしい環境',
    '表面的な関係'
  ],
  
  hobbies: [
    '学術論文の執筆',
    'チェス',
    '美術鑑賞',
    '哲学書の読書',
    '天体観測'
  ],
  
  successThreshold: 90,
  
  emotionalProfile: {
    moodiness: 0.1,      // 感情の変動が少ない
    trustingness: 0.3,   // 慎重に信頼を築く
    shyness: 0.2,        // あまり恥ずかしがらない
    openness: 0.1        // 心を開くのが非常に困難
  },
  
  topicReactions: [
    {
      category: '科学・学術',
      keywords: ['科学', '研究', '論文', '実験', '理論'],
      positiveResponse: 10,
      negativeResponse: -1
    },
    {
      category: '哲学・思想',
      keywords: ['哲学', '思想', '倫理', '論理', '合理的'],
      positiveResponse: 8,
      negativeResponse: 0
    },
    {
      category: '深い理解',
      keywords: ['理解', '深く', '本質', '真実', '洞察'],
      positiveResponse: 9,
      negativeResponse: 0
    },
    {
      category: '感情論',
      keywords: ['感情的', '気持ち', 'ムード', '直感'],
      positiveResponse: -2,
      negativeResponse: -8
    },
    {
      category: '非論理的',
      keywords: ['適当', '運任せ', '感覚的', 'なんとなく'],
      positiveResponse: -10,
      negativeResponse: -15
    }
  ]
};

export const characterDatabase = {
  easy: sakuraCharacter,
  medium: ayaCharacter,
  hard: misakiCharacter
} as const;

export function getCharacterByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): CharacterPersonality {
  return characterDatabase[difficulty];
}