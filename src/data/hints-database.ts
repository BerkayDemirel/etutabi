import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import { AI_PARAMS, HINTS_PARAMS, CACHE_PARAMS, DEFAULT_MESSAGES } from '@/lib/config-params';

export interface QuestionHint {
  questionId: string;
  subject: string;
  steps: string[];
  fullExplanation: string;
  misconceptions: string[];
}

// Cache for hints data - global to persist between API calls
let hintsCache: Record<string, QuestionHint> | null = null;
let lastCacheRefresh = 0;

// Initialize OpenAI client with timeout handling
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: AI_PARAMS.API_TIMEOUT_MS,
});

// Define the function schema for OpenAI function calling
const explanationFunctionSchema = {
  name: "generate_explanation",
  description: "Generate a structured explanation for a question with logical steps, detailed explanation, and common misconceptions",
  parameters: {
    type: "object",
    properties: {
      logical_steps: {
        type: "array",
        description: `${HINTS_PARAMS.MIN_STEPS}-${HINTS_PARAMS.MAX_STEPS} clear, step-by-step instructions to teach a student to solve the problem`,
        items: {
          type: "string"
        }
      },
      explanation: {
        type: "string",
        description: "A detailed explanation of the solution in Turkish, suitable for the student's level."
      },
      common_misconceptions: {
        type: "array",
        description: `${HINTS_PARAMS.MIN_MISCONCEPTIONS}-${HINTS_PARAMS.MAX_MISCONCEPTIONS} common mistakes or misconceptions students might have about this problem`,
        items: {
          type: "string"
        }
      }
    },
    required: ["logical_steps", "explanation"]
  }
};

// Path to the hints database file
const HINTS_DB_PATH = path.join(process.cwd(), 'src', 'data', 'hints.json');

// Function to load the hints database with caching
export function loadHintsDatabase(): Record<string, QuestionHint> {
  const currentTime = Date.now();
  
  // Return cached data if it exists and hasn't expired
  if (hintsCache && currentTime - lastCacheRefresh < CACHE_PARAMS.HINTS_CACHE_TTL_MS) {
    return hintsCache;
  }
  
  try {
    if (fs.existsSync(HINTS_DB_PATH)) {
      const data = fs.readFileSync(HINTS_DB_PATH, { encoding: 'utf8' });
      try {
        const parsedData = JSON.parse(data);
        hintsCache = parsedData;
        lastCacheRefresh = currentTime;
        return parsedData;
      } catch (parseError) {
        console.error('Error parsing hints database JSON:', parseError);
        // If we have a cache, return it as fallback
        if (hintsCache) return hintsCache;
        // Otherwise, return an empty database
        return {};
      }
    }
    
    // Create an empty database file if it doesn't exist
    const emptyDatabase = {};
    saveHintsDatabase(emptyDatabase);
    hintsCache = emptyDatabase;
    lastCacheRefresh = currentTime;
    return emptyDatabase;
  } catch (error) {
    console.error('Error loading hints database:', error);
    // If we have a cache, return it as fallback
    if (hintsCache) return hintsCache;
    return {};
  }
}

// Function to save the hints database
export function saveHintsDatabase(database: Record<string, QuestionHint>): void {
  try {
    const dirPath = path.dirname(HINTS_DB_PATH);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    fs.writeFileSync(
      HINTS_DB_PATH, 
      JSON.stringify(database, null, 2), 
      { encoding: 'utf8' }
    );
    
    // Update cache
    hintsCache = database;
    lastCacheRefresh = Date.now();
  } catch (error) {
    console.error('Error saving hints database:', error);
  }
}

// Function to get hints for a specific question
export function getHintsForQuestion(questionId: string): QuestionHint | null {
  try {
    const database = loadHintsDatabase();
    const normalizedId = decodeURIComponent(questionId);
    return database[normalizedId] || null;
  } catch (error) {
    console.error(`Error getting hints for question ${questionId}:`, error);
    return null;
  }
}

