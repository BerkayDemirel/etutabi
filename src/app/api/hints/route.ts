import { NextResponse } from 'next/server';
import { getHintsForQuestion, generateAndSaveHints } from '@/data/hints-database';

// Helper function to create a standardized response with proper headers
function createApiResponse(data: any, status = 200) {
  return new NextResponse(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  });
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return createApiResponse({}, 200);
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const questionId = url.searchParams.get('questionId');

    if (!questionId) {
      return createApiResponse({ error: 'Question ID is required' }, 400);
    }

    // Decode the questionId if it's URL encoded
    const decodedQuestionId = decodeURIComponent(questionId);
    
    const hints = getHintsForQuestion(decodedQuestionId);
    
    if (hints) {
      return createApiResponse(hints);
    } else {
      return createApiResponse({ error: 'No hints found for this question' }, 404);
    }
  } catch (error) {
    console.error('Error retrieving hints:', error);
    return createApiResponse({ 
      error: 'Failed to retrieve hints', 
      details: String(error) 
    }, 500);
  }
}

export async function POST(request: Request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      return createApiResponse({ error: 'Invalid JSON in request body' }, 400);
    }
    
    const { questionId, questionText, options, correctAnswerIndex, subject } = body;

    if (!questionId || !questionText || !options || correctAnswerIndex === undefined || !subject) {
      return createApiResponse({ 
        error: 'Missing required fields',
        received: { questionId, questionText, hasOptions: !!options, correctAnswerIndex, subject }
      }, 400);
    }

    // Check if hints already exist before generating new ones
    const existingHints = getHintsForQuestion(questionId);
    if (existingHints) {
      return createApiResponse(existingHints);
    }

    try {
      const hints = await generateAndSaveHints(
        questionId,
        questionText,
        options,
        correctAnswerIndex,
        subject
      );

      return createApiResponse(hints);
    } catch (genError) {
      console.error('Error generating hints:', genError);
      
      // Return a default response with empty hints
      const defaultHints = {
        questionId,
        subject,
        steps: ["İpucu oluşturulurken bir hata oluştu."],
        fullExplanation: "Açıklama oluşturulurken bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
        misconceptions: []
      };
      
      return createApiResponse(defaultHints);
    }
  } catch (error) {
    console.error('Error in POST /api/hints:', error);
    return createApiResponse({ 
      error: 'Failed to generate hints', 
      details: String(error) 
    }, 500);
  }
} 