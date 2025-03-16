import { Question } from "@/components/preparation/question-display";

// Mock questions for demonstration purposes
const mockQuestions: Record<string, Question[]> = {
  math: [
    {
      id: "math-1",
      text: "Solve for x: 2x + 5 = 13",
      options: ["x = 3", "x = 9", "x = 4", "x = 6"],
      correctAnswerIndex: 2,
    },
    {
      id: "math-2",
      text: "What is the area of a circle with radius 5 units?",
      options: ["25π square units", "10π square units", "5π square units", "15π square units"],
      correctAnswerIndex: 0,
    },
    {
      id: "math-3",
      text: "If a triangle has angles measuring 30° and 60°, what is the measure of the third angle?",
      options: ["90°", "60°", "45°", "30°"],
      correctAnswerIndex: 0,
    },
  ],
  science: [
    {
      id: "science-1",
      text: "What is the primary function of photosynthesis in plants?",
      options: ["To release oxygen", "To convert light energy into chemical energy", "To absorb carbon dioxide", "To produce chlorophyll"],
      correctAnswerIndex: 1,
    },
    {
      id: "science-2",
      text: "Which of the following is NOT a state of matter?",
      options: ["Plasma", "Gas", "Energy", "Solid"],
      correctAnswerIndex: 2,
    },
    {
      id: "science-3",
      text: "What is the chemical symbol for gold?",
      options: ["Go", "Gd", "Au", "Ag"],
      correctAnswerIndex: 2,
    },
  ],
  english: [
    {
      id: "english-1",
      text: "What is the main theme of the passage?",
      options: ["Perseverance", "Friendship", "Creativity", "Nature"],
      correctAnswerIndex: 0,
    },
    {
      id: "english-2",
      text: "Which of the following is an example of a metaphor?",
      options: ["The wind whispered", "She is as tall as a tree", "The sun is bright", "He walked slowly"],
      correctAnswerIndex: 0,
    },
    {
      id: "english-3",
      text: "What is the correct plural form of 'child'?",
      options: ["Childs", "Children", "Childrens", "Child"],
      correctAnswerIndex: 1,
    },
  ],
  "social-studies": [
    {
      id: "social-1",
      text: "What was the primary cause of the Industrial Revolution in England?",
      options: ["Technological innovations", "Agricultural revolution", "Colonial trade", "Abundance of natural resources"],
      correctAnswerIndex: 3,
    },
    {
      id: "social-2",
      text: "Which document begins with 'We the People'?",
      options: ["The Declaration of Independence", "The Bill of Rights", "The Constitution", "The Emancipation Proclamation"],
      correctAnswerIndex: 2,
    },
    {
      id: "social-3",
      text: "What was the main purpose of the United Nations when it was founded?",
      options: ["To promote international trade", "To maintain international peace and security", "To spread democracy", "To fight climate change"],
      correctAnswerIndex: 1,
    },
  ],
};

export async function getQuestionsBySubject(subject: string): Promise<Question[]> {
  // In a real implementation, this would fetch from an API or database
  return mockQuestions[subject] || [];
}

export async function getRandomQuestion(subject: string): Promise<Question | null> {
  const questions = await getQuestionsBySubject(subject);
  if (questions.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * questions.length);
  return questions[randomIndex];
} 