"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { UI_PARAMS, DEFAULT_MESSAGES } from "@/lib/config-params";

interface OpenEndedQuestionInputProps {
  onSubmit: (answer: string) => Promise<void>;
  isCorrect?: boolean;
  hasSubmitted: boolean;
  explanation?: string;
  isLoading?: boolean;
  error?: string;
}

export function OpenEndedQuestionInput({
  onSubmit,
  isCorrect,
  hasSubmitted,
  explanation,
  isLoading = false,
  error,
}: OpenEndedQuestionInputProps) {
  const [answer, setAnswer] = useState("");
  const [charCount, setCharCount] = useState(0);
  const MAX_CHARS = UI_PARAMS.OPEN_ENDED_MAX_CHARS;
  const [localError, setLocalError] = useState<string | null>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= MAX_CHARS) {
      setAnswer(newValue);
      setCharCount(newValue.length);
      
      // Clear error if user starts typing again
      if (localError) {
        setLocalError(null);
      }
    }
  };

  const handleSubmit = async () => {
    if (hasSubmitted || isLoading) return;
    
    if (!answer.trim()) {
      setLocalError("Lütfen cevabınızı yazın.");
      return;
    }
    
    try {
      await onSubmit(answer);
    } catch (err) {
      setLocalError("Cevabınız gönderilirken bir hata oluştu. Lütfen tekrar deneyin.");
      console.error("Error submitting answer:", err);
    }
  };

  return (
    <div className="space-y-4">
      <Textarea
        placeholder="Cevabınızı buraya yazın..."
        className={`min-h-[150px] resize-none ${
          hasSubmitted ? "bg-muted" : ""
        }`}
        value={answer}
        onChange={handleTextChange}
        disabled={hasSubmitted || isLoading}
      />
      
      <div className="flex justify-between items-center">
        <div className="text-xs text-muted-foreground">
          {charCount}/{MAX_CHARS} karakter
        </div>
        
        {!hasSubmitted ? (
          <Button 
            onClick={handleSubmit} 
            disabled={!answer.trim() || isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Değerlendiriliyor...
              </>
            ) : (
              "Cevabı Gönder"
            )}
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            {isCorrect ? (
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm font-medium">Doğru</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                <XCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Yanlış</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error message */}
      {(localError || error) && (
        <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-300 rounded-md text-sm">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>{localError || error || DEFAULT_MESSAGES.OPEN_ENDED_EVALUATION_ERROR}</span>
        </div>
      )}

      {hasSubmitted && explanation && (
        <Card className={`border ${
          isCorrect 
            ? "border-green-500 bg-green-50 dark:bg-green-950/20" 
            : "border-red-500 bg-red-50 dark:bg-red-950/20"
        }`}>
          <CardContent className="p-3 text-sm">
            <p className="font-medium mb-1">
              {isCorrect ? "Harika iş!" : "Geri Bildirim:"}
            </p>
            <p>{explanation}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 