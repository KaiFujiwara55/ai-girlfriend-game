import { AIProvider, AIMessage, AIResponse, AIProviderConfig } from '../types/ai-provider.js';

export class OpenAIProvider implements AIProvider {
  name = 'openai';
  private apiKey: string;
  private baseURL = 'https://api.openai.com/v1/chat/completions';
  private defaultModel = 'gpt-4o-mini';

  constructor(config: AIProviderConfig) {
    this.apiKey = config.apiKey;
  }

  async chat(messages: AIMessage[], config?: Partial<AIProviderConfig>): Promise<AIResponse> {
    try {
      const model = config?.model || this.defaultModel;
      const maxTokens = config?.maxTokens || 1000;
      const temperature = config?.temperature || 0.7;

      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: maxTokens,
          temperature
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        content: data.choices[0].message.content,
        usage: {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens
        }
      };
    } catch (error) {
      throw new Error(`Failed to chat with OpenAI: ${error}`);
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      
      if (!response.ok) return [];
      
      const data = await response.json();
      return data.data
        .filter((model: any) => model.id.includes('gpt'))
        .map((model: any) => model.id);
    } catch {
      return ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'];
    }
  }
}