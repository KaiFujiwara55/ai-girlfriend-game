// AIプロバイダーの抽象化インターface
export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIProviderConfig {
  apiKey: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  [key: string]: any; // プロバイダー固有の設定
}

export interface AIProvider {
  name: string;
  
  /**
   * メッセージを送信してAIからの応答を取得
   */
  chat(messages: AIMessage[], config?: Partial<AIProviderConfig>): Promise<AIResponse>;
  
  /**
   * プロバイダーが利用可能かチェック
   */
  isAvailable(): Promise<boolean>;
  
  /**
   * 利用可能なモデル一覧を取得
   */
  getAvailableModels?(): Promise<string[]>;
}

export type SupportedProvider = 'claude' | 'openai' | 'gemini' | 'local';