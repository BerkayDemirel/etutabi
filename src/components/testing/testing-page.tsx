"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAppContext } from "@/lib/context/app-context";
import { Question } from "@/components/preparation/question-display";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchQuestionsBySubjectAndGrade } from "@/services/api-question-service";
import { BookOpen, Clock, ArrowRight } from "lucide-react";
import { DEFAULT_MESSAGES, TESTING_PARAMS } from "@/lib/config-params";
import { TestQuestionDisplay } from "./test-question-display";
import { TestResults } from "./test-results";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Test session interface
interface TestSession {
  questions: Question[];
  answers: (number | null)[];
  openEndedAnswers: Record<string, {
    answer: string;
    evaluation?: {
      isCorrect: number;
      explanation: string;
    }
  }>;
  startTime: number;
  endTime: number | null;
  isComplete: boolean;
}

// Interface for the testing page props
interface TestingPageProps {
  onSidePanelChange?: (isOpen: boolean) => void;
}

export function TestingPage({ onSidePanelChange }: TestingPageProps) {
  // Context
  const { currentSubject, currentGrade } = useAppContext();
  
  // Main states
  const [testSession, setTestSession] = useState<TestSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [showTimeWarning, setShowTimeWarning] = useState(false);

  // Function to shuffle questions using Fisher-Yates algorithm
  const shuffleQuestions = useCallback((questions: Question[]): Question[] => {
    const shuffled = [...questions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  // Function to initialize a new test session
  const initializeTest = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!currentSubject || !currentGrade) {
        setError("Please select a subject and grade first.");
        return;
      }
      
      const questions = await fetchQuestionsBySubjectAndGrade(
        currentSubject,
        currentGrade,
        'test'
      );
      
      if (!questions || questions.length === 0) {
        setError("No questions found for the selected subject and grade.");
        return;
      }
      
      // Select 10 random questions
      const shuffled = shuffleQuestions(questions);
      const selectedQuestions = shuffled.slice(0, TESTING_PARAMS.QUESTIONS_PER_TEST);
      
      // Create empty answers array
      const emptyAnswers = Array(selectedQuestions.length).fill(null);
      
      // Create new test session
      const newSession: TestSession = {
        questions: selectedQuestions,
        answers: emptyAnswers,
        openEndedAnswers: {},
        startTime: Date.now(),
        endTime: null,
        isComplete: false
      };
      
      setTestSession(newSession);
      setCurrentQuestionIndex(0);
      setElapsedTime(0);
      setShowResults(false);
    } catch (error) {
      setError(`Failed to load questions: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  }, [currentSubject, currentGrade]);

  // Initialize test session when component mounts or subject/grade changes
  useEffect(() => {
    if (currentSubject && currentGrade) {
      initializeTest();
    }
  }, [currentSubject, currentGrade, initializeTest]);

  // Timer effect to track elapsed time and handle time limits
  useEffect(() => {
    if (!testSession || testSession.isComplete) return;
    
    const timer = setInterval(() => {
      const currentTime = Date.now();
      const elapsed = currentTime - testSession.startTime;
      
      setElapsedTime(Math.floor(elapsed / 1000));
      
      // Show warning when approaching time limit
      if (elapsed >= TESTING_PARAMS.TIME_WARNING_THRESHOLD_MS && !showTimeWarning) {
        setShowTimeWarning(true);
      }
      
      // Auto-complete test when time limit is reached
      if (elapsed >= TESTING_PARAMS.MAX_TEST_TIME_MS) {
        handleCompleteTest();
        clearInterval(timer);
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [testSession, showTimeWarning]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Handle answer selection
  const handleAnswerSelect = useCallback((answerIndex: number) => {
    if (!testSession) return;
    
    // Update the answers array with the selected answer
    const updatedAnswers = [...testSession.answers];
    updatedAnswers[currentQuestionIndex] = answerIndex;
    
    // Update the test session
    setTestSession(prev => {
      if (!prev) return null;
      return {
        ...prev,
        answers: updatedAnswers
      };
    });
    
    // Remove automatic progression to next question
  }, [testSession, currentQuestionIndex]);

  // Handle open-ended answer submission
  const handleOpenEndedSubmit = useCallback(async (answer: string) => {
    if (!testSession) return;
    
    const currentQuestion = testSession.questions[currentQuestionIndex];
    
    // First update the answer immediately without evaluation
    setTestSession(prev => {
      if (!prev) return null;
      
      const updatedOpenEndedAnswers = {
        ...prev.openEndedAnswers,
        [currentQuestion.id]: {
          answer,
          // Evaluation will be added after the API call
        }
      };
      
      return {
        ...prev,
        openEndedAnswers: updatedOpenEndedAnswers
      };
    });
    
    try {
      // Send the answer for evaluation
      const response = await fetch('/api/evaluate-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          questionText: currentQuestion.text,
          studentAnswer: answer,
          correctAnswer: currentQuestion.correctAnswer,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to evaluate answer');
      }
      
      const result = await response.json();
      
      // Update the test session with the evaluation
      setTestSession(prev => {
        if (!prev) return null;
        
        const updatedOpenEndedAnswers = {
          ...prev.openEndedAnswers,
          [currentQuestion.id]: {
            answer,
            evaluation: {
              isCorrect: result.isCorrect,
              explanation: result.explanation,
            }
          }
        };
        
        return {
          ...prev,
          openEndedAnswers: updatedOpenEndedAnswers
        };
      });
      
      // Remove automatic progression to next question
    } catch (error) {
      console.error('Error evaluating answer:', error);
      // Show a temporary error message
      setError(`${DEFAULT_MESSAGES.OPEN_ENDED_EVALUATION_ERROR} ${error instanceof Error ? error.message : ''}`);
      
      // Clear the error after a few seconds
      setTimeout(() => {
        setError(null);
      }, 5000);
      
      // Remove the pending evaluation
      throw error; // Rethrow to let the UI component know
    }
  }, [testSession, currentQuestionIndex]);

  // Navigate to the next question
  const handleNextQuestion = useCallback(() => {
    if (!testSession) return;
    
    if (currentQuestionIndex < testSession.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  }, [testSession, currentQuestionIndex]);

  // Navigate to the previous question
  const handlePreviousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  }, [currentQuestionIndex]);

  // Complete the test
  const handleCompleteTest = useCallback(() => {
    if (!testSession) return;
    
    // Calculate if all questions have been answered
    const allAnswered = testSession.questions.every(question => {
      if (question.type === "multiple-choice") {
        const index = testSession.questions.findIndex(q => q.id === question.id);
        return testSession.answers[index] !== null;
      } else if (question.type === "open-ended") {
        return question.id in testSession.openEndedAnswers && 
               !!testSession.openEndedAnswers[question.id]?.answer;
      }
      return false;
    });
    
    if (!allAnswered) {
      setError("Lütfen tüm soruları cevaplayın.");
      // Clear the error after a few seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
      return;
    }
    
    // Update the session with the end time and completion status
    setTestSession(prev => {
      if (!prev) return null;
      return {
        ...prev,
        endTime: Date.now(),
        isComplete: true
      };
    });
    
    // Show the results
    setShowResults(true);
  }, [testSession]);

  // Calculate if all questions have been answered
  const allQuestionsAnswered = useMemo(() => {
    if (!testSession) return false;
    
    // Check if all multiple choice questions have answers
    const allMultipleChoiceAnswered = testSession.questions
      .filter(q => q.type === "multiple-choice")
      .every((q, i) => {
        const questionIndex = testSession.questions.findIndex(tq => tq.id === q.id);
        return testSession.answers[questionIndex] !== null;
      });
    
    // Check if all open-ended questions have answers
    const allOpenEndedAnswered = testSession.questions
      .filter(q => q.type === "open-ended")
      .every(q => q.id in testSession.openEndedAnswers && !!testSession.openEndedAnswers[q.id]?.answer);
    
    return allMultipleChoiceAnswered && allOpenEndedAnswered;
  }, [testSession]);

  // Get formatted subject name in Turkish
  const getFormattedSubjectName = (subject: string | null): string => {
    if (!subject) return "";
    
    const subjectDisplayMap: { [key: string]: string } = {
      "math": "Matematik",
      "physics": "Fizik",
      "chemistry": "Kimya",
      "biology": "Biyoloji",
      "social-studies": "Sosyal Bilgiler",
      "english": "İngilizce"
    };
    
    return subjectDisplayMap[subject] || subject;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between h-8 mb-4">
          <div className="flex items-center gap-4">
            <h1 className="text-base font-semibold flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              Sınav Modu
            </h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>Ders: {getFormattedSubjectName(currentSubject)}</span>
              <span>•</span>
              <span>{currentGrade}. Sınıf</span>
            </div>
          </div>
        </div>
        <Skeleton className="h-6 w-3/4" />
        <Card>
          <CardContent className="p-3">
            <div className="space-y-3">
              <Skeleton className="h-5 w-full" />
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
              <Skeleton className="h-8 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center p-3">
        <p className="text-base text-red-500">{error}</p>
        <Button 
          onClick={initializeTest} 
          className="mt-3"
          size="sm"
        >
          Tekrar Dene
        </Button>
      </div>
    );
  }

  // Results view
  if (showResults && testSession) {
    return (
      <TestResults 
        testSession={testSession}
        onRestartTest={initializeTest}
      />
    );
  }

  // Main test view
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between h-8 mb-4">
        <div className="flex items-center gap-4">
          <h1 className="text-base font-semibold flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            Sınav Modu
          </h1>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>Ders: {getFormattedSubjectName(currentSubject)}</span>
            <span>•</span>
            <span>{currentGrade}. Sınıf</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className={`font-mono ${showTimeWarning ? "text-red-500 font-bold" : ""}`}>
            {formatTime(elapsedTime)}
          </span>
        </div>
      </div>

      {showTimeWarning && (
        <Alert variant="destructive" className="mb-3">
          <AlertDescription>
            {DEFAULT_MESSAGES.TIME_WARNING}
          </AlertDescription>
        </Alert>
      )}

      {testSession && (
        <>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-muted-foreground">
              Soru {currentQuestionIndex + 1} / {testSession.questions.length}
            </div>
            <div className="text-sm text-muted-foreground">
              {testSession.questions.filter((q, i) => {
                return q.type === "multiple-choice" 
                  ? testSession.answers[i] !== null
                  : q.id in testSession.openEndedAnswers && !!testSession.openEndedAnswers[q.id]?.answer;
              }).length} / {testSession.questions.length} Cevaplandı
            </div>
          </div>

          <div className="min-h-[350px]">
            {testSession && testSession.questions[currentQuestionIndex] && (
              <TestQuestionDisplay
                question={testSession.questions[currentQuestionIndex]}
                selectedAnswer={testSession.answers[currentQuestionIndex]}
                onAnswerSelect={handleAnswerSelect}
                onOpenEndedSubmit={handleOpenEndedSubmit}
                testMode={true}
                previousOpenEndedAnswer={
                  testSession.questions[currentQuestionIndex].type === "open-ended" 
                    ? testSession.openEndedAnswers[testSession.questions[currentQuestionIndex].id]?.answer 
                    : undefined
                }
              />
            )}
          </div>

          <div className="flex justify-between mt-4">
            <Button
              variant="outline"
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              size="sm"
            >
              Önceki Soru
            </Button>

            {currentQuestionIndex < testSession.questions.length - 1 ? (
              <Button
                variant="default"
                onClick={handleNextQuestion}
                size="sm"
              >
                Sonraki Soru
                <ArrowRight className="ml-2 h-3 w-3" />
              </Button>
            ) : (
              <Button
                variant="default"
                onClick={handleCompleteTest}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                disabled={!allQuestionsAnswered}
              >
                Sınavı Bitir
              </Button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {testSession.questions.map((question, index) => {
              // Check if this question is answered (either multiple choice or open-ended)
              const isAnswered = question.type === "multiple-choice" 
                ? testSession.answers[index] !== null
                : question.id in testSession.openEndedAnswers && !!testSession.openEndedAnswers[question.id]?.answer;
              
              return (
                <Button
                  key={index}
                  variant={index === currentQuestionIndex ? "default" : isAnswered ? "outline" : "ghost"}
                  size="sm"
                  className={`w-8 h-8 p-0 ${isAnswered ? "border-green-500 text-green-600" : "text-muted-foreground"}`}
                  onClick={() => setCurrentQuestionIndex(index)}
                >
                  {index + 1}
                </Button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
} 