"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, ArrowRight, CheckCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface HintDisplayProps {
  hints: string[];
  fullExplanation: string;
  onUnderstand: () => void;
  onNeedMoreHelp: () => void;
}

export function HintDisplay({
  hints,
  fullExplanation,
  onUnderstand,
  onNeedMoreHelp,
}: HintDisplayProps) {
  // Start from the second hint (index 1) since the first hint is already shown in the question component
  const [currentHintIndex, setCurrentHintIndex] = useState(1);
  const [showFullExplanation, setShowFullExplanation] = useState(false);

  const showNextHint = () => {
    if (currentHintIndex < hints.length - 1) {
      setCurrentHintIndex(currentHintIndex + 1);
    } else {
      setShowFullExplanation(true);
    }
  };

  // If there are no additional hints beyond the first one, show the full explanation
  const hasAdditionalHints = hints.length > 1;

  return (
    <Card className="w-full mt-4 shadow-sm">
      <CardHeader className="pb-2 pt-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          {showFullExplanation ? "Tam Çözüm" : "Ek İpuçları"}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 pb-2">
        <div className="space-y-3">
          {showFullExplanation ? (
            <div className="space-y-3">
              <div className="space-y-2 text-muted-foreground">
                {hints.map((hint, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xs">
                      {index + 1}
                    </div>
                    <p className="text-sm">{hint}</p>
                  </div>
                ))}
              </div>
              <Separator className="my-2" />
              <div>
                <p className="whitespace-pre-line text-sm">{fullExplanation}</p>
              </div>
            </div>
          ) : hasAdditionalHints ? (
            <div className="space-y-2">
              {hints.slice(1, currentHintIndex + 1).map((hint, index) => (
                <div
                  key={index}
                  className="p-2 border rounded-md bg-muted/30 flex gap-2 items-start"
                >
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xs mt-0.5">
                    {index + 2} {/* +2 because we're starting from the second hint */}
                  </div>
                  <p className="text-sm">{hint}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Tam açıklama için aşağıdaki butona tıklayın.
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2 pt-0 pb-3">
        {showFullExplanation ? (
          <>
            <Button
              variant="default"
              size="sm"
              className="w-full sm:w-auto"
              onClick={onUnderstand}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Cevabı anladım
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
              onClick={onNeedMoreHelp}
            >
              Hala yardıma ihtiyacım var
            </Button>
          </>
        ) : (
          <>
            {hasAdditionalHints && currentHintIndex < hints.length - 1 ? (
              <Button
                variant="default"
                size="sm"
                className="w-full sm:w-auto"
                onClick={showNextHint}
              >
                Bir ipucu daha ver
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                className="w-full sm:w-auto"
                onClick={() => setShowFullExplanation(true)}
              >
                Tam açıklamayı göster
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
} 