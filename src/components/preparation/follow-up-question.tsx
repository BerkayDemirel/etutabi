"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, Send } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface FollowUpQuestionProps {
  onSubmit: (question: string) => Promise<string>;
  onClose: () => void;
}

export function FollowUpQuestion({ onSubmit, onClose }: FollowUpQuestionProps) {
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!question.trim()) return;
    
    setIsLoading(true);
    try {
      const result = await onSubmit(question);
      setResponse(result);
    } catch {
      setResponse("Üzgünüm, sorunuzu işleyemedim. Lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full mt-4 shadow-sm">
      <CardHeader className="pb-2 pt-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-blue-500" />
          Ek Soru Sor
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 pb-2">
        <div className="space-y-3">
          <div className="relative">
            <textarea
              className="w-full min-h-20 p-3 border rounded-md bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              placeholder="Açıklamanın hangi kısmı hala net değil? Anlamadığınız kısım hakkında spesifik olun."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={isLoading || !!response}
            />
            <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
              {question.length}/200
            </div>
          </div>

          {isLoading && (
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-5/6" />
            </div>
          )}

          {response && (
            <div className="p-2 border rounded-md bg-muted/30">
              <p className="whitespace-pre-line text-sm">{response}</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between gap-2 pt-0 pb-3">
        {!response ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
            >
              İptal
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!question.trim() || isLoading}
            >
              <Send className="mr-2 h-3 w-3" />
              Soruyu Gönder
            </Button>
          </>
        ) : (
          <Button
            className="w-full"
            size="sm"
            onClick={onClose}
          >
            Devam Et
          </Button>
        )}
      </CardFooter>
    </Card>
  );
} 