import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { AI_PARAMS, CACHE_PARAMS, DEFAULT_MESSAGES } from '@/lib/config-params';

// Initialize OpenAI client with timeout handling
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: AI_PARAMS.API_TIMEOUT_MS,
});

// Simple in-memory cache for follow-up responses
interface CacheEntry {
  response: string;
  timestamp: number;
}

const followUpCache: Record<string, CacheEntry> = {};

// Define the function schema for OpenAI function calling
const followUpFunctionSchema = {
  name: "generate_follow_up_response",
  description: "Generate a structured follow-up response to a student's question",
  parameters: {
    type: "object",
    properties: {
      response: {
        type: "string",
        description: "A helpful, supportive response to the student's question in Turkish"
      }
    },
    required: ["response"]
  }
};

// Helper function to create a standardized response
function createApiResponse(data: any, status = 200) {
  return new NextResponse(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  });
}

// Generate a cache key from the request parameters
function generateCacheKey(questionText: string, followUpQuestion: string): string {
  return `${questionText.slice(0, 100)}-${followUpQuestion.slice(0, 100)}`.replace(/\s+/g, '-');
}

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { 
      questionText, 
      choices,
      correctAnswer, 
      hints,
      fullExplanation,
      followUpQuestion, 
      subject,
      previousConversation 
    } = body;
    
    if (!questionText || !correctAnswer || !followUpQuestion || !subject) {
      return createApiResponse({ 
        error: 'Missing required parameters' 
      }, 400);
    }
    
    // Check if we have a cached response
    const cacheKey = generateCacheKey(questionText, followUpQuestion);
    const cachedEntry = followUpCache[cacheKey];
    
    if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_PARAMS.FOLLOW_UP_CACHE_TTL_MS) {
      // Return cached response
      return createApiResponse({ response: cachedEntry.response });
    }
    
    // Format previous conversation if it exists
    const previousConversationText = previousConversation?.length > 0 
      ? `\nÖnceki konuşma:\n${previousConversation.map(conv => 
          `Soru: ${conv.question}\nCevap: ${conv.answer}`
        ).join('\n\n')}`
      : '';

    // Create a prompt for the AI to answer the student's follow-up question
    const prompt = `Bir öğrenciye ${subject} sorusunu anlamasına yardımcı oluyorsun. Kısa ve net yanıt ver.

Soru: ${questionText}

Seçenekler:
${choices}

Doğru cevap: ${correctAnswer}

${hints?.length ? `İpuçları:\n${hints.map((hint, i) => `${i + 1}. ${hint}`).join('\n')}` : ''}

${fullExplanation ? `Tam açıklama:\n${fullExplanation}` : ''}${previousConversationText}

Öğrencinin yeni sorusu: ${followUpQuestion}

Lütfen öğrencinin sorusuna net, anlaşılır ve öğretici şekilde yanıt ver. 
Cevabını Türkçe olarak yaz ve öğrencinin seviyesine uygun bir dil kullan.
Seçeneklerden bahsederken "A seçeneği", "B seçeneği" gibi ifadeler kullan.
Cevabın kısa ve öz olsun, gereksiz detaylardan kaçın.`;
    
    try {
      // Add a timeout for the OpenAI call
      const timeoutPromise = new Promise<null>((_, reject) => {
        setTimeout(() => reject(new Error("OpenAI request timed out")), AI_PARAMS.FOLLOW_UP_TIMEOUT_MS);
      });
      
      // Make the OpenAI API call with function calling
      const completionPromise = openai.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: AI_PARAMS.FOLLOW_UP_MODEL,
        temperature: AI_PARAMS.FOLLOW_UP_TEMPERATURE,
        max_tokens: AI_PARAMS.FOLLOW_UP_MAX_TOKENS,
        function_call: { name: "generate_follow_up_response" },
        functions: [followUpFunctionSchema]
      });
      
      // Race the OpenAI call against the timeout
      const completion = await Promise.race([completionPromise, timeoutPromise]) as any;
      
      // Extract the function call arguments
      const functionCall = completion.choices[0]?.message?.function_call;
      
      if (!functionCall || !functionCall.arguments) {
        throw new Error("Function call failed or returned no arguments");
      }
      
      // Parse the function arguments as JSON
      const responseData = JSON.parse(functionCall.arguments);
      const aiResponse = responseData.response || DEFAULT_MESSAGES.FOLLOW_UP_ERROR;
      
      // Cache the response
      followUpCache[cacheKey] = {
        response: aiResponse,
        timestamp: Date.now()
      };
      
      return createApiResponse({ response: aiResponse });
    } catch (error) {
      console.error("Error generating follow-up response:", error);
      
      // Return a helpful default response
      return createApiResponse({ 
        response: DEFAULT_MESSAGES.FOLLOW_UP_ERROR
      });
    }
  } catch (error) {
    console.error("Error in follow-up API:", error);
    return createApiResponse({ 
      error: 'Failed to process follow-up question',
      details: String(error)
    }, 500);
  }
} 