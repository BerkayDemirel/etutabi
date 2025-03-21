# Product Requirements Document - AI Test Prep Tutor

## 1. Product Overview
The AI Test Prep Tutor is a web application designed to help elementary school students prepare for subject tests through two distinct modes: Preparation Mode and Testing Mode. The application provides adaptive assistance through step-by-step guidance and explanations powered by a large language model (LLM).

## 2. Key Features

### 2.1 Landing Page
- Modern, minimalist design following 2024 web standards
- Subject selection dropdown 
- Mode selection (Preparation Mode vs Testing Mode)
- Authentication system (optional for future phases)

### 2.2 Preparation Mode
- Sequential presentation of randomized multiple-choice and open-ended questions
- Adaptive feedback system:
  - Multiple-choice: Correct answer → Proceed to next question
  - Multiple-choice: Incorrect answer → Display first logical step as a hint with encouragement
  - Open-ended: AI-powered evaluation with detailed feedback
- Progressive hint system with action buttons:
  - "Get Hints" → Shows hints in a progressive manner
  - "Try Again" → Allows selecting a different answer
  - "Show Solution" → Displays complete step-by-step solution
  - "Ask Question" → Opens text input for specific questions
  - "Next Question" → Proceeds to the next question
- LLM-powered explanations with function calling for structured responses
- Caching system for previously explained questions
- Support for mathematical expressions and formulas using KaTeX

### 2.3 Testing Mode
- Sequential presentation of 10 questions (mix of multiple-choice and open-ended)
- Time tracking functionality
- Open-ended answer evaluation with AI-powered feedback
- Results screen with:
  - Correct/incorrect answer summary
  - Subject and topic-based analysis of mistakes
  - Detailed explanation of each mistake with potential misconception identification
  - Letter annotations (A, B, C, D) clearly indicating selected answers vs correct answers

## 3. Technical Requirements

### 3.1 Frontend
- NextJS 14 framework
- Tailwind CSS for styling
- Shadcn UI component library
- Lucide icons
- Responsive design (desktop and mobile support)

### 3.2 Backend
- Node.js server
- Supabase for database and authentication
- API integration with OpenAI and/or DeepSeek models
- Function calling implementation for structured LLM responses
- Caching system for LLM responses

### 3.3 Database Schema
- Questions table:
  - Question ID (primary key)
  - Subject ID (foreign key)
  - Question type (multiple-choice or open-ended)
  - Question text
  - Answer options (JSON array, for multiple-choice)
  - Correct answer index (for multiple-choice)
  - Correct answer text (for open-ended)
  - Difficulty level
  - Tags/topics
- Explanations table:
  - Explanation ID (primary key)
  - Question ID (foreign key)
  - Logical steps (JSON array)
  - Full explanation text
  - Common misconceptions (JSON array)
- Open-ended Answers table:
  - Answer ID (primary key)
  - Question ID (foreign key)
  - Student answer text
  - Evaluation result (0-1 score)
  - Feedback explanation
  - Submission timestamp
- Student Progress table (optional future feature):
  - Student ID (primary key)
  - Question ID (foreign key)
  - Question type
  - Correct/incorrect
  - Attempts count
  - Last attempt timestamp

## 4. Development Plan

# Development Plan for AI Test Prep Tutor

## Phase 1: Project Setup and Basic Frontend (2 weeks)

### Week 1: Foundation
1. **Project Initialization**
   - Set up NextJS 14 project
   - Configure Tailwind CSS
   - Install Shadcn UI and Lucide icons
   - Set up project structure
   - Configure build pipeline and deployment

2. **Landing Page Development**
   - Design and implement minimalist landing page
   - Create subject dropdown component
   - Implement mode selection (Preparation/Testing)
   - Set up basic routing between pages

### Week 2: Core Interface Components
1. **Question Component**
   - Create reusable question display component
   - Implement multiple-choice selection interface
   - Add answer submission handling
   - Build feedback indicator (correct/incorrect)

2. **Navigation System**
   - Implement "Back to Main Menu" functionality
   - Create session management structure
   - Set up question sequencing logic

