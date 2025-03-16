"use client";

import { useAppContext } from "@/lib/context/app-context";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, ClipboardCheck, BookOpenCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export function ModeSelector() {
  const { currentSubject, currentGrade, setCurrentMode } = useAppContext();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true on component mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Debug log for component mount
  useEffect(() => {
    console.log("ModeSelector mounted - DEBUG INFO:");
    console.log("- currentSubject:", currentSubject);
    console.log("- currentGrade:", currentGrade);
    console.log("- localStorage.currentSubject:", typeof window !== 'undefined' ? localStorage.getItem('currentSubject') : 'N/A');
    console.log("- localStorage.currentGrade:", typeof window !== 'undefined' ? localStorage.getItem('currentGrade') : 'N/A');
  }, [currentSubject, currentGrade]);

  const isSelectionComplete = Boolean(currentSubject) && Boolean(currentGrade);

  useEffect(() => {
    console.log("Selection status:", isSelectionComplete ? "Complete" : "Incomplete");
    console.log("- currentSubject:", currentSubject);
    console.log("- currentGrade:", currentGrade);
  }, [isSelectionComplete, currentSubject, currentGrade]);

  const handleModeSelect = (mode: "topic" | "preparation" | "testing") => {
    console.log("Mode selected:", mode);
    console.log("Current state - Subject:", currentSubject, "Grade:", currentGrade);
    
    if (!currentSubject || !currentGrade) {
      console.error("Selection incomplete - Subject:", currentSubject, "Grade:", currentGrade);
      setError("Lütfen önce konu ve sınıf seviyesi seçin");
      return;
    }
    
    setError(null);
    setIsNavigating(true);
    setCurrentMode(mode);
    
    // Add a delay to ensure context is updated
    setTimeout(() => {
      console.log("Navigating to mode:", mode);
      console.log("Final state before navigation - Subject:", currentSubject, "Grade:", currentGrade, "Mode:", mode);
      
      // Store values directly in localStorage as a backup
      if (typeof window !== 'undefined') {
        localStorage.setItem('currentSubject', JSON.stringify(currentSubject));
        localStorage.setItem('currentGrade', JSON.stringify(currentGrade));
        localStorage.setItem('currentMode', JSON.stringify(mode));
        console.log("Stored values directly in localStorage as backup");
      }
      
      router.push(`/${mode}`);
    }, 300);
  };

  // Determine card class based on client-side state only
  const getCardClass = () => {
    const baseClass = "border-2 transition-all duration-300 cursor-pointer group relative overflow-hidden";
    if (!isClient) return baseClass; // Default state for server rendering
    
    return `${baseClass} ${!isSelectionComplete || isNavigating ? 'opacity-50 pointer-events-none' : 'hover:border-primary hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1'}`;
  };

  return (
    <div className="w-full space-y-3">
      <h2 className="text-base font-medium flex items-center gap-1.5">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary"></span>
        Mod seçin
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card 
          className={getCardClass()}
          onClick={() => handleModeSelect("topic")}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardContent className="flex flex-col items-center justify-center p-4 text-center h-full relative z-10">
            <div className="w-14 h-14 flex items-center justify-center rounded-full bg-primary/10 mb-3 group-hover:bg-primary/20 group-hover:scale-105 transition-all duration-300">
              <BookOpenCheck className="h-7 w-7 text-primary group-hover:scale-110 transition-transform duration-300" />
            </div>
            <h3 className="text-lg font-medium text-foreground group-hover:text-primary transition-colors duration-300">Konu Modu</h3>
            <p className="text-sm text-muted-foreground mt-1 group-hover:text-foreground/90 transition-colors duration-300">
              E-kitap üzerinden çalışın ve anlamadığınız yerleri sorun
            </p>
          </CardContent>
        </Card>

        <Card 
          className={getCardClass()}
          onClick={() => handleModeSelect("preparation")}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardContent className="flex flex-col items-center justify-center p-4 text-center h-full relative z-10">
            <div className="w-14 h-14 flex items-center justify-center rounded-full bg-primary/10 mb-3 group-hover:bg-primary/20 group-hover:scale-105 transition-all duration-300">
              <BookOpen className="h-7 w-7 text-primary group-hover:scale-110 transition-transform duration-300" />
            </div>
            <h3 className="text-lg font-medium text-foreground group-hover:text-primary transition-colors duration-300">Hazırlık Modu</h3>
            <p className="text-sm text-muted-foreground mt-1 group-hover:text-foreground/90 transition-colors duration-300">
              Sorular çözün ve anlamadığınız yerleri sorun
            </p>
          </CardContent>
        </Card>

        <Card 
          className={getCardClass()}
          onClick={() => handleModeSelect("testing")}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardContent className="flex flex-col items-center justify-center p-4 text-center h-full relative z-10">
            <div className="w-14 h-14 flex items-center justify-center rounded-full bg-primary/10 mb-3 group-hover:bg-primary/20 group-hover:scale-105 transition-all duration-300">
              <ClipboardCheck className="h-7 w-7 text-primary group-hover:scale-110 transition-transform duration-300" />
            </div>
            <h3 className="text-lg font-medium text-foreground group-hover:text-primary transition-colors duration-300">Sınav Modu</h3>
            <p className="text-sm text-muted-foreground mt-1 group-hover:text-foreground/90 transition-colors duration-300">
              Zamanlı test çözün ve kendinizi değerlendirin
            </p>
          </CardContent>
        </Card>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-2 rounded-md text-sm text-center animate-shake">
          {error}
        </div>
      )}
      
      {/* Only render this message on the client side to avoid hydration mismatch */}
      <div className="h-3">
        {isClient && !isSelectionComplete && (
          <p className="text-sm text-muted-foreground text-center animate-pulse">
            Lütfen önce konu ve sınıf seviyesi seçin
          </p>
        )}
      </div>
    </div>
  );
} 