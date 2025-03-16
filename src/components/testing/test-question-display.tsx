"use client";

import { Question } from "@/components/preparation/question-display";
import { Card, CardContent } from "@/components/ui/card";

interface TestQuestionDisplayProps {
  question: Question;
  selectedAnswer: number | null;
  onAnswerSelect: (index: number) => void;
  testMode: boolean;
}

export function TestQuestionDisplay({
  question,
  selectedAnswer,
  onAnswerSelect,
  testMode = true,
}: TestQuestionDisplayProps) {
  const handleOptionClick = (index: number) => {
    onAnswerSelect(index);
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
                  selectedAnswer === index
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "hover:bg-muted/50"
                } cursor-pointer`}
                onClick={() => handleOptionClick(index)}
              >
                <div className="flex items-center h-full w-full">
                  <div className={`flex items-center justify-center h-4 w-4 rounded-full border mr-2 ${
                    selectedAnswer === index ? "border-primary" : ""
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
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 