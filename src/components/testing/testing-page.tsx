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
  const initializeTestSession = useCallback(async () => {
    if (!currentSubject || !currentGrade) return;
    
    setIsLoading(true);
    setError(null);
    setShowResults(false);
    setShowTimeWarning(false);
    
    try {
      // Fetch questions for the current subject and grade
      const allQuestions = await fetchQuestionsBySubjectAndGrade(currentSubject, currentGrade);
      
      if (allQuestions.length === 0) {
        setError(DEFAULT_MESSAGES.NO_QUESTIONS_FOUND);
        setIsLoading(false);
        return;
      }
      
      // Shuffle and select the first QUESTIONS_PER_TEST questions
      const shuffled = shuffleQuestions(allQuestions);
      const testQuestions = shuffled.slice(0, Math.min(TESTING_PARAMS.QUESTIONS_PER_TEST, shuffled.length));
      
      // Initialize the test session
      const newSession: TestSession = {
        questions: testQuestions,
        answers: Array(testQuestions.length).fill(null),
        startTime: Date.now(),
        endTime: null,
        isComplete: false
      };
      
      setTestSession(newSession);
      setCurrentQuestionIndex(0);
      setElapsedTime(0);
    } catch (error) {
      console.error("Error initializing test session:", error);
      setError(DEFAULT_MESSAGES.QUESTION_LOAD_ERROR);
    } finally {
      setIsLoading(false);
    }
  }, [currentSubject, currentGrade, shuffleQuestions]);

  // Initialize test session when component mounts or subject/grade changes
  useEffect(() => {
    if (currentSubject && currentGrade) {
      initializeTestSession();
    }
  }, [currentSubject, currentGrade, initializeTestSession]);

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
  const handleAnswerSelect = useCallback((questionIndex: number, answerIndex: number) => {
    if (!testSession) return;
    
    setTestSession(prev => {
      if (!prev) return prev;
      
      const newAnswers = [...prev.answers];
      newAnswers[questionIndex] = answerIndex;
      
      return {
        ...prev,
        answers: newAnswers
      };
    });
  }, [testSession]);

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
    
    setTestSession(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        endTime: Date.now(),
        isComplete: true
      };
    });
    
    setShowResults(true);
  }, [testSession]);

  // Calculate if all questions have been answered
  const allQuestionsAnswered = useMemo(() => {
    if (!testSession) return false;
    return !testSession.answers.includes(null);
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
          onClick={initializeTestSession} 
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
        onRestartTest={initializeTestSession}
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
              {testSession.answers.filter(a => a !== null).length} / {testSession.questions.length} Cevaplandı
            </div>
          </div>

          <TestQuestionDisplay
            question={testSession.questions[currentQuestionIndex]}
            selectedAnswer={testSession.answers[currentQuestionIndex]}
            onAnswerSelect={(answerIndex) => handleAnswerSelect(currentQuestionIndex, answerIndex)}
            testMode={true}
          />

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
            {testSession.questions.map((_, index) => (
              <Button
                key={index}
                variant={index === currentQuestionIndex ? "default" : testSession.answers[index] !== null ? "outline" : "ghost"}
                size="sm"
                className={`w-8 h-8 p-0 ${testSession.answers[index] !== null ? "border-green-500 text-green-600" : "text-muted-foreground"}`}
                onClick={() => setCurrentQuestionIndex(index)}
              >
                {index + 1}
              </Button>
            ))}
          </div>
        </>
      )}
    </div>
  );
} 