"use client";

import { useMemo } from "react";
import { Question } from "@/components/preparation/question-display";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { CheckCircle2, XCircle, Clock, RotateCcw, BookOpen } from "lucide-react";

interface TestSession {
  questions: Question[];
  answers: (number | null)[];
  startTime: number;
  endTime: number | null;
  isComplete: boolean;
}

interface TestResultsProps {
  testSession: TestSession;
  onRestartTest: () => void;
}

export function TestResults({ testSession, onRestartTest }: TestResultsProps) {
  // Calculate score and other metrics
  const metrics = useMemo(() => {
    if (!testSession || !testSession.endTime) {
      return {
        score: 0,
        correctCount: 0,
        incorrectCount: 0,
        unansweredCount: 0,
        totalQuestions: 0,
        timeTaken: 0
      };
    }

    const correctCount = testSession.questions.reduce((count, question, index) => {
      const answer = testSession.answers[index];
      return count + (answer === question.correctAnswerIndex ? 1 : 0);
    }, 0);

    const unansweredCount = testSession.answers.filter(a => a === null).length;
    const incorrectCount = testSession.questions.length - correctCount - unansweredCount;
    const score = Math.round((correctCount / testSession.questions.length) * 100);
    const timeTaken = Math.floor((testSession.endTime - testSession.startTime) / 1000);

    return {
      score,
      correctCount,
      incorrectCount,
      unansweredCount,
      totalQuestions: testSession.questions.length,
      timeTaken
    };
  }, [testSession]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between h-8 mb-4">
        <div className="flex items-center gap-4">
          <h1 className="text-base font-semibold flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            Sınav Sonuçları
          </h1>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Sınav Sonucu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="flex flex-col items-center justify-center p-4 bg-primary/10 rounded-lg">
              <span className="text-4xl font-bold text-primary">{metrics.score}%</span>
              <span className="text-sm text-muted-foreground">Başarı Oranı</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-xl font-semibold text-green-600 dark:text-green-400">{metrics.correctCount}</span>
                </div>
                <span className="text-xs text-muted-foreground">Doğru</span>
              </div>
              
              <div className="flex flex-col items-center p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-center gap-1">
                  <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <span className="text-xl font-semibold text-red-600 dark:text-red-400">{metrics.incorrectCount}</span>
                </div>
                <span className="text-xs text-muted-foreground">Yanlış</span>
              </div>
              
              <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                <span className="text-xl font-semibold">{metrics.unansweredCount}</span>
                <span className="text-xs text-muted-foreground">Boş</span>
              </div>
              
              <div className="flex flex-col items-center p-3 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-xl font-semibold text-amber-600 dark:text-amber-400">{formatTime(metrics.timeTaken)}</span>
                </div>
                <span className="text-xs text-muted-foreground">Süre</span>
              </div>
            </div>
          </div>

          <h3 className="text-lg font-medium mb-3">Soru Detayları</h3>
          <div className="space-y-3">
            {testSession.questions.map((question, index) => {
              const userAnswer = testSession.answers[index];
              const isCorrect = userAnswer === question.correctAnswerIndex;
              const isUnanswered = userAnswer === null;
              
              return (
                <Card key={index} className={`border ${
                  isUnanswered 
                    ? "border-muted" 
                    : isCorrect 
                      ? "border-green-500" 
                      : "border-red-500"
                }`}>
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5 ${
                        isUnanswered 
                          ? "bg-muted text-muted-foreground" 
                          : isCorrect 
                            ? "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400" 
                            : "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                      }`}>
                        {isUnanswered ? (
                          <span className="text-xs">{index + 1}</span>
                        ) : isCorrect ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium mb-2">{question.text}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {question.options.map((option, optIndex) => (
                            <div 
                              key={optIndex}
                              className={`text-xs p-2 rounded-md ${
                                optIndex === question.correctAnswerIndex
                                  ? "bg-green-100 dark:bg-green-900/20 border border-green-500"
                                  : userAnswer === optIndex && userAnswer !== question.correctAnswerIndex
                                    ? "bg-red-100 dark:bg-red-900/20 border border-red-500"
                                    : "bg-muted/50"
                              }`}
                            >
                              {option}
                              {optIndex === question.correctAnswerIndex && (
                                <span className="ml-1 text-green-600 dark:text-green-400">(Doğru Cevap)</span>
                              )}
                              {userAnswer === optIndex && userAnswer !== question.correctAnswerIndex && (
                                <span className="ml-1 text-red-600 dark:text-red-400">(Senin Cevabın)</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={onRestartTest}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Yeni Sınav Başlat
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 