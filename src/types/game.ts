// ゲームの基本型定義
export type Difficulty = 'easy' | 'medium' | 'hard';

export type RelationshipStage = 'stranger' | 'acquaintance' | 'friend' | 'close_friend' | 'romantic_interest' | 'lover';

export interface EmotionState {
  mood: number;        // 気分 (-100 to 100)
  trust: number;       // 信頼度 (0 to 100)
  tension: number;     // 緊張度 (0 to 100)
  affection: number;   // 好感度 (0 to 100)
  interest: number;    // 興味度 (0 to 100)
}

export interface ConversationTopic {
  category: string;
  keywords: string[];
  positiveResponse: number;
  negativeResponse: number;
}

export interface CharacterPersonality {
  // 基本情報
  name: string;
  age: number;
  difficulty: Difficulty;
  
  // 性格特性
  traits: string[];
  values: string[];
  background: string;
  speechPattern: string;
  
  // 興味・関心
  interests: string[];
  dislikes: string[];
  hobbies: string[];
  
  // ゲーム設定
  successThreshold: number;
  emotionalProfile: {
    moodiness: number;      // 気分の変動しやすさ
    trustingness: number;   // 信頼しやすさ
    shyness: number;        // 恥ずかしがり度
    openness: number;       // 心の開きやすさ
  };
  
  // 話題別反応パターン
  topicReactions: ConversationTopic[];
}

export interface GameState {
  character: CharacterPersonality;
  relationshipStage: RelationshipStage;
  emotionState: EmotionState;
  conversationHistory: ConversationEntry[];
  gameProgress: {
    turnCount: number;
    startTime: Date;
    specialEvents: string[];
    confessionAttempted?: boolean;
    confessionSuccessful?: boolean;
    failedConfessions?: number;
  };
}

export interface ConversationEntry {
  turn: number;
  userInput: string;
  aiResponse: string;
  emotionChange: Partial<EmotionState>;
  timestamp: Date;
  detectedTopics: string[];
}

export interface GameConfig {
  aiProvider: string;
  model?: string;
  maxConversationHistory: number;
  autoSave: boolean;
  debugMode: boolean;
}