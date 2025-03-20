// Test script for open-ended question evaluation
// Run with: node -r dotenv/config src/scripts/test-openended-evaluation.js

const fetch = require('node-fetch');

async function testOpenEndedEvaluation() {
  try {
    console.log('Testing open-ended question evaluation...');
    
    // Test question
    const testData = {
      questionId: 'Math-9-Denklemler-abc123',
      questionText: '2x + 5 = 20 denkleminde x\'in değerini bulunuz.',
      studentAnswer: 'İlk önce 2x = 20 - 5 diye düzenlerim, yani 2x = 15. Sonra her iki tarafı 2\'ye bölerim ve x = 7.5 bulunur.',
      correctAnswer: 'x = 7.5'
    };
    
    console.log('Sending test data:', testData);
    
    const response = await fetch('http://localhost:3000/api/evaluate-answer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API error: ${response.status} - ${error}`);
    }
    
    const result = await response.json();
    console.log('Evaluation result:', JSON.stringify(result, null, 2));
    
    // Check if the structure is correct
    if (typeof result.isCorrect !== 'number' || typeof result.explanation !== 'string') {
      console.error('Invalid response structure!');
    } else {
      console.log('✅ Response structure is valid');
      console.log(`Answer was marked as: ${result.isCorrect === 1 ? 'CORRECT' : 'INCORRECT'}`);
      console.log('Explanation length:', result.explanation.length);
    }
    
  } catch (error) {
    console.error('Error testing open-ended evaluation:', error);
  }
}

testOpenEndedEvaluation(); 