"use client";

import { useMemo } from "react";
import { Question } from "@/components/preparation/question-display";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { CheckCircle2, XCircle, Clock, RotateCcw, BookOpen, AlertTriangle } from "lucide-react";

interface TestSession {
  questions: Question[];
  answers: (number | null)[];
  openEndedAnswers?: Record<string, { answer: string; evaluation?: { isCorrect: number; explanation: string } }>;
  startTime: number;
  endTime: number | null;
  isComplete: boolean;
}

interface TestResultsProps {
  testSession: TestSession;
  onRestartTest: () => void;
}

// Helper to extract topic from question ID
function extractTopicFromId(id: string): string {
  // Format is Subject-Grade-Topic-Hash
  const parts = id.split('-');
  if (parts.length >= 3) {
    return parts[2]; // Topic is the third part
  }
  return 'Unknown Topic';
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
        timeTaken: 0,
        topicMistakes: {}
      };
    }

    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;

    // Process multiple-choice questions
    testSession.questions.forEach((question, index) => {
      if (question.type === "multiple-choice") {
        const answer = testSession.answers[index];
        if (answer === null) {
          unansweredCount++;
        } else if (answer === question.correctAnswerIndex) {
          correctCount++;
        } else {
          incorrectCount++;
        }
      }
    });

    // Process open-ended questions
    if (testSession.openEndedAnswers) {
      Object.entries(testSession.openEndedAnswers).forEach(([questionId, data]) => {
        if (!data.evaluation) {
          unansweredCount++;
        } else if (data.evaluation.isCorrect === 1) {
          correctCount++;
        } else {
          incorrectCount++;
        }
      });
    }

    const totalQuestions = testSession.questions.length;
    const score = Math.round((correctCount / totalQuestions) * 100);
    const timeTaken = Math.floor((testSession.endTime - testSession.startTime) / 1000);

    // Track mistakes by topic
    const topicMistakes: Record<string, { incorrect: number, total: number }> = {};
    
    testSession.questions.forEach((question, index) => {
      const topic = extractTopicFromId(question.id);
      
      if (!topicMistakes[topic]) {
        topicMistakes[topic] = { incorrect: 0, total: 0 };
      }
      
      topicMistakes[topic].total += 1;
      
      if (question.type === "multiple-choice") {
        const answer = testSession.answers[index];
        if (answer !== null && answer !== question.correctAnswerIndex) {
          topicMistakes[topic].incorrect += 1;
        }
      } else if (question.type === "open-ended" && testSession.openEndedAnswers) {
        const evaluation = testSession.openEndedAnswers[question.id]?.evaluation;
        if (evaluation && evaluation.isCorrect === 0) {
          topicMistakes[topic].incorrect += 1;
        }
      }
    });

    return {
      score,
      correctCount,
      incorrectCount,
      unansweredCount,
      totalQuestions,
      timeTaken,
      topicMistakes
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

          {/* Topic Mistakes Chart */}
          <h3 className="text-lg font-medium mb-3">Konu Bazlı Analiz</h3>
          {Object.keys(metrics.topicMistakes).length > 0 ? (
            <div className="space-y-2 mb-6">
              {Object.entries(metrics.topicMistakes)
                .filter(([_, data]) => data.total > 0)
                .sort((a, b) => (b[1].incorrect / b[1].total) - (a[1].incorrect / a[1].total))
                .map(([topic, data]) => {
                  const errorRate = data.incorrect / data.total;
                  const errorPercentage = Math.round(errorRate * 100);
                  let barColor = "bg-green-500";
                  
                  if (errorRate > 0.7) {
                    barColor = "bg-red-500";
                  } else if (errorRate > 0.3) {
                    barColor = "bg-amber-500";
                  }
                  
                  return (
                    <div key={topic} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium">{topic}</span>
                        <span className="text-muted-foreground">
                          {data.incorrect} / {data.total} Yanlış ({errorPercentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className={`${barColor} h-2 rounded-full`} 
                          style={{ width: `${errorPercentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              }
            </div>
          ) : (
            <div className="flex gap-2 items-center p-3 bg-muted rounded-lg mb-6">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Konu bazlı analiz için yeterli veri bulunamadı.</span>
            </div>
          )}

          <h3 className="text-lg font-medium mb-3">Soru Detayları</h3>
          <div className="space-y-3">
            {testSession.questions.map((question, index) => {
              const topic = extractTopicFromId(question.id);
              
              if (question.type === "multiple-choice") {
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
                          <div className="flex justify-between items-start mb-1">
                            <p className="text-sm font-medium">{question.text}</p>
                            <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">{topic}</span>
                          </div>
                          
                          {!isUnanswered && (
                            <div className="flex flex-wrap gap-2 mb-2">
                              {userAnswer !== null && (
                                <div className={`text-xs px-2 py-1 rounded-md font-medium ${
                                  isCorrect 
                                    ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" 
                                    : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                                }`}>
                                  {isCorrect ? "Doğru Cevap: " : "Senin Cevabın: "}
                                  <span className="font-bold">{String.fromCharCode(65 + userAnswer)}</span>
                                </div>
                              )}
                              
                              {!isCorrect && userAnswer !== null && question.correctAnswerIndex !== undefined && (
                                <div className="text-xs px-2 py-1 rounded-md font-medium bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">
                                  Doğru Cevap: <span className="font-bold">{String.fromCharCode(65 + question.correctAnswerIndex)}</span>
                                </div>
                              )}
                            </div>
                          )}
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {question.options?.map((option, optIndex) => (
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
                                <div className="flex items-center">
                                  <span className="font-medium mr-2 text-xs min-w-[12px]">{String.fromCharCode(65 + optIndex)}.</span>
                                  <span className="text-xs">{option}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              } else {
                // Handle open-ended questions
                const answerData = testSession.openEndedAnswers?.[question.id];
                const isUnanswered = !answerData || !answerData.evaluation;
                const isCorrect = answerData?.evaluation?.isCorrect === 1;
                const explanation = answerData?.evaluation?.explanation;
                
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
                          <div className="flex justify-between items-start mb-1">
                            <p className="text-sm font-medium">{question.text}</p>
                            <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">{topic}</span>
                          </div>
                          
                          {answerData && (
                            <div className="space-y-2">
                              <div className="bg-muted/50 p-2 rounded-md text-xs">
                                <p className="font-medium mb-1">Yanıtınız:</p>
                                <p>{answerData.answer}</p>
                              </div>
                              
                              {explanation && (
                                <div className={`p-2 rounded-md text-xs ${
                                  isCorrect 
                                    ? "bg-green-100 dark:bg-green-900/20 border border-green-500" 
                                    : "bg-red-100 dark:bg-red-900/20 border border-red-500"
                                }`}>
                                  <p className="font-medium mb-1">Değerlendirme:</p>
                                  <p>{explanation}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              }
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