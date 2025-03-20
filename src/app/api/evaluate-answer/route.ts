import { NextRequest, NextResponse } from 'next/server';
import { createAIClient } from '@/lib/ai-clients';
import { saveQuestionHistory } from '@/services/csv-question-service';
import { getDeepseekClient } from '@/lib/ai-clients/deepseek-client';
import { getOpenAIClient } from '@/lib/ai-clients/openai-client';
import { AI_PARAMS } from '@/lib/config-params';

interface EvaluationResult {
  isCorrect: 0 | 1;
  explanation: string;
}

// Define the function calling schema for the LLM
const evaluationFunctionSchema = {
  name: "evaluateAnswer",
  description: "Evaluates a student's answer to a given question and provides feedback",
  parameters: {
    type: "object",
    properties: {
      isCorrect: {
        type: "integer",
        enum: [0, 1],
        description: "1 if the answer is correct, 0 if incorrect"
      },
      explanation: {
        type: "string",
        description: "A detailed explanation of why the answer is correct or incorrect, and a correct answer explanation if incorrect"
      }
    },
    required: ["isCorrect", "explanation"]
  }
};

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const { questionId, questionText, studentAnswer, correctAnswer } = await request.json();

    if (!questionText || !studentAnswer || !correctAnswer) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the AI client (DeepSeek or OpenAI)
    const client = getDeepseekClient() || getOpenAIClient();
    
    if (!client) {
      return NextResponse.json(
        { error: 'AI client not initialized' },
        { status: 500 }
      );
    }

    // Evaluate the open-ended answer with the AI
    const response = await client.chat.completions.create({
      model: AI_PARAMS.OPEN_ENDED_MODEL,
      temperature: AI_PARAMS.OPEN_ENDED_TEMPERATURE,
      max_tokens: AI_PARAMS.MAX_TOKENS,
      messages: [
        {
          role: 'system',
          content: `You are an educational AI assistant evaluating student answers to open-ended questions. 
          Grade the student's answer on a scale from 0 to 1, where 0 is completely wrong and 1 is completely correct.
          When grading, focus on conceptual understanding rather than exact wording. 
          Provide a detailed explanation in Turkish for why the answer is correct or incorrect.
          
          If the answer is incorrect or partially correct (score < 0.7):
          1. Begin with a gentle acknowledgment of what parts are correct (if any)
          2. Clearly explain the misconceptions or errors
          3. Provide a detailed step-by-step explanation of the correct approach
          4. Walk through the solution process systematically
          5. Include any relevant formulas, principles, or concepts
          6. Conclude with a summary of the key points to remember
          
          If the answer is correct (score >= 0.7):
          1. Acknowledge the correct answer
          2. Reinforce why the approach was correct
          3. Add any additional insights or alternative methods
          
          Your explanation should be educational and help the student understand the concept better.
          Format your response as JSON with the following schema:
          {
            "isCorrect": number, // The score between 0 and 1
            "explanation": string // Detailed explanation in Turkish
          }`
        },
        {
          role: 'user',
          content: `Question: ${questionText}\n\nCorrect answer: ${correctAnswer}\n\nStudent answer: ${studentAnswer}`
        }
      ]
    });

    // Parse the AI response
    const result = response.choices[0]?.message?.content || '';
    let parsedResult;
    
    try {
      parsedResult = JSON.parse(result);
    } catch (e) {
      console.error('Failed to parse AI response as JSON:', result);
      // Fallback if parsing fails
      parsedResult = {
        isCorrect: 0,
        explanation: 'Yanıtınızı değerlendirirken bir hata oluştu. Lütfen tekrar deneyin.'
      };
    }

    // Save the question history for analytics
    try {
      await saveQuestionHistory({
        questionId,
        subject: 'Unknown',
        grade: 'Unknown',
        topic: 'Unknown',
        questionType: 'open-ended',
        isCorrect: parsedResult.isCorrect === 1,
        studentAnswer,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error saving question history:', error);
    }

    // Return the evaluation
    return NextResponse.json({
      questionId,
      isCorrect: parsedResult.isCorrect,
      explanation: parsedResult.explanation
    });
  } catch (error) {
    console.error('Error evaluating open-ended answer:', error);
    return NextResponse.json(
      { error: 'Failed to evaluate answer', details: String(error) },
      { status: 500 }
    );
  }
} 