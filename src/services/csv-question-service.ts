import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { Question } from '@/components/preparation/question-display';
import { QUESTION_TYPE_PARAMS } from '@/lib/config-params';

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

// Define the structure of the open-ended questions JSON
interface OpenEndedQuestion {
  id: string;
  subject: string;
  grade: string;
  topic: string;
  text: string;
  type: 'open-ended';
  correctAnswer: string;
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

// Cache for parsed data - global to persist between API calls
let questionsCache: CSVQuestion[] | null = null;
let openEndedQuestionsCache: OpenEndedQuestion[] | null = null;
let lastReadTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

// Question history interface for analytics
interface QuestionHistory {
  questionId: string;
  subject: string;
  grade: string;
  topic: string;
  questionType: 'multiple-choice' | 'open-ended';
  isCorrect: boolean;
  studentAnswer: string | number;
  timestamp: string;
}

// In-memory store for question history
// In a production app, this would be saved to a database
const questionHistoryStore: QuestionHistory[] = [];

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
  
  // For now, all imported questions from CSV are multiple-choice
  return {
    id,
    text: csvQuestion.question,
    type: "multiple-choice", // Default type for CSV questions
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

// Convert open-ended question from JSON to our app's Question format
function convertOpenEndedQuestion(question: OpenEndedQuestion): Question {
  return {
    id: question.id,
    text: question.text,
    type: "open-ended",
    correctAnswer: question.correctAnswer
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

// Read open-ended questions from JSON
export async function readOpenEndedQuestions(): Promise<OpenEndedQuestion[]> {
  try {
    const currentTime = Date.now();
    
    // Return cached data if it exists and hasn't expired
    if (openEndedQuestionsCache && currentTime - lastReadTime < CACHE_TTL) {
      return openEndedQuestionsCache;
    }
    
    const filePath = path.join(process.cwd(), 'question_bank', 'open_ended_questions.json');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Parse JSON content
    const data = JSON.parse(fileContent);
    const questions = data.questions as OpenEndedQuestion[];
    
    // Update cache
    openEndedQuestionsCache = questions;
    
    return questions;
  } catch (error) {
    console.error('Error reading open-ended questions:', error);
    
    // If we have cached data, return it even if expired as a fallback
    if (openEndedQuestionsCache) {
      console.log('Returning cached open-ended questions as fallback');
      return openEndedQuestionsCache;
    }
    
    return [];
  }
}

// Get questions by subject and grade
export async function getQuestionsBySubjectAndGrade(
  subject: string,
  grade: string,
  mode: 'prep' | 'test' = 'prep'
): Promise<Question[]> {
  try {
    // Get multiple-choice questions
    const allQuestions = await readQuestionsFromCSV();
    const mappedSubject = subjectMapping[subject] || subject;
    
    // Filter questions by subject and grade
    const filteredQuestions = allQuestions.filter(q => 
      q.subject === mappedSubject && 
      q.grade === grade
    );
    
    // Convert to our app's Question format
    const multipleChoiceQuestions = filteredQuestions.map(convertCSVToQuestion);
    
    // Get open-ended questions
    const openEndedQuestions = await getOpenEndedQuestionsBySubjectAndGrade(subject, grade);
    
    // Mix multiple-choice and open-ended questions based on mode
    return mixQuestionsByMode(multipleChoiceQuestions, openEndedQuestions, mode);
  } catch (error) {
    console.error('Error getting questions by subject and grade:', error);
    return [];
  }
}

// Get open-ended questions by subject and grade
export async function getOpenEndedQuestionsBySubjectAndGrade(
  subject: string,
  grade: string
): Promise<Question[]> {
  try {
    const allOpenEndedQuestions = await readOpenEndedQuestions();
    const mappedSubject = subjectMapping[subject] || subject;
    
    // Filter questions by subject and grade
    const filteredQuestions = allOpenEndedQuestions.filter(q => 
      q.subject === mappedSubject && 
      q.grade === grade
    );
    
    // Convert to our app's Question format
    return filteredQuestions.map(convertOpenEndedQuestion);
  } catch (error) {
    console.error('Error getting open-ended questions:', error);
    return [];
  }
}

// Get questions by subject, grade, and topic
export async function getQuestionsByTopic(
  subject: string,
  grade: string,
  topic: string,
  mode: 'prep' | 'test' = 'prep'
): Promise<Question[]> {
  try {
    // Get multiple-choice questions
    const allQuestions = await readQuestionsFromCSV();
    const mappedSubject = subjectMapping[subject] || subject;
    
    // Filter questions by subject, grade, and topic
    const filteredQuestions = allQuestions.filter(q => 
      q.subject === mappedSubject && 
      q.grade === grade &&
      q.topic.toLowerCase() === topic.toLowerCase()
    );
    
    // Convert to our app's Question format
    const multipleChoiceQuestions = filteredQuestions.map(convertCSVToQuestion);
    
    // Get open-ended questions for this topic
    const allOpenEndedQuestions = await readOpenEndedQuestions();
    const filteredOpenEndedQuestions = allOpenEndedQuestions.filter(q => 
      q.subject === mappedSubject && 
      q.grade === grade &&
      q.topic.toLowerCase() === topic.toLowerCase()
    );
    
    const openEndedQuestions = filteredOpenEndedQuestions.map(convertOpenEndedQuestion);
    
    // Mix multiple-choice and open-ended questions based on mode
    return mixQuestionsByMode(multipleChoiceQuestions, openEndedQuestions, mode);
  } catch (error) {
    console.error('Error getting questions by topic:', error);
    return [];
  }
}

// Mix multiple-choice and open-ended questions based on mode
function mixQuestionsByMode(
  multipleChoiceQuestions: Question[],
  openEndedQuestions: Question[],
  mode: 'prep' | 'test'
): Question[] {
  // If no multiple-choice questions or no open-ended questions, return what we have
  if (multipleChoiceQuestions.length === 0) return openEndedQuestions;
  if (openEndedQuestions.length === 0) return multipleChoiceQuestions;
  
  // Determine the percentage of open-ended questions based on mode
  const openEndedPercentage = mode === 'prep' 
    ? QUESTION_TYPE_PARAMS.OPEN_QUESTION_WEIGHT_PREP 
    : QUESTION_TYPE_PARAMS.OPEN_QUESTION_WEIGHT_TEST;
  
  // Calculate how many open-ended questions to include
  const totalQuestions = multipleChoiceQuestions.length;
  const desiredOpenEndedCount = Math.round(totalQuestions * (openEndedPercentage / 100));
  const actualOpenEndedCount = Math.min(desiredOpenEndedCount, openEndedQuestions.length);
  
  // If we can't include any open-ended questions, return just multiple-choice
  if (actualOpenEndedCount === 0) {
    return multipleChoiceQuestions;
  }
  
  // Calculate how many multiple-choice questions to include
  const maxMultipleChoiceCount = Math.round(totalQuestions * (1 - openEndedPercentage / 100));
  const actualMultipleChoiceCount = Math.min(maxMultipleChoiceCount, multipleChoiceQuestions.length);
  
  // Randomly select multiple-choice questions
  const shuffledMultipleChoice = [...multipleChoiceQuestions].sort(() => 0.5 - Math.random());
  const selectedMultipleChoice = shuffledMultipleChoice.slice(0, actualMultipleChoiceCount);
  
  // Randomly select open-ended questions
  const shuffledOpenEnded = [...openEndedQuestions].sort(() => 0.5 - Math.random());
  const selectedOpenEnded = shuffledOpenEnded.slice(0, actualOpenEndedCount);
  
  // Combine and shuffle all selected questions
  const allQuestions = [...selectedMultipleChoice, ...selectedOpenEnded];
  return allQuestions.sort(() => 0.5 - Math.random());
}

// Get a random question by subject and grade
export async function getRandomQuestionBySubjectAndGrade(
  subject: string,
  grade: string,
  mode: 'prep' | 'test' = 'prep'
): Promise<Question | null> {
  try {
    const questions = await getQuestionsBySubjectAndGrade(subject, grade, mode);
    
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
    // Get topics from multiple-choice questions
    const allQuestions = await readQuestionsFromCSV();
    const mappedSubject = subjectMapping[subject] || subject;
    
    // Filter questions by subject and grade
    const filteredQuestions = allQuestions.filter(q => 
      q.subject === mappedSubject && 
      q.grade === grade
    );
    
    // Extract unique topics from multiple-choice questions
    const mcTopics = [...new Set(filteredQuestions.map(q => q.topic))];
    
    // Get topics from open-ended questions
    const allOpenEndedQuestions = await readOpenEndedQuestions();
    const filteredOpenEndedQuestions = allOpenEndedQuestions.filter(q =>
      q.subject === mappedSubject &&
      q.grade === grade
    );
    
    // Extract unique topics from open-ended questions
    const oeTopics = [...new Set(filteredOpenEndedQuestions.map(q => q.topic))];
    
    // Combine and deduplicate topics
    const allTopics = [...new Set([...mcTopics, ...oeTopics])];
    
    return allTopics;
  } catch (error) {
    console.error('Error getting topics:', error);
    return [];
  }
}

// Save question history for analytics
export async function saveQuestionHistory(history: QuestionHistory): Promise<void> {
  // Add to in-memory store
  questionHistoryStore.push(history);
  
  // Log for debugging
  console.log(`Question history saved: ${history.questionId} - ${history.isCorrect ? 'Correct' : 'Incorrect'}`);
  
  // In a real application, this would save to a database
  // For now, we'll just keep it in memory
  
  // Return a resolved promise to simulate async operation
  return Promise.resolve();
}

// Get question history for analytics
export async function getQuestionHistory(): Promise<QuestionHistory[]> {
  // In a real application, this would fetch from a database
  return [...questionHistoryStore];
}

// Get topic performance data
export async function getTopicPerformance(): Promise<Record<string, { correct: number; total: number }>> {
  const performance: Record<string, { correct: number; total: number }> = {};
  
  questionHistoryStore.forEach(history => {
    const key = `${history.subject}-${history.grade}-${history.topic}`;
    
    if (!performance[key]) {
      performance[key] = { correct: 0, total: 0 };
    }
    
    performance[key].total += 1;
    if (history.isCorrect) {
      performance[key].correct += 1;
    }
  });
  
  return performance;
} 