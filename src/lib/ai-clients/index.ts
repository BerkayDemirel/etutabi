import { DeepseekAI } from './deepseek';
import { OpenAIClient } from './openai';

export interface AIClient {
  generate(prompt: string, options?: any): Promise<{
    content: string;
    function_call?: {
      name: string;
      arguments: string;
    };
  }>;
}

/**
 * Creates an AI client based on environment configuration.
 * Defaults to OpenAI if PREFERRED_AI_CLIENT isn't set,
 * or the preferred client is not available.
 */
export function createAIClient(): AIClient {
  const preferredClient = process.env.PREFERRED_AI_CLIENT || 'openai';
  
  // Check if OpenAI API key is available
  const hasOpenAIKey = !!process.env.OPENAI_API_KEY;
  
  // Check if Deepseek API key is available
  const hasDeepseekKey = !!process.env.DEEPSEEK_API_KEY;
  
  // Use the preferred client if its API key is available
  if (preferredClient === 'deepseek' && hasDeepseekKey) {
    console.log('Using DeepseekAI client');
    return new DeepseekAI();
  }
  
  // Fallback to OpenAI
  if (hasOpenAIKey) {
    console.log('Using OpenAI client');
    return new OpenAIClient();
  }
  
  // If neither is available, return the requested one anyway
  // (it will use fallback mode)
  if (preferredClient === 'deepseek') {
    console.warn('Using DeepseekAI in fallback mode (no API key)');
    return new DeepseekAI();
  } else {
    console.warn('Using OpenAI in fallback mode (no API key)');
    return new OpenAIClient();
  }
} 