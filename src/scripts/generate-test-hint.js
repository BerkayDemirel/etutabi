// Script to test hint generation directly
require('dotenv').config({ path: '.env.local' });
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

// Initialize OpenAI client
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

// Test question
const testQuestion = {
  id: "test-question-1",
  text: "Bir zar atıldığında üst yüze çift sayı gelme olasılığı nedir?",
  options: ["1/3", "1/2", "1/6", "2/3", "3/4"],
  correctAnswerIndex: 1,
  subject: "math"
};

// Function to generate hints
async function generateHints(question) {
  try {
    console.log(`Generating hints for question: ${question.id}`);
    console.log(`Question text: ${question.text}`);
    console.log(`Options: ${question.options.join(', ')}`);
    console.log(`Correct answer: ${question.options[question.correctAnswerIndex]}`);
    
    const prompt = `Bir ${question.subject} sorusunu çözmeye yardımcı olacaksın.

Soru: ${question.text}

Seçenekler:
${question.options.map((opt, idx) => `${String.fromCharCode(65 + idx)}) ${opt}`).join('\n')}

Doğru cevap: ${String.fromCharCode(65 + question.correctAnswerIndex)}

Lütfen öğrenciye yardımcı olmak için:
1. Soruyu çözmek için gereken mantıksal adımları listele (en az 3, en fazla 5 adım)
2. Detaylı bir açıklama yaz (öğrencinin seviyesine uygun)
3. Bu konuda öğrencilerin sıkça yaptığı 2-3 hatayı belirt

Yanıtını Türkçe olarak ver ve öğretici bir dil kullan.`;

    console.log("\nSending prompt to OpenAI...");
    
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
    
    console.log("\n=== Generated Hints ===");
    console.log("Logical steps:");
    explanationData.logical_steps.forEach((step, index) => {
      console.log(`${index + 1}. ${step}`);
    });
    
    console.log("\nExplanation:");
    console.log(explanationData.explanation);
    
    if (explanationData.common_misconceptions && explanationData.common_misconceptions.length > 0) {
      console.log("\nCommon misconceptions:");
      explanationData.common_misconceptions.forEach((misconception, index) => {
        console.log(`${index + 1}. ${misconception}`);
      });
    }
    
    return {
      questionId: question.id,
      subject: question.subject,
      steps: explanationData.logical_steps,
      fullExplanation: explanationData.explanation,
      misconceptions: explanationData.common_misconceptions || []
    };
  } catch (error) {
    console.error("Error generating hints:", error);
    throw error;
  }
}

// Main function
async function main() {
  console.log("=== Hint Generation Test ===");
  
  try {
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error("Error: OPENAI_API_KEY is not set in .env.local");
      process.exit(1);
    }
    
    // Generate hints for the test question
    const hints = await generateHints(testQuestion);
    
    // Save the result to a file for inspection
    const outputPath = path.join(process.cwd(), 'test-hint-output.json');
    fs.writeFileSync(outputPath, JSON.stringify(hints, null, 2), { encoding: 'utf8' });
    
    console.log(`\nHints saved to: ${outputPath}`);
  } catch (error) {
    console.error("Error in main function:", error);
    process.exit(1);
  }
}

// Run the main function
main(); 