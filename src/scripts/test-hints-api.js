// Test script for hints API
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Path to the hints database file
const HINTS_DB_PATH = path.join(process.cwd(), 'src', 'data', 'hints.json');

// Function to load the hints database
function loadHintsDatabase() {
  try {
    if (fs.existsSync(HINTS_DB_PATH)) {
      const data = fs.readFileSync(HINTS_DB_PATH, { encoding: 'utf8' });
      return JSON.parse(data);
    }
    return {};
  } catch (error) {
    console.error('Error loading hints database:', error);
    return {};
  }
}

// Function to analyze the hints database
function analyzeHintsDatabase() {
  const database = loadHintsDatabase();
  const questionIds = Object.keys(database);
  
  console.log(`\n=== Hints Database Analysis ===`);
  console.log(`Total number of questions with hints: ${questionIds.length}`);
  
  if (questionIds.length > 0) {
    console.log(`\nSample hint entry:`);
    const sampleId = questionIds[0];
    console.log(`Question ID: ${sampleId}`);
    console.log(`Subject: ${database[sampleId].subject}`);
    console.log(`Number of steps: ${database[sampleId].steps.length}`);
    console.log(`First step: ${database[sampleId].steps[0]}`);
    console.log(`Explanation length: ${database[sampleId].fullExplanation.length} characters`);
    
    // Check for potential duplicates (similar question IDs)
    const similarIds = findSimilarQuestionIds(questionIds);
    if (similarIds.length > 0) {
      console.log(`\n⚠️ Potential duplicate question IDs found:`);
      similarIds.forEach(group => {
        console.log(`Group: ${group.join(', ')}`);
      });
    }
    
    // Check for empty or error hints
    const errorHints = questionIds.filter(id => 
      database[id].steps.length === 1 && 
      database[id].steps[0].includes('hata')
    );
    
    if (errorHints.length > 0) {
      console.log(`\n⚠️ Questions with error hints: ${errorHints.length}`);
      errorHints.forEach(id => {
        console.log(`- ${id}: ${database[id].steps[0]}`);
      });
    }
  }
}

// Function to find similar question IDs (potential duplicates)
function findSimilarQuestionIds(questionIds) {
  const subjectGradeMap = {};
  
  // Group by subject and grade
  questionIds.forEach(id => {
    const parts = id.split('-');
    if (parts.length >= 2) {
      const key = `${parts[0]}-${parts[1]}`;
      if (!subjectGradeMap[key]) {
        subjectGradeMap[key] = [];
      }
      subjectGradeMap[key].push(id);
    }
  });
  
  // Find groups with similar IDs
  return Object.values(subjectGradeMap)
    .filter(group => group.length > 1)
    .map(group => {
      // Further group by topic
      const topicMap = {};
      group.forEach(id => {
        const parts = id.split('-');
        if (parts.length >= 3) {
          const topic = parts[2];
          if (!topicMap[topic]) {
            topicMap[topic] = [];
          }
          topicMap[topic].push(id);
        }
      });
      
      return Object.values(topicMap)
        .filter(topicGroup => topicGroup.length > 1);
    })
    .flat();
}

// Main function
async function main() {
  console.log('=== Hints API Test Script ===');
  
  // Check if the hints database exists
  if (fs.existsSync(HINTS_DB_PATH)) {
    console.log(`Hints database found at: ${HINTS_DB_PATH}`);
    const stats = fs.statSync(HINTS_DB_PATH);
    console.log(`Database size: ${(stats.size / 1024).toFixed(2)} KB`);
    
    // Analyze the database
    analyzeHintsDatabase();
  } else {
    console.log(`Hints database not found at: ${HINTS_DB_PATH}`);
  }
}

// Run the main function
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
}); 