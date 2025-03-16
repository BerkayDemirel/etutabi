"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAppContext } from "@/lib/context/app-context";
import { QuestionDisplay, Question } from "./question-display";
import { FollowUpPanel } from "./follow-up-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchRandomQuestion } from "@/services/api-question-service";
import { ArrowRight, BookOpen, HelpCircle, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { DEFAULT_MESSAGES } from "@/lib/config-params";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface FollowUpQuestion {
  question: string;
  answer: string;
  timestamp: number;
}

interface PreparationPageProps {
  onSidePanelChange?: (isOpen: boolean) => void;
}

export function PreparationPage({ onSidePanelChange }: PreparationPageProps) {
  // Context
  const { currentSubject, currentGrade } = useAppContext();
  
  // Main states
  const [question, setQuestion] = useState<Question | null>(null);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  
  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Hint states
  const [hints, setHints] = useState<string[]>([]);
  const [fullExplanation, setFullExplanation] = useState<string | null>(null);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [isLoadingHints, setIsLoadingHints] = useState(false);
  
  // Follow-up states
  const [showFollowUpPanel, setShowFollowUpPanel] = useState(false);
  const [followUpHistory, setFollowUpHistory] = useState<FollowUpQuestion[]>([]);
  const [isSubmittingFollowUp, setIsSubmittingFollowUp] = useState(false);

  // Function to load a new random question
  const loadQuestion = useCallback(async () => {
    if (!currentSubject || !currentGrade) return;
    
    // Reset states
    setIsLoading(true);
    setHints([]);
    setFullExplanation(null);
    setFollowUpHistory([]);
    setShowFollowUpPanel(false);
    setError(null);
    
    try {
      const newQuestion = await fetchRandomQuestion(currentSubject, currentGrade);
      
      if (newQuestion) {
        setQuestion(newQuestion);
      } else {
        setError(DEFAULT_MESSAGES.NO_QUESTIONS_FOUND);
      }
    } catch (error) {
      console.error("Error loading question:", error);
      setError(DEFAULT_MESSAGES.QUESTION_LOAD_ERROR);
    } finally {
      setIsLoading(false);
    }
  }, [currentSubject, currentGrade]);

  // Load a question when the component mounts or subject/grade changes
  useEffect(() => {
    if (currentSubject && currentGrade) {
      loadQuestion();
    }
  }, [currentSubject, currentGrade, loadQuestion]);
  
  // Load hints for a question
  const loadHints = useCallback(async (questionId: string) => {
    if (isLoadingHints || !question) return;
    
    setIsLoadingHints(true);
    
    try {
      // First try to fetch existing hints
      const timestamp = Date.now();
      const url = `/api/hints?questionId=${encodeURIComponent(questionId)}&t=${timestamp}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      // If hints exist, use them
      if (response.ok) {
        const data = await response.json();
        setHints(data.steps || []);
        setFullExplanation(data.fullExplanation || null);
        return;
      }
      
      // If we need to generate new hints
      const generateResponse = await fetch('/api/hints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId,
          questionText: question.text,
          options: question.options,
          correctAnswerIndex: question.correctAnswerIndex,
          subject: currentSubject,
        }),
      });
      
      if (generateResponse.ok) {
        const data = await generateResponse.json();
        setHints(data.steps || []);
        setFullExplanation(data.fullExplanation || null);
      } else {
        // If hint generation fails, set default hints
        setHints([DEFAULT_MESSAGES.ERROR_LOADING_HINTS]);
      }
    } catch (error) {
      console.error("Error loading hints:", error);
      setHints([DEFAULT_MESSAGES.ERROR_LOADING_HINTS]);
    } finally {
      setIsLoadingHints(false);
    }
  }, [question, currentSubject, isLoadingHints]);

  // Handle when the student answers correctly
  const handleCorrectAnswer = useCallback(() => {
    setQuestionsAnswered(prev => prev + 1);
    loadQuestion();
  }, [loadQuestion]);

  // Handle when the student answers incorrectly
  const handleIncorrectAnswer = useCallback(async () => {
    // Only load hints when the student answers incorrectly and we don't have hints yet
    if (question && hints.length === 0) {
      setCurrentHintIndex(0); // Reset hint index to ensure we start with the first hint
      await loadHints(question.id);
    }
  }, [question, hints.length, loadHints]);

  // Show more hints when requested
  const handleShowMoreHints = useCallback(() => {
    if (currentHintIndex < hints.length - 1) {
      setCurrentHintIndex(prev => prev + 1);
    }
  }, [currentHintIndex, hints.length]);

  // Handle follow-up question submission
  const handleFollowUpSubmit = useCallback(async (newQuestion: string) => {
    if (!newQuestion.trim() || !question) return;
    
    setIsSubmittingFollowUp(true);
    
    try {
      // Format choices with labels
      const formattedChoices = question.options.map((option, index) => 
        `Choice ${String.fromCharCode(65 + index)}: ${option}`
      ).join('\n');

      // Send the follow-up question to the API
      const response = await fetch('/api/follow-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText: question.text,
          choices: formattedChoices,
          correctAnswer: `Choice ${String.fromCharCode(65 + question.correctAnswerIndex)}: ${question.options[question.correctAnswerIndex]}`,
          hints: hints,
          fullExplanation: fullExplanation,
          followUpQuestion: newQuestion,
          subject: currentSubject,
          previousConversation: followUpHistory.map(item => ({
            question: item.question,
            answer: item.answer
          }))
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        // Add the new question and answer to history
        setFollowUpHistory(prev => [...prev, {
          question: newQuestion,
          answer: data.response,
          timestamp: Date.now()
        }]);
      } else {
        setFollowUpHistory(prev => [...prev, {
          question: newQuestion,
          answer: DEFAULT_MESSAGES.FOLLOW_UP_ERROR,
          timestamp: Date.now()
        }]);
      }
    } catch (error) {
      console.error("Error generating follow-up response:", error);
      setFollowUpHistory(prev => [...prev, {
        question: newQuestion,
        answer: DEFAULT_MESSAGES.FOLLOW_UP_ERROR,
        timestamp: Date.now()
      }]);
    } finally {
      setIsSubmittingFollowUp(false);
    }
  }, [question, currentSubject, hints, fullExplanation, followUpHistory]);

  // Update parent component when side panel state changes
  useEffect(() => {
    onSidePanelChange?.(showFollowUpPanel);
  }, [showFollowUpPanel, onSidePanelChange]);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-3">
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
          onClick={loadQuestion} 
          className="mt-3"
          size="sm"
        >
          Tekrar Dene
        </Button>
      </div>
    );
  }

  // No question found state
  if (!question) {
    return (
      <div className="text-center p-3">
        <p className="text-base text-muted-foreground">
          {DEFAULT_MESSAGES.NO_QUESTIONS_FOUND}
        </p>
      </div>
    );
  }

  // Main render with question
  return (
    <div className="absolute inset-x-0 bottom-0 top-[57px] flex">
      {/* Main content */}
      <div className="flex-[3] flex flex-col min-w-0 px-6 py-4">
        <div className="flex items-center justify-between h-8 mb-2">
          <div className="flex items-center gap-4">
            <h1 className="text-base font-semibold flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              Hazırlık Modu
            </h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>Ders: {currentSubject === 'math' ? 'Matematik' : 
                         currentSubject === 'physics' ? 'Fizik' :
                         currentSubject === 'chemistry' ? 'Kimya' :
                         currentSubject === 'biology' ? 'Biyoloji' :
                         currentSubject === 'social-studies' ? 'Sosyal Bilgiler' :
                         currentSubject === 'english' ? 'İngilizce' : ''}</span>
              <span>•</span>
              <span>{currentGrade}. Sınıf</span>
              <span>•</span>
              <span>Cevaplanan: {questionsAnswered}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 pr-2">
          <QuestionDisplay
            question={question}
            onCorrectAnswer={handleCorrectAnswer}
            onIncorrectAnswer={handleIncorrectAnswer}
            allHints={hints}
            onShowMoreHints={handleShowMoreHints}
            currentHintIndex={currentHintIndex}
            fullExplanation={fullExplanation || ""}
            onAskFollowUp={() => setShowFollowUpPanel(true)}
            isLoadingHints={isLoadingHints}
          />
        </div>
      </div>

      {/* Follow-up panel */}
      {showFollowUpPanel && (
        <div className={`border-l bg-background flex-shrink-0 relative transition-all duration-200 ease-in-out`} style={{ width: '400px' }}>
          <Button
            variant="ghost"
            size="sm"
            className="absolute -left-[120px] top-2 h-10 px-3 rounded-l bg-background border-l border-y hover:bg-muted flex items-center gap-2"
            onClick={() => setShowFollowUpPanel(false)}
            title="Yardım Panelini Kapat"
          >
            <PanelLeftOpen className="h-5 w-5" />
            <span className="text-sm font-medium">Paneli Kapat</span>
          </Button>
          <FollowUpPanel
            onSubmit={handleFollowUpSubmit}
            isSubmitting={isSubmittingFollowUp}
            followUpHistory={followUpHistory}
          />
        </div>
      )}

      {!showFollowUpPanel && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-0 top-2 h-10 px-3 rounded-l bg-background border-l border-y hover:bg-muted flex items-center gap-2"
          onClick={() => setShowFollowUpPanel(true)}
          title="Yardım İste"
        >
          <PanelLeftClose className="h-5 w-5" />
          <span className="text-sm font-medium">Yardım İste</span>
        </Button>
      )}
    </div>
  );
} 