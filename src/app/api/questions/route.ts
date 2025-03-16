import { NextRequest, NextResponse } from 'next/server';
import { 
  getQuestionsBySubjectAndGrade, 
  getRandomQuestionBySubjectAndGrade,
  getTopicsBySubjectAndGrade,
  readQuestionsFromCSV
} from '@/services/csv-question-service';

// Helper function to create a standardized response with proper headers
function createApiResponse(data: any, status = 200) {
  return new NextResponse(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300', // Cache successful responses for 5 minutes
    }
  });
}

// GET /api/questions?subject=math&grade=9
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const subject = searchParams.get('subject');
    const grade = searchParams.get('grade');
    const topic = searchParams.get('topic');
    const random = searchParams.get('random');
    const topicsOnly = searchParams.get('topics_only');
    const debug = searchParams.get('debug');

    console.log(`API Request - subject: ${subject}, grade: ${grade}, topic: ${topic}, random: ${random}, topicsOnly: ${topicsOnly}`);

    if (!subject || !grade) {
      return createApiResponse(
        { error: 'Subject and grade are required parameters' },
        400
      );
    }

    // Debug mode to see all available questions
    if (debug === 'true') {
      const allQuestions = await readQuestionsFromCSV();
      return createApiResponse({ 
        allQuestions,
        count: allQuestions.length,
        params: { subject, grade, random, topicsOnly }
      });
    }

    // Return only topics for the given subject and grade
    if (topicsOnly === 'true') {
      const topics = await getTopicsBySubjectAndGrade(subject, grade);
      return createApiResponse({ topics });
    }

    // Return a random question
    if (random === 'true') {
      const question = await getRandomQuestionBySubjectAndGrade(subject, grade);
      
      if (!question) {
        // Get minimal information about available questions
        const allQuestions = await readQuestionsFromCSV();
        const availableSubjects = [...new Set(allQuestions.map(q => q.subject))];
        const availableGrades = [...new Set(allQuestions.map(q => q.grade))];
        
        return createApiResponse(
          { 
            error: 'No questions found for the given criteria',
            requested: { subject, grade },
            available: { 
              subjects: availableSubjects,
              grades: availableGrades,
              count: allQuestions.length
            }
          },
          404
        );
      }
      
      return createApiResponse({ question });
    }

    // For topic-specific or all questions, just return what we have
    const questions = await getQuestionsBySubjectAndGrade(subject, grade);
    
    // If topic was specified, filter the results client-side
    // This avoids duplicating filtering logic server-side
    if (topic) {
      const filteredQuestions = questions.filter(q => 
        q.id.toLowerCase().includes(topic.toLowerCase())
      );
      return createApiResponse({ questions: filteredQuestions });
    }
    
    return createApiResponse({ questions });
  } catch (error) {
    console.error('Error in questions API:', error);
    return createApiResponse(
      { error: 'Failed to fetch questions', details: String(error) },
      500
    );
  }
} 