// Function to save hints for a specific question
export function saveHintsForQuestion(hint: QuestionHint): void {
  try {
    const database = loadHintsDatabase();
    const normalizedId = decodeURIComponent(hint.questionId);
    const normalizedHint = { ...hint, questionId: normalizedId };
    database[normalizedId] = normalizedHint;
    saveHintsDatabase(database);
  } catch (error) {
    console.error(`Error saving hints for question ${hint.questionId}:`, error);
  }
}

// Function to generate and save hints for a question
export async function generateAndSaveHints(
  questionId: string,
  questionText: string,
  options: string[],
  correctAnswerIndex: number,
  subject: string
): Promise<QuestionHint> {
  // Create default hints in case of error
  const defaultHint: QuestionHint = {
    questionId,
    subject,
    steps: [DEFAULT_MESSAGES.DEFAULT_HINT],
    fullExplanation: DEFAULT_MESSAGES.DEFAULT_EXPLANATION,
    misconceptions: [],
  };
  
  try {
    // Check if hints already exist
    const existingHints = getHintsForQuestion(questionId);
    if (existingHints) {
      return existingHints;
    }

    // Generate hints using OpenAI with function calling
    const prompt = `Bir ${subject} sorusunu çözmeye yardımcı olacaksın.

Soru: ${questionText}

Seçenekler:
${options.map((opt, idx) => `${String.fromCharCode(65 + idx)}) ${opt}`).join('\n')}

Doğru cevap: ${String.fromCharCode(65 + correctAnswerIndex)}

Lütfen öğrenciye yardımcı olmak için:
1. Soruyu çözmek için gereken mantıksal adımları listele (en az ${HINTS_PARAMS.MIN_STEPS}, en fazla ${HINTS_PARAMS.MAX_STEPS} adım)
2. Detaylı bir açıklama yaz (öğrencinin seviyesine uygun)
3. Bu konuda öğrencilerin sıkça yaptığı ${HINTS_PARAMS.MIN_MISCONCEPTIONS}-${HINTS_PARAMS.MAX_MISCONCEPTIONS} hatayı belirt

Yanıtını Türkçe olarak ver ve öğretici bir dil kullan.`;

    // Create a promise for the OpenAI call with function calling
    const completionPromise = openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: AI_PARAMS.HINTS_MODEL,
      temperature: AI_PARAMS.HINTS_TEMPERATURE,
      max_tokens: AI_PARAMS.HINTS_MAX_TOKENS,
      function_call: { name: "generate_explanation" },
      functions: [explanationFunctionSchema]
    });
    
    // Add a timeout for the OpenAI call
    const timeoutPromise = new Promise<null>((_, reject) => {
      setTimeout(() => reject(new Error("OpenAI request timed out")), AI_PARAMS.HINTS_TIMEOUT_MS);
    });
    
    // Race the OpenAI call against the timeout
    const completion = await Promise.race([completionPromise, timeoutPromise]) as any;
    
    // Extract the function call arguments
    const functionCall = completion.choices[0]?.message?.function_call;
    
    if (!functionCall || !functionCall.arguments) {
      throw new Error("Function call failed or returned no arguments");
    }

    // Parse the function arguments as JSON
    const explanationData = JSON.parse(functionCall.arguments);

    // Create the hint object
    const hint: QuestionHint = {
      questionId,
      subject,
      steps: explanationData.logical_steps || defaultHint.steps,
      fullExplanation: explanationData.explanation || defaultHint.fullExplanation,
      misconceptions: explanationData.common_misconceptions || [],
    };
    
    // Save the hint
    saveHintsForQuestion(hint);
    return hint;
  } catch (error) {
    console.error('Error generating hints:', error);
    
    // Save the default hint to prevent repeated API calls
    saveHintsForQuestion(defaultHint);
    return defaultHint;
  }
} 