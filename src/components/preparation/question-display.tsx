"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle, Lightbulb, ArrowRight, RotateCcw, HelpCircle, Loader2, BookOpen } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { UI_PARAMS, DEFAULT_MESSAGES } from "@/lib/config-params";
import { OpenEndedQuestionInput } from "./open-ended-question-input";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";

export interface Question {
  id: string;
  text: string;
  type: "multiple-choice" | "open-ended";
  // For multiple-choice questions
  options?: string[];
  correctAnswerIndex?: number;
  // For open-ended questions
  correctAnswer?: string;
}

interface QuestionDisplayProps {
  question: Question;
  onCorrectAnswer: () => void;
  onIncorrectAnswer: (showHint?: boolean) => void;
  allHints?: string[];
  onShowMoreHints: () => void;
  currentHintIndex: number;
  fullExplanation?: string;
  onAskFollowUp?: () => void;
  isLoadingHints?: boolean;
}

export function QuestionDisplay({
  question,
  onCorrectAnswer,
  onIncorrectAnswer,
  allHints = [],
  onShowMoreHints,
  currentHintIndex,
  fullExplanation,
  onAskFollowUp,
  isLoadingHints = false,
}: QuestionDisplayProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showAnswerResult, setShowAnswerResult] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [openEndedAnswer, setOpenEndedAnswer] = useState("");
  const [openEndedFeedback, setOpenEndedFeedback] = useState<{
    isCorrect: boolean;
    explanation: string;
  } | null>(null);
  const [isSubmittingOpenEnded, setIsSubmittingOpenEnded] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  // Mark when component has mounted on client
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Reset state when question changes
  useEffect(() => {
    setSelectedOption(null);
    setShowAnswerResult(false);
    setIsCorrect(false);
    setFeedbackMessage("");
    setOpenEndedAnswer("");
    setOpenEndedFeedback(null);
    setShowHints(false);
    setShowExplanation(false);
  }, [question?.id]);

  const handleOptionSelect = (optionIndex: number) => {
    if (showAnswerResult) return;
    
    setSelectedOption(optionIndex);
    setShowAnswerResult(true);
    
    const correct = optionIndex === question?.correctAnswerIndex;
    setIsCorrect(correct);
    
    // Move random feedback generation to a useEffect to prevent hydration mismatch
    if (correct) {
      const messages = DEFAULT_MESSAGES.CORRECT_ANSWER_FEEDBACK;
      setFeedbackMessage(messages[0]); // Use first message for initial render
    } else {
      const messages = DEFAULT_MESSAGES.INCORRECT_ANSWER_FEEDBACK;
      setFeedbackMessage(messages[0]); // Use first message for initial render
    }
    
    // Trigger parent callbacks for incorrect answers
    if (!correct) {
      onIncorrectAnswer?.();
    }
    
    // Only auto-proceed if explicitly configured to do so
    if (correct && UI_PARAMS.AUTO_PROCEED_AFTER_CORRECT) {
      setTimeout(() => {
        onCorrectAnswer?.();
      }, UI_PARAMS.CORRECT_ANSWER_DELAY_MS);
    }
  };

  // Generate random feedback message after initial render to avoid hydration errors
  useEffect(() => {
    if (showAnswerResult) {
      const messages = isCorrect 
        ? DEFAULT_MESSAGES.CORRECT_ANSWER_FEEDBACK 
        : DEFAULT_MESSAGES.INCORRECT_ANSWER_FEEDBACK;
      const randomIndex = Math.floor(Math.random() * messages.length);
      setFeedbackMessage(messages[randomIndex]);
    }
  }, [showAnswerResult, isCorrect]);

  // Handle open-ended answer submission
  const handleOpenEndedSubmit = async () => {
    if (!openEndedAnswer.trim() || isSubmittingOpenEnded) return;
    
    setIsSubmittingOpenEnded(true);
    
    try {
      // Call the API to evaluate the open-ended answer
      const response = await fetch('/api/evaluate-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId: question?.id,
          questionText: question?.text,
          studentAnswer: openEndedAnswer,
          correctAnswer: question?.correctAnswer,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to evaluate answer');
      }
      
      const result = await response.json();
      
      // Set feedback with detailed explanation
      setOpenEndedFeedback({
        isCorrect: result.isCorrect > 0.7, // Consider it correct if score > 0.7
        explanation: result.explanation
      });
      
      // Never auto-proceed regardless of correctness
    } catch (error) {
      console.error('Error evaluating open-ended answer:', error);
      setOpenEndedFeedback({
        isCorrect: false,
        explanation: DEFAULT_MESSAGES.OPEN_ENDED_EVALUATION_ERROR
      });
    } finally {
      setIsSubmittingOpenEnded(false);
      setShowAnswerResult(true);
    }
  };

  const handleNextQuestion = () => {
    onCorrectAnswer?.();
  };
  
  // Rendered hints section
  const renderedHints = useMemo(() => {
    if (!showAnswerResult || isCorrect || allHints.length === 0 || question?.type === "open-ended") {
      return null;
    }
    
    return (
      <div className="mt-4 border rounded-lg p-3 bg-muted/10">
        <div className="space-y-2">
          <h3 className="text-base font-medium flex items-center">
            <Lightbulb className="h-5 w-5 mr-2 text-amber-500" />
            {UI_PARAMS.FIRST_HINT_LABEL}
          </h3>
          
          {isLoadingHints ? (
            <div className="text-sm text-muted-foreground flex items-center">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {DEFAULT_MESSAGES.LOADING_HINTS}
            </div>
          ) : (
            <div className="space-y-2">
              {allHints.slice(0, currentHintIndex + 1).map((hint, index) => (
                <div key={index}>
                  {index > 0 && <Separator className="my-1 opacity-30" />}
                  <div className="p-2 bg-card border rounded-md shadow-sm">
                    <ReactMarkdown
                      remarkPlugins={[remarkMath, remarkGfm]}
                      rehypePlugins={[rehypeKatex]}
                    >
                      {hint}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }, [showAnswerResult, isCorrect, allHints, currentHintIndex, isLoadingHints, question?.type]);

  const handleShowHints = () => {
    setShowHints(true);
    onIncorrectAnswer(true);
  };

  const handleTryAgain = () => {
    setSelectedOption(null);
    setShowAnswerResult(false);
    setIsCorrect(false);
    setFeedbackMessage("");
    setShowHints(false);
    setShowExplanation(false);
  };

  const handleShowSolution = () => {
    setShowExplanation(true);
  };

  const handleShowMoreHint = () => {
    // When clicking for the first time, just show the first hint without incrementing
    if (!showHints) {
      setShowHints(true);
      // Don't call onShowMoreHints for the first click - we start with index 0
    } else if (currentHintIndex < allHints.length - 1) {
      // For subsequent clicks, increment the hint index
      onShowMoreHints();
    }
  };

  // Only show navigation buttons on client-side
  const navigationButtons = useMemo(() => {
    if (!isClient || !showAnswerResult || question?.type === "open-ended") {
      return null;
    }

    // For correct answers, only show next question button
    if (isCorrect) {
      return (
        <div className="mt-4 flex justify-end">
          <Button 
            onClick={handleNextQuestion}
            variant="outline"
            size="sm"
          >
            Sonraki Soru
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    }

    // For incorrect answers, show all navigation buttons
    return (
      <div className="mt-4 flex flex-wrap gap-2">
        {/* Show hint button only when solution is not displayed */}
        {!showExplanation && (
          currentHintIndex < allHints.length - 1 ? (
            <Button 
              onClick={handleShowMoreHint}
              variant="outline"
              size="sm"
              disabled={isLoadingHints}
            >
              <Lightbulb className="mr-2 h-4 w-4" />
              {!showHints ? "İpucu Al" : UI_PARAMS.SHOW_MORE_HINTS_BUTTON_LABEL}
            </Button>
          ) : (
            <Button 
              variant="outline"
              size="sm"
              disabled={true}
            >
              <Lightbulb className="mr-2 h-4 w-4" />
              İpucu Al
            </Button>
          )
        )}
        
        <Button 
          onClick={handleTryAgain}
          variant="outline"
          size="sm"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Tekrar Dene
        </Button>
        
        {!showExplanation ? (
          <Button 
            onClick={handleShowSolution}
            variant="outline"
            size="sm"
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Çözümü Göster
          </Button>
        ) : (
          <Button 
            variant="outline"
            size="sm"
            disabled={true}
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Çözümü Göster
          </Button>
        )}
        
        {onAskFollowUp && (
          <Button 
            onClick={onAskFollowUp}
            variant="outline"
            size="sm"
          >
            <HelpCircle className="mr-2 h-4 w-4" />
            Soru Sor
          </Button>
        )}
        
        {showExplanation && (
          <Button 
            onClick={handleNextQuestion}
            variant="outline"
            size="sm"
          >
            Sonraki Soru
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }, [isClient, showAnswerResult, isCorrect, question?.type, showExplanation, currentHintIndex, 
      allHints, isLoadingHints, showHints, onAskFollowUp]);

  // Ensure hints are only shown on client side
  const hintsSection = useMemo(() => {
    if (!isClient || !showHints || !showAnswerResult || isCorrect || allHints.length === 0 || question?.type === "open-ended") {
      return null;
    }
    
    return renderedHints;
  }, [isClient, showHints, showAnswerResult, isCorrect, allHints, renderedHints, question?.type]);
  
  // Ensure explanation is only shown on client side
  const explanationSection = useMemo(() => {
    if (!isClient || !showExplanation || !fullExplanation) return null;
    
    return (
      <div className="mt-4 border-2 border-blue-400 dark:border-blue-600 rounded-lg overflow-hidden">
        <div className="bg-blue-50 dark:bg-blue-900/30 px-4 py-3 flex items-center">
          <BookOpen className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
          <h3 className="text-base font-medium text-blue-700 dark:text-blue-400">
            {UI_PARAMS.FULL_EXPLANATION_LABEL}
          </h3>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 shadow-inner">
          <div className="bg-card p-3 rounded-md border shadow-sm">
            <ReactMarkdown
              remarkPlugins={[remarkMath, remarkGfm]}
              rehypePlugins={[rehypeKatex]}
            >
              {fullExplanation}
            </ReactMarkdown>
          </div>
          
          {/* Correct answer highlight */}
          {question.type === "multiple-choice" && (
            <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
              <div className="text-sm font-medium text-green-800 dark:text-green-400 flex items-center mb-1">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Doğru Cevap
              </div>
              <div className="text-sm">
                {question.options && (
                  <span>
                    {String.fromCharCode(65 + (question.correctAnswerIndex || 0))}.{" "}
                    {question.options[question.correctAnswerIndex || 0]}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }, [isClient, showExplanation, fullExplanation, question]);

  if (!question) {
    return null;
  }

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Question Text */}
            <div className="space-y-2">
              <div className="text-base">
                <ReactMarkdown
                  remarkPlugins={[remarkMath, remarkGfm]}
                  rehypePlugins={[rehypeKatex]}
                >
                  {question.text}
                </ReactMarkdown>
              </div>
            </div>

            {/* Multiple Choice Options */}
            {question.type === "multiple-choice" && (
              <div className="space-y-2">
                {question.options?.map((option, index) => (
                  <Button
                    key={index}
                    variant={selectedOption === index 
                      ? (isCorrect ? "default" : "destructive")
                      : "outline"
                    }
                    className={`w-full justify-start text-left px-4 py-2 h-auto ${
                      showExplanation && question.correctAnswerIndex === index
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                        : ""
                    }`}
                    onClick={() => handleOptionSelect(index)}
                    disabled={showAnswerResult}
                  >
                    <div className="mr-2">{String.fromCharCode(65 + index)}.</div>
                    <div className="flex-1">
                      <ReactMarkdown
                        remarkPlugins={[remarkMath, remarkGfm]}
                        rehypePlugins={[rehypeKatex]}
                      >
                        {option}
                      </ReactMarkdown>
                    </div>
                    {showExplanation && index === question.correctAnswerIndex && (
                      <CheckCircle2 className="h-5 w-5 text-green-500 ml-2" />
                    )}
                    {showAnswerResult && selectedOption === index && !isCorrect && (
                      <XCircle className="h-5 w-5 text-red-500 ml-2" />
                    )}
                  </Button>
                ))}
              </div>
            )}

            {/* Open Ended Answer Input */}
            {question.type === "open-ended" && (
              <div className="space-y-3">
                <Textarea
                  placeholder="Cevabınızı buraya yazın..."
                  className="min-h-[100px]"
                  maxLength={UI_PARAMS.OPEN_ENDED_MAX_CHARS}
                  value={openEndedAnswer}
                  onChange={(e) => setOpenEndedAnswer(e.target.value)}
                  disabled={showAnswerResult || isSubmittingOpenEnded}
                />
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    {openEndedAnswer.length}/{UI_PARAMS.OPEN_ENDED_MAX_CHARS}
                  </div>
                  {!showAnswerResult && (
                    <Button
                      onClick={handleOpenEndedSubmit}
                      disabled={!openEndedAnswer.trim() || isSubmittingOpenEnded}
                    >
                      {isSubmittingOpenEnded ? (
                        <>
                          <Loader2 className="mr-2 h-4 animate-spin" />
                          Değerlendiriliyor...
                        </>
                      ) : (
                        "Cevabı Gönder"
                      )}
                    </Button>
                  )}
                </div>
                
                {/* Open-ended feedback */}
                {openEndedFeedback && (
                  <div className={`p-4 rounded-md mt-4 border-2 ${
                    openEndedFeedback.isCorrect 
                      ? "bg-green-50 dark:bg-green-900/30 border-green-500 dark:border-green-600" 
                      : "bg-red-50 dark:bg-red-900/30 border-red-500 dark:border-red-600"
                  }`}>
                    <div className="flex items-center mb-3">
                      {openEndedFeedback.isCorrect ? (
                        <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400 mr-2" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-600 dark:text-red-400 mr-2" />
                      )}
                      <h3 className={`text-base font-medium ${
                        openEndedFeedback.isCorrect
                          ? "text-green-700 dark:text-green-400"
                          : "text-red-700 dark:text-red-400"
                      }`}>
                        {openEndedFeedback.isCorrect ? "Doğru Cevap!" : "Cevabınız Eksik veya Hatalı"}
                      </h3>
                    </div>
                    <ReactMarkdown
                      remarkPlugins={[remarkMath, remarkGfm]}
                      rehypePlugins={[rehypeKatex]}
                    >
                      {openEndedFeedback.explanation}
                    </ReactMarkdown>
                    
                    {/* Next question button for open-ended questions */}
                    <div className="mt-4 flex justify-end">
                      <Button onClick={handleNextQuestion}>
                        Sonraki Soru
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Feedback for multiple choice */}
            {question.type === "multiple-choice" && showAnswerResult && (
              <div
                className={`p-3 rounded-md text-sm ${
                  isCorrect
                    ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900"
                    : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900"
                }`}
              >
                {feedbackMessage}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Navigation buttons */}
      {navigationButtons}

      {/* Hints Section */}
      {hintsSection}

      {/* Full explanation section */}
      {explanationSection}
    </div>
  );
} 