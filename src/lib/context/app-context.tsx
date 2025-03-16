"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";

type Subject = "math" | "physics" | "chemistry" | "biology" | "social-studies" | "english";
type Grade = "9" | "10" | "11" | "12";
type Mode = "topic" | "preparation" | "testing";

interface AppContextType {
  currentSubject: Subject | null;
  setCurrentSubject: (subject: Subject) => void;
  currentGrade: Grade | null;
  setCurrentGrade: (grade: Grade) => void;
  currentMode: Mode | null;
  setCurrentMode: (mode: Mode) => void;
  clearSelections: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

// Helper functions for localStorage
const getStoredValue = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const item = window.localStorage.getItem(key);
    console.log(`Reading ${key} from localStorage:`, item);
    
    if (!item) return defaultValue;
    
    // If the item is a simple string without quotes (like "physics"), return it directly
    if (item === "math" || item === "physics" || item === "chemistry" || 
        item === "biology" || item === "social-studies" || item === "english" ||
        item === "9" || item === "10" || item === "11" || item === "12" ||
        item === "topic" || item === "preparation" || item === "testing") {
      console.log(`Returning direct value for ${key}:`, item);
      return item as unknown as T;
    }
    
    // Try to parse the item as JSON
    try {
      return JSON.parse(item);
    } catch (parseError) {
      // If it's a string with quotes (e.g. '"math"'), remove the quotes
      if (item.startsWith('"') && item.endsWith('"')) {
        const unquoted = item.slice(1, -1);
        console.log(`Unquoted ${key} value:`, unquoted);
        return unquoted as unknown as T;
      }
      
      console.error(`Error parsing ${key} from localStorage:`, parseError);
      // Return the raw value as a fallback
      return item as unknown as T;
    }
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

const setStoredValue = <T,>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  
  try {
    console.log(`Storing ${key} in localStorage:`, value);
    
    // For simple string values, store them directly without JSON.stringify
    if (typeof value === 'string' && 
        (value === "math" || value === "physics" || value === "chemistry" || 
         value === "biology" || value === "social-studies" || value === "english" ||
         value === "9" || value === "10" || value === "11" || value === "12" ||
         value === "topic" || value === "preparation" || value === "testing")) {
      window.localStorage.setItem(key, value);
      console.log(`Stored ${key} directly in localStorage:`, value);
    } else {
      // For other values, use JSON.stringify
      window.localStorage.setItem(key, JSON.stringify(value));
      console.log(`Stored ${key} as JSON in localStorage:`, JSON.stringify(value));
    }
    
    // Verify what was stored
    const storedValue = window.localStorage.getItem(key);
    console.log(`Verified ${key} in localStorage:`, storedValue);
  } catch (error) {
    console.error(`Error storing ${key} in localStorage:`, error);
  }
};

export function AppProvider({ children }: { children: ReactNode }) {
  console.log("AppProvider initializing...");
  
  // Initialize state from localStorage
  const [currentSubject, setCurrentSubjectState] = useState<Subject | null>(() => {
    const storedValue = getStoredValue<Subject | null>('currentSubject', null);
    console.log("Initial currentSubject from localStorage:", storedValue);
    return storedValue;
  });
  
  const [currentGrade, setCurrentGradeState] = useState<Grade | null>(() => {
    const storedValue = getStoredValue<Grade | null>('currentGrade', null);
    console.log("Initial currentGrade from localStorage:", storedValue);
    return storedValue;
  });
  
  const [currentMode, setCurrentModeState] = useState<Mode | null>(() => {
    const storedValue = getStoredValue<Mode | null>('currentMode', null);
    console.log("Initial currentMode from localStorage:", storedValue);
    return storedValue;
  });

  // Update localStorage when state changes
  useEffect(() => {
    console.log("currentSubject changed:", currentSubject);
    setStoredValue('currentSubject', currentSubject);
  }, [currentSubject]);
  
  useEffect(() => {
    console.log("currentGrade changed:", currentGrade);
    setStoredValue('currentGrade', currentGrade);
  }, [currentGrade]);
  
  useEffect(() => {
    console.log("currentMode changed:", currentMode);
    setStoredValue('currentMode', currentMode);
  }, [currentMode]);

  // Wrapper functions to update both state and localStorage
  const setCurrentSubject = (subject: Subject) => {
    console.log("Setting current subject:", subject);
    if (!subject) {
      console.warn("Attempted to set null or undefined subject");
      return;
    }
    
    // Ensure subject is a valid value
    if (typeof subject === 'string' && ["math", "physics", "chemistry", "biology", "social-studies", "english"].includes(subject)) {
      setCurrentSubjectState(subject);
      // Directly set in localStorage to ensure consistency
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('currentSubject', subject);
        console.log("Directly set currentSubject in localStorage:", subject);
      }
    } else {
      console.warn("Invalid subject value:", subject);
    }
  };
  
  const setCurrentGrade = (grade: Grade) => {
    console.log("Setting current grade:", grade);
    if (!grade) {
      console.warn("Attempted to set null or undefined grade");
      return;
    }
    
    // Ensure grade is a valid value
    if (typeof grade === 'string' && ["9", "10", "11", "12"].includes(grade)) {
      setCurrentGradeState(grade);
      // Directly set in localStorage to ensure consistency
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('currentGrade', grade);
        console.log("Directly set currentGrade in localStorage:", grade);
      }
    } else {
      console.warn("Invalid grade value:", grade);
    }
  };
  
  const setCurrentMode = (mode: Mode) => {
    console.log("Setting current mode:", mode);
    if (!mode) {
      console.warn("Attempted to set null or undefined mode");
      return;
    }
    
    // Ensure mode is a valid value
    if (typeof mode === 'string' && ["topic", "preparation", "testing"].includes(mode)) {
      setCurrentModeState(mode);
      // Directly set in localStorage to ensure consistency
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('currentMode', mode);
        console.log("Directly set currentMode in localStorage:", mode);
      }
    } else {
      console.warn("Invalid mode value:", mode);
    }
  };
  
  // Function to clear all selections
  const clearSelections = () => {
    console.log("Clearing all selections");
    setCurrentSubjectState(null);
    setCurrentGradeState(null);
    setCurrentModeState(null);
    
    // Also clear localStorage
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem('currentSubject');
        window.localStorage.removeItem('currentGrade');
        window.localStorage.removeItem('currentMode');
        console.log("Cleared localStorage selections");
      } catch (error) {
        console.error("Error clearing localStorage:", error);
      }
    }
  };

  // Log context value on each render
  const contextValue = {
    currentSubject,
    setCurrentSubject,
    currentGrade,
    setCurrentGrade,
    currentMode,
    setCurrentMode,
    clearSelections,
  };
  
  console.log("AppContext current state:", {
    currentSubject,
    currentGrade,
    currentMode
  });

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
} 