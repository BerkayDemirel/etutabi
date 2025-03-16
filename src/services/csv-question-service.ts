import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { Question } from '@/components/preparation/question-display';

// Define the structure of a CSV question row
interface CSVQuestion {
  subject: string;
  grade: string;
  topic: string;
  question: string;
  correct_answer: string;
  choice_a: string;
  choice_b: string;
  choice_c: string;
  choice_d: string;
  choice_e: string;
}

// Map UI subject values to CSV subject values
const subjectMapping: Record<string, string> = {
  "math": "Math",
  "physics": "Fizik",
  "chemistry": "Kimya",
  "biology": "Biyoloji",
  "social-studies": "Sosyal Bilimler",
  "english": "İngilizce"
};

// Cache for parsed CSV data - global to persist between API calls
let questionsCache: CSVQuestion[] | null = null;
let lastReadTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

// Convert letter answer (a, b, c, d, e) to index (0, 1, 2, 3, 4)
function letterToIndex(letter: string): number {
  const letterMap: Record<string, number> = {
    'a': 0,
    'b': 1,
    'c': 2,
    'd': 3,
    'e': 4
  };
  return letterMap[letter.toLowerCase()] || 0;
}

// Generate a consistent hash for a question
function generateQuestionHash(text: string): string {
  // Simple hash function to generate a consistent ID
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Convert to a short alphanumeric string
  const positiveHash = Math.abs(hash);
  return positiveHash.toString(36).substring(0, 6);
}

// Convert CSV question to our app's Question format
function convertCSVToQuestion(csvQuestion: CSVQuestion): Question {
  // Generate a consistent ID based on the question content
  const questionHash = generateQuestionHash(csvQuestion.question);
  
  // Create a consistent ID format: Subject-Grade-Topic-Hash
  const id = `${csvQuestion.subject}-${csvQuestion.grade}-${csvQuestion.topic}-${questionHash}`;
  
  return {
    id,
    text: csvQuestion.question,
    options: [
      csvQuestion.choice_a,
      csvQuestion.choice_b,
      csvQuestion.choice_c,
      csvQuestion.choice_d,
      csvQuestion.choice_e
    ],
    correctAnswerIndex: letterToIndex(csvQuestion.correct_answer)
  };
}

// Read all questions from the CSV file with caching
export async function readQuestionsFromCSV(): Promise<CSVQuestion[]> {
  try {
    const currentTime = Date.now();
    
    // Return cached data if it exists and hasn't expired
    if (questionsCache && currentTime - lastReadTime < CACHE_TTL) {
      return questionsCache;
    }
    
    const filePath = path.join(process.cwd(), 'question_bank', 'qa_bank.csv');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Parse CSV content
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    }) as CSVQuestion[];
    
    // Update cache
    questionsCache = records;
    lastReadTime = currentTime;
    
    return records;
  } catch (error) {
    console.error('Error reading CSV file:', error);
    
    // If we have cached data, return it even if expired as a fallback
    if (questionsCache) {
      console.log('Returning cached questions data as fallback');
      return questionsCache;
    }
    
    return [];
  }
}

// Get questions by subject and grade
export async function getQuestionsBySubjectAndGrade(
  subject: string,
  grade: string
): Promise<Question[]> {
  try {
    const allQuestions = await readQuestionsFromCSV();
    const mappedSubject = subjectMapping[subject] || subject;
    
    // Filter questions by subject and grade
    const filteredQuestions = allQuestions.filter(q => 
      q.subject === mappedSubject && 
      q.grade === grade
    );
    
    // Convert to our app's Question format
    return filteredQuestions.map(convertCSVToQuestion);
  } catch (error) {
    console.error('Error getting questions by subject and grade:', error);
    return [];
  }
}

// Get questions by subject, grade, and topic
export async function getQuestionsByTopic(
  subject: string,
  grade: string,
  topic: string
): Promise<Question[]> {
  try {
    const allQuestions = await readQuestionsFromCSV();
    const mappedSubject = subjectMapping[subject] || subject;
    
    // Filter questions by subject, grade, and topic
    const filteredQuestions = allQuestions.filter(q => 
      q.subject === mappedSubject && 
      q.grade === grade &&
      q.topic.toLowerCase() === topic.toLowerCase()
    );
    
    // Convert to our app's Question format
    return filteredQuestions.map(convertCSVToQuestion);
  } catch (error) {
    console.error('Error getting questions by topic:', error);
    return [];
  }
}

// Get a random question by subject and grade
export async function getRandomQuestionBySubjectAndGrade(
  subject: string,
  grade: string
): Promise<Question | null> {
  try {
    const questions = await getQuestionsBySubjectAndGrade(subject, grade);
    
    if (questions.length === 0) {
      return null;
    }
    
    // Get a random question
    const randomIndex = Math.floor(Math.random() * questions.length);
    return questions[randomIndex];
  } catch (error) {
    console.error('Error getting random question:', error);
    return null;
  }
}

// Get all available topics for a subject and grade
export async function getTopicsBySubjectAndGrade(
  subject: string,
  grade: string
): Promise<string[]> {
  try {
    const allQuestions = await readQuestionsFromCSV();
    const mappedSubject = subjectMapping[subject] || subject;
    
    // Filter questions by subject and grade
    const filteredQuestions = allQuestions.filter(q => 
      q.subject === mappedSubject && 
      q.grade === grade
    );
    
    // Extract unique topics
    const topics = [...new Set(filteredQuestions.map(q => q.topic))];
    
    return topics;
  } catch (error) {
    console.error('Error getting topics:', error);
    return [];
  }
} 