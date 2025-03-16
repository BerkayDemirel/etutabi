"use client";

import { useAppContext } from "@/lib/context/app-context";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GraduationCap } from "lucide-react";
import { useState, useEffect } from "react";

type Grade = "9" | "10" | "11" | "12";

const grades = [
  { value: "9", label: "9. Sınıf" },
  { value: "10", label: "10. Sınıf" },
  { value: "11", label: "11. Sınıf" },
  { value: "12", label: "12. Sınıf" },
];

export function GradeSelector() {
  const { currentGrade, setCurrentGrade } = useAppContext();
  // Use mounted state to avoid hydration mismatch
  const [mounted, setMounted] = useState(false);
  
  // Set mounted to true after component mounts to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const handleGradeChange = (value: string) => {
    console.log("Grade selected:", value);
    setCurrentGrade(value as Grade);
  };

  // Only render the select with a value after client-side hydration is complete
  if (!mounted) {
    return (
      <div className="w-full space-y-2">
        <Label htmlFor="grade" className="text-base font-medium flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary"></span>
          Sınıf seviyesi seçin
        </Label>
        <Select>
          <SelectTrigger id="grade" className="w-full bg-card/50 border-2 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary">
            <SelectValue placeholder="Sınıf seçin" />
          </SelectTrigger>
          <SelectContent>
            {grades.map((grade) => (
              <SelectItem 
                key={grade.value} 
                value={grade.value}
                className="flex items-center gap-2"
              >
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  {grade.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2">
      <Label htmlFor="grade" className="text-base font-medium flex items-center gap-1.5">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary"></span>
        Sınıf seviyesi seçin
      </Label>
      <Select value={currentGrade || undefined} onValueChange={handleGradeChange}>
        <SelectTrigger 
          id="grade" 
          className="w-full bg-card/50 border-2 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50"
        >
          <SelectValue placeholder="Sınıf seçin" />
        </SelectTrigger>
        <SelectContent className="border-2 border-primary/10 bg-card/95 backdrop-blur-sm">
          {grades.map((grade) => (
            <SelectItem 
              key={grade.value} 
              value={grade.value}
              className="flex items-center gap-2 hover:bg-primary/5 transition-colors duration-200 focus:bg-primary/10 focus:text-primary"
            >
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-full bg-primary/10">
                  <GraduationCap className="h-4 w-4 text-primary" />
                </div>
                {grade.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {currentGrade && (
        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5 animate-fadeIn">
          <span className="inline-block w-1 h-1 rounded-full bg-primary/50"></span>
          Seçilen sınıf: <span className="font-medium text-primary">{grades.find(g => g.value === currentGrade)?.label}</span>
        </p>
      )}
    </div>
  );
} 