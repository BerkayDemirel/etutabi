import { Question } from '@/components/preparation/question-display';
import { CACHE_PARAMS } from '@/lib/config-params';

// Cache for fetched random questions to avoid redundant API calls
interface CachedQuestion {
  question: Question;
  timestamp: number;
}

const recentQuestionCache: Record<string, CachedQuestion> = {};

// Helper to generate a cache key
function getCacheKey(subject: string, grade: string): string {
  return `${subject}-${grade}`;
}

// Helper to prune the cache if it grows too large
function pruneCache(): void {
  const keys = Object.keys(recentQuestionCache);
  if (keys.length <= CACHE_PARAMS.MAX_QUESTIONS_CACHE_SIZE) return;
  
  // Sort by timestamp and remove oldest entries
  const sortedKeys = keys.sort((a, b) => 
    recentQuestionCache[a].timestamp - recentQuestionCache[b].timestamp
  );
  
  // Remove oldest entries
  const keysToRemove = sortedKeys.slice(0, keys.length - CACHE_PARAMS.MAX_QUESTIONS_CACHE_SIZE);
  keysToRemove.forEach(key => delete recentQuestionCache[key]);
}

// Get all questions for a subject and grade
export async function fetchQuestionsBySubjectAndGrade(
  subject: string,
  grade: string
): Promise<Question[]> {
  try {
    const response = await fetch(`/api/questions?subject=${subject}&grade=${grade}`, {
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch questions: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.questions || [];
  } catch (error) {
    console.error('Error fetching questions:', error);
    return [];
  }
}

// Get questions for a specific topic
export async function fetchQuestionsByTopic(
  subject: string,
  grade: string,
  topic: string
): Promise<Question[]> {
  try {
    const response = await fetch(`/api/questions?subject=${subject}&grade=${grade}&topic=${topic}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error response:', errorData);
      throw new Error(`Failed to fetch questions: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.questions || [];
  } catch (error) {
    console.error('Error fetching questions by topic:', error);
    return [];
  }
}

// Get a random question
export async function fetchRandomQuestion(
  subject: string,
  grade: string
): Promise<Question | null> {
  try {
    // Check if we have a recently used question in the cache
    const cacheKey = getCacheKey(subject, grade);
    const cachedData = recentQuestionCache[cacheKey];
    
    // If we have a cached question and it's not expired, return it
    if (cachedData && (Date.now() - cachedData.timestamp < CACHE_PARAMS.QUESTIONS_CACHE_TTL_MS)) {
      delete recentQuestionCache[cacheKey]; // Use each cached question only once
      return cachedData.question;
    }
    
    // Add a timestamp to prevent browser caching
    const timestamp = Date.now();
    const response = await fetch(`/api/questions?subject=${subject}&grade=${grade}&random=true&t=${timestamp}`, {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch random question: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.question) {
      // Add this question to the cache (with a different key) to avoid showing it again too soon
      const cacheTimestamp = Date.now();
      const uniqueKey = `${cacheKey}-${data.question.id}`;
      recentQuestionCache[uniqueKey] = {
        question: data.question,
        timestamp: cacheTimestamp
      };
      
      // Prune the cache if needed
      pruneCache();
      
      return data.question;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching random question:', error);
    throw new Error(`Failed to fetch random question: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Get all topics for a subject and grade
export async function fetchTopics(
  subject: string,
  grade: string
): Promise<string[]> {
  try {
    const response = await fetch(`/api/questions?subject=${subject}&grade=${grade}&topics_only=true`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch topics: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.topics || [];
  } catch (error) {
    console.error('Error fetching topics:', error);
    return [];
  }
}

// Debug function to get all questions
export async function fetchAllQuestions(): Promise<any> {
  try {
    const response = await fetch(`/api/questions?subject=math&grade=9&debug=true`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch all questions: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching all questions:', error);
    return null;
  }
} 