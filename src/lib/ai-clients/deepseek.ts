import { AI_PARAMS } from '@/lib/config-params';

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

export class DeepseekAI {
  private apiKey: string;
  private apiUrl: string;
  private model: string;

  constructor() {
    this.apiKey = process.env.DEEPSEEK_API_KEY || '';
    this.apiUrl = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions';
    this.model = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
    
    if (!this.apiKey) {
      console.warn('DEEPSEEK_API_KEY not set. Using fallback response mode.');
    }
  }

  async generate(prompt: string, options: GenerateOptions = {}): Promise<AIResponse> {
    // If API key is not set, return a fallback response
    if (!this.apiKey) {
      return this.getFallbackResponse(prompt, options);
    }

    try {
      const messages = [{ role: 'user', content: prompt }];
      
      // Create request payload
      const payload: any = {
        model: this.model,
        messages,
        max_tokens: options.max_tokens || AI_PARAMS.MAX_TOKENS,
        temperature: options.temperature || AI_PARAMS.TEMPERATURE,
        top_p: options.top_p || 1,
      };
      
      // Add function calling if specified
      if (options.functions) {
        payload.functions = options.functions;
        
        if (options.function_call) {
          payload.function_call = options.function_call;
        }
      }

      // Make API request
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`AI API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const result = data.choices[0].message;

      return {
        content: result.content || '',
        function_call: result.function_call
      };
    } catch (error) {
      console.error('Error in DeepseekAI.generate:', error);
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
              explanation: 'This is a fallback evaluation response since the AI API is not connected.'
            })
          }
        };
      }
    }

    // Default fallback for text responses
    return {
      content: 'I could not generate a response at this time. Please try again later.'
    };
  }
} 