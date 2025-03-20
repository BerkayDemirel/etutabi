import OpenAI from 'openai';

let openaiClient: OpenAI | null = null;

/**
 * Get or initialize the OpenAI client instance
 */
export function getOpenAIClient(): OpenAI | null {
  if (openaiClient) {
    return openaiClient;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn('OPENAI_API_KEY not set. OpenAI client will not be initialized.');
    return null;
  }

  try {
    openaiClient = new OpenAI({
      apiKey,
    });
    
    return openaiClient;
  } catch (error) {
    console.error('Failed to initialize OpenAI client:', error);
    return null;
  }
} 