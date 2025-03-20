import { AI_PARAMS } from '@/lib/config-params';
import OpenAI from 'openai';

interface FunctionDefinition {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

interface FunctionCall {
  name: string;
  arguments: string;
}

interface GenerateOptions {
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  functions?: FunctionDefinition[];
  function_call?: { name: string } | 'auto';
}

interface AIResponse {
  content: string;
  function_call?: FunctionCall;
}

export class OpenAIClient {
  private client: OpenAI;
  private model: string;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });
    this.model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
    
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OPENAI_API_KEY not set. Using fallback response mode.');
    }
  }

  async generate(prompt: string, options: GenerateOptions = {}): Promise<AIResponse> {
    // If API key is not set, return a fallback response
    if (!process.env.OPENAI_API_KEY) {
      return this.getFallbackResponse(prompt, options);
    }

    try {
      const messages = [{ role: 'user' as const, content: prompt }];
      
      // Create request payload
      const completionOptions: any = {
        model: this.model,
        messages,
        max_tokens: options.max_tokens || AI_PARAMS.MAX_TOKENS,
        temperature: options.temperature || AI_PARAMS.TEMPERATURE,
        top_p: options.top_p || 1,
      };
      
      // Add function calling if specified
      if (options.functions) {
        completionOptions.functions = options.functions;
        
        if (options.function_call) {
          completionOptions.function_call = options.function_call;
        }
      }

      // Make API request
      const response = await this.client.chat.completions.create(completionOptions);
      const result = response.choices[0]?.message;

      return {
        content: result?.content || '',
        function_call: result?.function_call ? {
          name: result.function_call.name,
          arguments: result.function_call.arguments || '{}'
        } : undefined
      };
    } catch (error) {
      console.error('Error in OpenAIClient.generate:', error);
      return this.getFallbackResponse(prompt, options);
    }
  }

  private getFallbackResponse(prompt: string, options: GenerateOptions): AIResponse {
    // For function calling fallbacks
    if (options.functions && options.function_call) {
      const functionName = typeof options.function_call === 'string' 
        ? options.functions[0].name 
        : options.function_call.name;
      
      if (prompt.includes('evaluateAnswer')) {
        // Fallback for answer evaluation
        return {
          content: '',
          function_call: {
            name: functionName,
            arguments: JSON.stringify({
              isCorrect: Math.random() > 0.5 ? 1 : 0,
              explanation: 'Bu yanıt geçici olarak oluşturulmuştur çünkü AI API bağlantısı kurulamadı.'
            })
          }
        };
      }
    }

    // Default fallback for text responses
    return {
      content: 'Şu anda bir yanıt oluşturamıyorum. Lütfen daha sonra tekrar deneyin.'
    };
  }
} 