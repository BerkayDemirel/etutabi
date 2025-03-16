"use client";

import { useEffect } from "react";
import { SubjectSelector } from "./subject-selector";
import { GradeSelector } from "./grade-selector";
import { ModeSelector } from "./mode-selector";
import { Separator } from "@/components/ui/separator";
import { Sparkles } from "lucide-react";
import { useAppContext } from "@/lib/context/app-context";

export function LandingPage() {
  const { currentSubject, currentGrade } = useAppContext();
  
  // Debug log for component mount
  useEffect(() => {
    console.log("LandingPage mounted - DEBUG INFO:");
    console.log("- currentSubject:", currentSubject);
    console.log("- currentGrade:", currentGrade);
    console.log("- localStorage.currentSubject:", typeof window !== 'undefined' ? localStorage.getItem('currentSubject') : 'N/A');
    console.log("- localStorage.currentGrade:", typeof window !== 'undefined' ? localStorage.getItem('currentGrade') : 'N/A');
  }, [currentSubject, currentGrade]);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem-1px)] p-4 bg-gradient-to-b from-background via-background to-muted/30 relative overflow-hidden">
      {/* Background pattern - subtle grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
      
      {/* Animated background elements */}
      <div className="absolute top-1/4 left-1/6 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/6 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-slow animation-delay-2000"></div>
      
      <div className="w-full max-w-4xl mx-auto bg-card/50 backdrop-blur-sm shadow-sm rounded-lg border border-primary/10 p-5 space-y-4 relative z-10">
        {/* Decorative elements */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-primary/10 rounded-full blur-xl"></div>
        <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-primary/5 rounded-full blur-xl"></div>
        
        <div className="text-center relative">
          <div className="flex items-center justify-center gap-3 transform hover:scale-105 transition-transform duration-300">
            <span className="text-5xl animate-bounce-subtle">🤖</span>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                <span className="text-indigo-600">Etüt</span><span className="text-indigo-500">Abi</span>
                <span className="text-sm ml-2 text-gray-500">by HercAI</span>
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Yapay zekâ destekli kişisel eğitim asistanınız
              </p>
            </div>
          </div>
        </div>
        
        <Separator className="bg-gradient-to-r from-transparent via-primary/20 to-transparent h-px" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <SubjectSelector />
          <GradeSelector />
        </div>
        
        <Separator className="bg-gradient-to-r from-transparent via-primary/20 to-transparent h-px" />
        
        <ModeSelector />
        
        <div className="border-t border-primary/10 text-center text-sm text-muted-foreground flex items-center justify-center gap-1.5 pt-1 mt-0">
          <Sparkles className="h-4 w-4 text-primary animate-twinkle" />
          <span>Daha iyi öğrenmenize yardımcı olmak için gelişmiş yapay zekâ ile desteklenmektedir</span>
        </div>
      </div>
    </div>
  );
} 