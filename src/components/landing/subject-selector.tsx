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
import { Calculator, FlaskConical, BookText, Globe, Microscope, Atom } from "lucide-react";
import { useState, useEffect } from "react";

type Subject = "math" | "physics" | "chemistry" | "biology" | "social-studies" | "english";

const subjects = [
  { value: "math" as Subject, label: "Matematik", icon: Calculator },
  { value: "physics" as Subject, label: "Fizik", icon: Atom },
  { value: "chemistry" as Subject, label: "Kimya", icon: FlaskConical },
  { value: "biology" as Subject, label: "Biyoloji", icon: Microscope },
  { value: "social-studies" as Subject, label: "Sosyal Bilimler", icon: Globe },
  { value: "english" as Subject, label: "İngilizce", icon: BookText },
];

export function SubjectSelector() {
  const { currentSubject, setCurrentSubject } = useAppContext();
  // Use undefined instead of empty string to match server rendering
  const [mounted, setMounted] = useState(false);
  
  // Set mounted to true after component mounts to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Update context when selection changes
  const handleSubjectChange = (value: string) => {
    console.log("Subject selected:", value);
    setCurrentSubject(value as Subject);
  };

  // Only render the select with a value after client-side hydration is complete
  if (!mounted) {
    return (
      <div className="w-full space-y-2">
        <Label htmlFor="subject" className="text-base font-medium flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary"></span>
          Ders seçin
        </Label>
        <Select>
          <SelectTrigger id="subject" className="w-full bg-card/50 border-2 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary">
            <SelectValue placeholder="Ders seçin" />
          </SelectTrigger>
          <SelectContent>
            {subjects.map((subject) => {
              const Icon = subject.icon;
              return (
                <SelectItem 
                  key={subject.value} 
                  value={subject.value}
                  className="flex items-center gap-2"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary" />
                    {subject.label}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2">
      <Label htmlFor="subject" className="text-base font-medium flex items-center gap-1.5">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary"></span>
        Ders seçin
      </Label>
      <Select value={currentSubject || undefined} onValueChange={handleSubjectChange}>
        <SelectTrigger 
          id="subject" 
          className="w-full bg-card/50 border-2 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50"
        >
          <SelectValue placeholder="Ders seçin" />
        </SelectTrigger>
        <SelectContent className="border-2 border-primary/10 bg-card/95 backdrop-blur-sm">
          {subjects.map((subject) => {
            const Icon = subject.icon;
            return (
              <SelectItem 
                key={subject.value} 
                value={subject.value}
                className="flex items-center gap-2 hover:bg-primary/5 transition-colors duration-200 focus:bg-primary/10 focus:text-primary"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-full bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  {subject.label}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      
      {currentSubject && (
        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5 animate-fadeIn">
          <span className="inline-block w-1 h-1 rounded-full bg-primary/50"></span>
          Seçilen ders: <span className="font-medium text-primary">{subjects.find(s => s.value === currentSubject)?.label}</span>
        </p>
      )}
    </div>
  );
} 