## Phase 2: Preparation Mode Implementation (3 weeks)

### Week 3: Basic Preparation Mode
1. **Step-by-Step Hint System**
   - Implement hint display component
   - Build "Give one more tip" functionality
   - Create "Explain me the solution" component
   - Develop step-by-step solution display

2. **Question Flow Logic**
   - Implement question randomization
   - Create answer validation logic
   - Build conditional logic for showing hints based on answers

### Week 4: LLM Integration for Preparation Mode
1. **LLM Service Configuration**
   - Set up OpenAI/DeepSeek API integration
   - Implement function calling schema for structured responses
   - Create prompt engineering templates
   - Build error handling for API responses

2. **Response Processing**
   - Implement JSON parsing of LLM responses
   - Create logical step extraction from responses
   - Build caching mechanism for explanations
   - Set up fallback responses for API failures

### Week 5: Advanced Preparation Features
1. **Understanding Confirmation**
   - Implement "I have understood the answer" flow
   - Create "I have not understood the answer" interface
   - Build follow-up question submission system
   - Implement LLM-based clarification responses

2. **Refinement and Testing**
   - Test hint progression logic
   - Optimize LLM prompts for better explanations
   - Implement content filtering for age-appropriate responses
   - Add loading states and error handling

## Phase 3: Testing Mode Implementation (2 weeks)

### Week 6: Testing Mode Basics
1. **Test Session Management**
   - Create 10-question test sequence generator
   - Implement time tracking functionality
   - Build answer recording mechanism
   - Create test completion detection

2. **Results Screen**
   - Design and implement test results UI
   - Create correct/incorrect answer summary
   - Implement performance metrics calculation
   - Build "Understand my mistake" functionality

### Week 7: Testing Mode Refinement
1. **Explanation Generation**
   - Implement mistake analysis with LLM
   - Create misconception identification logic
   - Build detailed explanation display
   - Set up batch processing for explanations

2. **User Experience Improvements**
   - Add progress indicator for test sequence
   - Implement question navigation within test
   - Create time notifications
   - Build test restart functionality

## Phase 4: Database Integration and Optimization (2 weeks)

### Week 8: Database Setup
1. **Supabase Configuration**
   - Set up Supabase project
   - Create database schema
   - Implement data access layer
   - Set up authentication (if required)

2. **Question Management**
   - Create question import functionality
   - Build question tagging system
   - Implement subject categorization
   - Set up difficulty scaling

### Week 9: Caching and Performance
1. **Caching System**
   - Implement LLM response caching
   - Set up explanation retrieval optimization
   - Create cache invalidation strategy
   - Build performance monitoring

2. **Optimization**
   - Implement lazy loading for content
   - Optimize API calls
   - Reduce unnecessary renders
   - Implement bundle splitting

## Phase 5: Quality Assurance and Launch (2 weeks)

### Week 10: Testing
1. **Comprehensive Testing**
   - Conduct unit tests for components
   - Perform integration tests for user flows
   - Test with actual elementary school questions
   - Verify LLM response quality and safety

2. **User Acceptance Testing**
   - Conduct sessions with target users
   - Gather feedback on UI/UX
   - Test with different subjects
   - Verify educational effectiveness

### Week 11: Finalization and Launch
1. **Refinement**
   - Address feedback from testing
   - Fix identified bugs
   - Optimize loading times
   - Ensure cross-browser compatibility

2. **Launch Preparation**
   - Prepare documentation
   - Set up monitoring and analytics
   - Configure production environment
   - Create backup and recovery plan

## Total Estimated Timeline: 11 weeks

## 5. API Integration Specifications

### 5.1 LLM Function Calling

For the OpenAI/DeepSeek integration, we'll implement the following function schemas:

#### 5.1.1 Multiple-Choice Question Solution

