import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
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
        description: "3-5 clear, step-by-step instructions to solve the problem",
        items: {
          type: "string"
        }
      },
      explanation: {
        type: "string",
        description: "A detailed explanation of the solution in Turkish, suitable for the student's level"
      },
      common_misconceptions: {
        type: "array",
        description: "2-3 common mistakes or misconceptions students might have about this problem",
        items: {
          type: "string"
        }
      }
    },
    required: ["logical_steps", "explanation"]
  }
};

export async function POST(request: Request) {
  try {
    const { question, options, correctAnswerIndex, subject } = await request.json();

    const prompt = `Bir ${subject} sorusunu çözmeye yardımcı olacaksın.

Soru: ${question}

Seçenekler:
${options.map((opt: string, idx: number) => `${String.fromCharCode(65 + idx)}) ${opt}`).join('\n')}

Doğru cevap: ${String.fromCharCode(65 + correctAnswerIndex)}

Lütfen öğrenciye yardımcı olmak için:
1. Soruyu çözmek için gereken mantıksal adımları listele (en az 3, en fazla 5 adım)
2. Detaylı bir açıklama yaz (öğrencinin seviyesine uygun)
3. Bu konuda öğrencilerin sıkça yaptığı 2-3 hatayı belirt

Yanıtını Türkçe olarak ver ve öğretici bir dil kullan.`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4-turbo-preview",
      temperature: 0.7,
      function_call: { name: "generate_explanation" },
      functions: [explanationFunctionSchema]
    });

    // Extract the function call arguments
    const functionCall = completion.choices[0]?.message?.function_call;
    
    if (!functionCall || !functionCall.arguments) {
      throw new Error("Function call failed or returned no arguments");
    }

    // Parse the function arguments as JSON
    const explanationData = JSON.parse(functionCall.arguments);

    return NextResponse.json({
      logical_steps: explanationData.logical_steps || ["Adım adım çözüm yüklenirken bir hata oluştu."],
      explanation: explanationData.explanation || "Açıklama yüklenirken bir hata oluştu.",
      correct_answer_index: correctAnswerIndex,
      common_misconceptions: explanationData.common_misconceptions || []
    });

  } catch (error) {
    console.error("Error generating explanation:", error);
    return NextResponse.json(
      {
        error: "Açıklama oluşturulurken bir hata oluştu. Lütfen daha sonra tekrar deneyin."
      },
      { status: 500 }
    );
  }
} 