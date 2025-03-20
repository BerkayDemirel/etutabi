import OpenAI from 'openai';

let deepseekClient: OpenAI | null = null;

/**
 * Get or initialize the Deepseek client instance
 */
export function getDeepseekClient(): OpenAI | null {
  if (deepseekClient) {
    return deepseekClient;
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.warn('DEEPSEEK_API_KEY not set. Deepseek client will not be initialized.');
    return null;
  }

  try {
    deepseekClient = new OpenAI({
      apiKey,
      baseURL: process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1',
    });
    
    return deepseekClient;
  } catch (error) {
    console.error('Failed to initialize Deepseek client:', error);
    return null;
  }
} 