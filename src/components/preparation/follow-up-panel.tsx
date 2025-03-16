import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Send, MessageCircle, Loader2 } from "lucide-react";
import { DEFAULT_MESSAGES } from "@/lib/config-params";
import Latex from 'react-latex-next';
import 'katex/dist/katex.min.css';

interface FollowUpQuestion {
  question: string;
  answer: string;
  timestamp: number;
}

interface FollowUpPanelProps {
  onSubmit: (question: string) => Promise<void>;
  isSubmitting: boolean;
  followUpHistory: FollowUpQuestion[];
}

// Function to process text and wrap LaTeX expressions
const processLatexInText = (text: string): string => {
  // Replace \( and \) with $ for inline math
  let processed = text.replace(/\\\(/g, '$').replace(/\\\)/g, '$');
  
  // Replace \[ and \] with $$ for block math
  processed = processed.replace(/\\\[/g, '$$').replace(/\\\]/g, '$$');
  
  return processed;
};

export function FollowUpPanel({ onSubmit, isSubmitting, followUpHistory }: FollowUpPanelProps) {
  const [newQuestion, setNewQuestion] = useState("");

  const handleSubmit = async () => {
    if (!newQuestion.trim() || isSubmitting) return;
    await onSubmit(newQuestion);
    setNewQuestion("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-1.5 h-7 px-3 border-b">
        <MessageCircle className="h-3.5 w-3.5" />
        <h2 className="text-sm font-medium">Sorularınız</h2>
      </div>

      {/* Question History - Scrollable */}
      <div className="flex-1 overflow-y-auto min-h-0 px-3 py-2">
        {followUpHistory.map((item, index) => (
          <Card key={index} className="p-2 mb-2 last:mb-0">
            <div className="text-sm font-medium text-muted-foreground -mb-0.5">
              Soru:
            </div>
            <p className="text-sm">{item.question}</p>
            <div className="text-sm font-medium text-muted-foreground -mb-0.5 mt-1">
              Cevap:
            </div>
            <div className="text-sm math-content">
              <Latex>{processLatexInText(item.answer)}</Latex>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {new Date(item.timestamp).toLocaleTimeString('tr-TR')}
            </div>
          </Card>
        ))}
      </div>

      {/* New Question Input - Fixed at bottom */}
      <div className="border-t p-2 bg-background">
        <textarea
          className="w-full h-16 p-2 text-sm border rounded-md resize-none"
          placeholder="Yeni bir soru sorun... (Göndermek için Ctrl+Enter)"
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSubmitting}
        />
        <div className="flex justify-end mt-1">
          <Button
            onClick={handleSubmit}
            disabled={!newQuestion.trim() || isSubmitting}
            size="sm"
            className="text-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                Gönderiliyor...
              </>
            ) : (
              <>
                <Send className="mr-1.5 h-3 w-3" />
                Soruyu Gönder
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
} 