```json
{
  "name": "generate_step_by_step_solution",
  "description": "Generate a step-by-step solution for a given multiple-choice question",
  "parameters": {
    "type": "object",
    "properties": {
      "logical_steps": {
        "type": "array",
        "description": "Array of logical steps to solve the problem",
        "items": {
          "type": "string"
        }
      },
      "explanation": {
        "type": "string",
        "description": "Detailed explanation of the solution"
      },
      "correct_answer_index": {
        "type": "integer",
        "description": "Index of the correct answer"
      },
      "common_misconceptions": {
        "type": "array",
        "description": "Common misconceptions students might have",
        "items": {
          "type": "string"
        }
      }
    },
    "required": ["logical_steps", "explanation", "correct_answer_index"]
  }
}
```

#### 5.1.2 Open-Ended Answer Evaluation

```json
{
  "name": "evaluate_open_ended_answer",
  "description": "Evaluate a student's open-ended answer to a given question",
  "parameters": {
    "type": "object",
    "properties": {
      "isCorrect": {
        "type": "number",
        "description": "Score between 0 and 1 indicating correctness (0 = incorrect, 1 = correct)",
        "minimum": 0,
        "maximum": 1
      },
      "explanation": {
        "type": "string",
        "description": "Detailed explanation of why the answer is correct or incorrect, with educational feedback"
      }
    },
    "required": ["isCorrect", "explanation"]
  }
}
```

### 5.2 Sample Prompt Templates

#### 5.2.1 Multiple-Choice Question Solution

```
You are an expert elementary school tutor helping a student solve a [SUBJECT] question.

QUESTION:
[QUESTION_TEXT]

OPTIONS:
[OPTIONS]

Please provide a step-by-step solution broken down into clear logical steps that an elementary school student could follow. Each step should be one simple action or inference. Explain each step at an appropriate level for the age group.

Also provide a detailed explanation of the solution and identify the correct answer index (0-based). Include any common misconceptions students might have about this problem.
```

#### 5.2.2 Open-Ended Answer Evaluation

```
You are an educational AI assistant evaluating student answers to open-ended questions. 
Grade the student's answer on a scale from 0 to 1, where 0 is completely wrong and 1 is completely correct.

When grading, focus on conceptual understanding rather than exact wording. Provide a detailed explanation for why the answer is correct or incorrect.

If the answer is incorrect or partially correct (score < 0.7):
1. Begin with a gentle acknowledgment of what parts are correct (if any)
2. Clearly explain the misconceptions or errors
3. Provide a detailed step-by-step explanation of the correct approach
4. Include any relevant formulas, principles, or concepts
5. Conclude with a summary of the key points to remember

If the answer is correct (score >= 0.7):
1. Acknowledge the correct answer
2. Reinforce why the approach was correct
3. Add any additional insights or alternative methods

Question: [QUESTION_TEXT]
Correct answer: [CORRECT_ANSWER]
Student answer: [STUDENT_ANSWER]
```

### 5.3 Error Handling Specifications
- API failure fallback strategies
- Retry policies
- Error logging requirements
- User-facing error messages
- Offline mode behavior

## 6. User Experience Requirements

### 6.1 Accessibility
- All text must be readable by screen readers
- Color contrast must meet WCAG 2.1 AA standards
- Interactive elements must be keyboard-navigable
- Text size must be appropriate for elementary school students

### 6.2 Performance
- Initial page load under 2 seconds
- Question transitions under 500ms
- LLM response display under 3 seconds (with appropriate loading indicators)
- Mobile-responsive design with touch-friendly elements

### 6.3 User Interface
- Age-appropriate design with clear typography
- Simple, intuitive navigation
- Clear visual feedback for correct/incorrect answers
- Progress indicators in Testing Mode
- Clear distinction between hints and full explanations

## 7. Future Enhancements (Post-MVP)

- Student profiles and progress tracking
- Parent/teacher dashboard
- Custom question creation tools
- Subject-specific visual aids and manipulatives
- Gamification elements (points, badges, streaks)
- Offline mode with cached questions
- Multilingual support

## 8. Success Metrics

- Question completion rate
- Average time per question
- Hint usage frequency
- Improvement between practice and test modes
- Student satisfaction (via optional feedback)
- Follow-up question frequency (indication of engagement)

