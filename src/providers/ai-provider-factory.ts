import { AIProvider, AIProviderConfig, SupportedProvider } from '../types/ai-provider.js';
import { ClaudeProvider } from './claude-provider.js';
import { OpenAIProvider } from './openai-provider.js';
import { GeminiProvider } from './gemini-provider.js';

type ProviderConstructor = new (config: AIProviderConfig) => AIProvider;

export class AIProviderFactory {
  private static providers: Map<SupportedProvider, ProviderConstructor> = new Map();

  static {
    this.providers.set('claude', ClaudeProvider as ProviderConstructor);
    this.providers.set('openai', OpenAIProvider as ProviderConstructor);
    this.providers.set('gemini', GeminiProvider as ProviderConstructor);
  }

  static createProvider(providerType: SupportedProvider, config: AIProviderConfig): AIProvider {
    const ProviderClass = this.providers.get(providerType);
    
    if (!ProviderClass) {
      throw new Error(`Unsupported AI provider: ${providerType}`);
    }

    return new ProviderClass(config);
  }

  static getSupportedProviders(): SupportedProvider[] {
    return Array.from(this.providers.keys());
  }

  static async detectAvailableProvider(configs: Record<SupportedProvider, AIProviderConfig>): Promise<SupportedProvider | null> {
    // 設定済みのプロバイダーから利用可能なものを検出
    for (const [providerType, config] of Object.entries(configs) as [SupportedProvider, AIProviderConfig][]) {
      if (!config.apiKey) continue;
      
      try {
        const provider = this.createProvider(providerType, config);
        if (await provider.isAvailable()) {
          return providerType;
        }
      } catch {
        continue;
      }
    }
    
    return null;
  }
}

// 環境変数から設定を自動取得
export function getProviderConfigFromEnv(): Record<SupportedProvider, AIProviderConfig> {
  return {
    claude: {
      apiKey: process.env.ANTHROPIC_API_KEY || '',
      model: process.env.CLAUDE_MODEL || 'claude-3-sonnet-20240229'
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini'
    },
    gemini: {
      apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '',
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash'
    },
    local: {
      apiKey: '', // ローカルLLMには通常不要
      model: process.env.LOCAL_MODEL || 'llama2'
    }
  };
}