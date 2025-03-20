"use client";

import { useState, useEffect } from "react";
import { Question } from "@/components/preparation/question-display";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { UI_PARAMS, DEFAULT_MESSAGES } from "@/lib/config-params";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";

interface TestQuestionDisplayProps {
  question: Question;
  selectedAnswer: number | null;
  onAnswerSelect: (index: number) => void;
  onOpenEndedSubmit: (answer: string) => Promise<void>;
  testMode: boolean;
  previousOpenEndedAnswer?: string;
}

export function TestQuestionDisplay({
  question,
  selectedAnswer,
  onAnswerSelect,
  onOpenEndedSubmit,
  testMode,
  previousOpenEndedAnswer,
}: TestQuestionDisplayProps) {
  const [openEndedAnswer, setOpenEndedAnswer] = useState(previousOpenEndedAnswer || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(!!previousOpenEndedAnswer);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Reset or update state when question or previousOpenEndedAnswer changes
  useEffect(() => {
    if (previousOpenEndedAnswer) {
      setOpenEndedAnswer(previousOpenEndedAnswer);
      setIsSubmitted(true);
    } else {
      setOpenEndedAnswer("");
      setIsSubmitted(false);
    }
    setIsSubmitting(false);
    setSubmissionError(null);
  }, [question?.id, previousOpenEndedAnswer]);

  const handleOptionClick = (index: number) => {
    onAnswerSelect(index);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= UI_PARAMS.OPEN_ENDED_MAX_CHARS) {
      setOpenEndedAnswer(newValue);
      
      // Clear error when user starts typing
      if (submissionError) {
        setSubmissionError(null);
      }
    }
  };

  const handleOpenEndedSubmit = async () => {
    if (isSubmitting || !openEndedAnswer.trim()) return;

    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      await onOpenEndedSubmit(openEndedAnswer);
      setIsSubmitted(true);
    } catch (error) {
      setSubmissionError(
        error instanceof Error ? error.message : "Failed to submit answer"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!question) {
    return null;
  }

  return (
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
                  variant={selectedAnswer === index ? "default" : "outline"}
                  className={`w-full justify-start text-left px-4 py-2 h-auto ${
                    selectedAnswer === index
                      ? "bg-primary text-primary-foreground"
                      : ""
                  }`}
                  onClick={() => handleOptionClick(index)}
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
                  {selectedAnswer === index && (
                    <CheckCircle2 className="h-5 w-5 ml-2" />
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
                onChange={handleTextChange}
                disabled={isSubmitted || isSubmitting}
              />
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  {openEndedAnswer.length}/{UI_PARAMS.OPEN_ENDED_MAX_CHARS}
                </div>
                {!isSubmitted ? (
                  <Button
                    onClick={handleOpenEndedSubmit}
                    disabled={!openEndedAnswer.trim() || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Değerlendiriliyor...
                      </>
                    ) : (
                      "Cevabı Gönder"
                    )}
                  </Button>
                ) : (
                  <div className="text-sm text-green-600 dark:text-green-400 flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Cevabınız kaydedildi
                  </div>
                )}
              </div>
              
              {submissionError && (
                <div className="text-sm text-red-600 dark:text-red-400 mt-2">
                  {submissionError}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 