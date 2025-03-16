"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle, Lightbulb, ArrowRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { UI_PARAMS, DEFAULT_MESSAGES } from "@/lib/config-params";

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswerIndex: number;
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
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [wrongAnswers, setWrongAnswers] = useState<number[]>([]);
  const [showFullExplanation, setShowFullExplanation] = useState(false);

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    
    setHasSubmitted(true);
    const correct = selectedAnswer === question.correctAnswerIndex;
    setIsCorrect(correct);
    
    if (!correct) {
      // Wrong answer processing
      setWrongAnswers(prev => [...prev, selectedAnswer]);
      
      // Generate hint if it's the first wrong attempt
      if (wrongAnswers.length === 0) {
        onIncorrectAnswer(true);
      }
    }
  };

  const handleTryAgain = () => {
    setHasSubmitted(false);
    setSelectedAnswer(null);
  };

  const handleOptionClick = (index: number) => {
    if (!hasSubmitted) {
      setSelectedAnswer(index);
    }
  };

  const handleShowFullExplanation = () => {
    setShowFullExplanation(true);
  };

  const handleNextQuestion = () => {
    onCorrectAnswer();
  };

  return (
    <Card className="w-full shadow-sm">
      <CardContent className="p-3">
        <div className="space-y-3">
          <h3 className="text-lg font-medium">{question.text}</h3>

          <div className="space-y-2">
            {question.options.map((option, index) => (
              <div
                key={index}
                className={`flex items-center space-x-2 rounded-md border p-2 transition-colors ${
                  isCorrect === true && index === question.correctAnswerIndex
                    ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                    : wrongAnswers.includes(index)
                    ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                    : hasSubmitted && selectedAnswer === index && selectedAnswer !== question.correctAnswerIndex
                    ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                    : selectedAnswer === index && !hasSubmitted
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "hover:bg-muted/50"
                } ${!hasSubmitted ? "cursor-pointer" : ""}`}
                onClick={() => handleOptionClick(index)}
              >
                <div className="flex items-center h-full w-full">
                  <div className={`flex items-center justify-center h-4 w-4 rounded-full border mr-2 ${
                    selectedAnswer === index && !hasSubmitted ? "border-primary" : ""
                  }`}>
                    {selectedAnswer === index && (
                      <div 
                        className="rounded-full" 
                        style={{
                          width: '10px',
                          height: '10px',
                          backgroundColor: '#6366f1',
                          opacity: 1
                        }} 
                      />
                    )}
                  </div>
                  <span className="flex-1 text-sm">{option}</span>
                </div>
                {isCorrect === true && index === question.correctAnswerIndex && (
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                )}
                {(wrongAnswers.includes(index) || (hasSubmitted && selectedAnswer === index && selectedAnswer !== question.correctAnswerIndex)) && (
                  <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>

          {!hasSubmitted ? (
            <Button
              onClick={handleSubmit}
              disabled={selectedAnswer === null}
              className="w-full"
              size="sm"
            >
              Cevabı Gönder
            </Button>
          ) : isCorrect ? (
            <div className="space-y-3">
              <div className="p-2 rounded-md bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400">
                <p className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                  <span>Doğru! Harika iş.</span>
                </p>
              </div>
              
              <div className="flex justify-end">
                <Button
                  variant="default"
                  onClick={handleNextQuestion}
                  className="gap-1"
                  size="sm"
                >
                  Sonraki Soru
                  <ArrowRight className="ml-2 h-3 w-3" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-2 rounded-md bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400">
                <p className="flex items-center gap-2 text-sm">
                  <XCircle className="h-4 w-4 flex-shrink-0" />
                  <span>Bu cevap yanlış. Yavaşla ve adım adım düşün.</span>
                </p>
              </div>

              <div className="p-3 border rounded-md bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  <h4 className="font-medium text-sm">İpuçları</h4>
                </div>
                
                <div className="space-y-2">
                  {isLoadingHints ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                      <p className="text-sm">{DEFAULT_MESSAGES.LOADING_HINTS}</p>
                    </div>
                  ) : allHints.length > 0 ? (
                    allHints.slice(0, currentHintIndex + 1).map((hint, index) => (
                      <div key={index} className="flex gap-2">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xs">
                          {index + 1}
                        </div>
                        <p className="text-sm">{hint}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm">{DEFAULT_MESSAGES.LOADING_HINTS}</p>
                  )}
                </div>
                
                {showFullExplanation && fullExplanation && (
                  <>
                    <Separator className="my-2" />
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Tam Açıklama</h4>
                      <p className="text-sm whitespace-pre-line">{fullExplanation}</p>
                    </div>
                  </>
                )}

                <div className="flex flex-col sm:flex-row gap-2">
                  {!showFullExplanation && allHints.length > 0 && (
                    currentHintIndex < allHints.length - 1 ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={onShowMoreHints}
                      >
                        Biraz Daha İpucu
                        <ArrowRight className="ml-2 h-3 w-3" />
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={handleShowFullExplanation}
                        disabled={!fullExplanation}
                      >
                        Tüm Açıklamayı Göster
                        <ArrowRight className="ml-2 h-3 w-3" />
                      </Button>
                    )
                  )}
                  
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1"
                    onClick={handleTryAgain}
                  >
                    Tekrar Dene
                    <ArrowRight className="ml-2 h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div className="pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-amber-600 hover:text-amber-700 hover:bg-amber-100 dark:text-amber-400 dark:hover:text-amber-300 dark:hover:bg-amber-950/40"
                  onClick={onAskFollowUp}
                >
                  Anlamadığım Bir Şey Var
                </Button>
              </div>

              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={handleNextQuestion}
                  className="gap-1"
                  size="sm"
                >
                  Soruyu Atla
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 