import { AIProvider, AIMessage, AIResponse, AIProviderConfig } from '../types/ai-provider.js';

export class ClaudeProvider implements AIProvider {
  name = 'claude';
  private apiKey: string;
  private baseURL = 'https://api.anthropic.com/v1/messages';
  private defaultModel = 'claude-3-sonnet-20240229';

  constructor(config: AIProviderConfig) {
    this.apiKey = config.apiKey;
  }

  async chat(messages: AIMessage[], config?: Partial<AIProviderConfig>): Promise<AIResponse> {
    try {
      const model = config?.model || this.defaultModel;
      const maxTokens = config?.maxTokens || 1000;
      const temperature = config?.temperature || 0.7;

      // Claudeの形式に変換
      const systemMessage = messages.find(m => m.role === 'system')?.content || '';
      const conversationMessages = messages
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content
        }));

      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model,
          max_tokens: maxTokens,
          temperature,
          system: systemMessage,
          messages: conversationMessages
        })
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        content: data.content[0].text,
        usage: {
          promptTokens: data.usage.input_tokens,
          completionTokens: data.usage.output_tokens,
          totalTokens: data.usage.input_tokens + data.usage.output_tokens
        }
      };
    } catch (error) {
      throw new Error(`Failed to chat with Claude: ${error}`);
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this.defaultModel,
          max_tokens: 10,
          messages: [{ role: 'user', content: 'test' }]
        })
      });
      return response.ok || response.status === 400; // 400も有効なレスポンス
    } catch {
      return false;
    }
  }

  async getAvailableModels(): Promise<string[]> {
    // Claudeの利用可能モデル（実際のAPIでは取得できないので固定値）
    return [
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307'
    ];
  }
}