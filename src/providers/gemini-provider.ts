import { AIProvider, AIMessage, AIResponse, AIProviderConfig } from '../types/ai-provider.js';

export class GeminiProvider implements AIProvider {
  name = 'gemini';
  private apiKey: string;
  private baseURL = 'https://generativelanguage.googleapis.com/v1beta/models';
  private defaultModel = 'gemini-1.5-flash';

  constructor(config: AIProviderConfig) {
    this.apiKey = config.apiKey;
    if (config.model) {
      this.defaultModel = config.model;
    }
  }

  async chat(messages: AIMessage[], config?: Partial<AIProviderConfig>): Promise<AIResponse> {
    try {
      const model = config?.model || this.defaultModel;
      const temperature = config?.temperature || 0.8;
      const maxTokens = config?.maxTokens || 1000;

      // Gemini API用のメッセージ形式に変換
      const contents = this.convertToGeminiFormat(messages);
      
      const url = `${this.baseURL}/${model}:generateContent?key=${this.apiKey}`;
      
      const requestBody = {
        contents,
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
          topP: 0.8,
          topK: 40
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_NONE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH', 
            threshold: 'BLOCK_NONE'
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_NONE'
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_NONE'
          }
        ]
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid response format from Gemini API');
      }

      const content = data.candidates[0].content.parts[0].text;
      
      return {
        content,
        usage: {
          promptTokens: data.usageMetadata?.promptTokenCount || 0,
          completionTokens: data.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: data.usageMetadata?.totalTokenCount || 0
        }
      };
    } catch (error) {
      throw new Error(`Failed to chat with Gemini: ${error}`);
    }
  }

  /**
   * AIMessage形式をGemini API形式に変換
   */
  private convertToGeminiFormat(messages: AIMessage[]): any[] {
    const contents: any[] = [];
    
    for (const message of messages) {
      if (message.role === 'system') {
        // システムメッセージをユーザーメッセージの最初に統合
        if (contents.length === 0) {
          contents.push({
            role: 'user',
            parts: [{ text: `System: ${message.content}` }]
          });
        } else {
          // 既存のユーザーメッセージに追加
          contents[0].parts[0].text = `System: ${message.content}\n\nUser: ${contents[0].parts[0].text}`;
        }
      } else {
        const geminiRole = message.role === 'assistant' ? 'model' : 'user';
        contents.push({
          role: geminiRole,
          parts: [{ text: message.content }]
        });
      }
    }

    return contents;
  }

  async isAvailable(): Promise<boolean> {
    try {
      // 簡単なテスト用リクエスト
      const url = `${this.baseURL}/${this.defaultModel}:generateContent?key=${this.apiKey}`;
      
      const testRequest = {
        contents: [{
          role: 'user',
          parts: [{ text: 'Hello' }]
        }],
        generationConfig: {
          maxOutputTokens: 10
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testRequest)
      });

      return response.ok || response.status === 400; // 400もAPIが利用可能な証拠
    } catch {
      return false;
    }
  }

  async getAvailableModels(): Promise<string[]> {
    // Geminiの利用可能モデル（2025年時点）
    return [
      'gemini-1.5-flash',
      'gemini-1.5-pro', 
      'gemini-2.5-flash',
      'gemini-pro', // 古いバージョンとの互換性
      'gemini-pro-vision'
    ];
  }
}