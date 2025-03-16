"use client";

import { useAppContext } from "@/lib/context/app-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TestingPage } from "@/components/testing/testing-page";

export default function TestingRoute() {
  const { currentSubject, currentGrade, currentMode } = useAppContext();
  const router = useRouter();
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Set isClient to true once component mounts on client
    setIsClient(true);
    
    if (!currentSubject || !currentGrade || !currentMode) {
      router.push("/");
    }
  }, [currentSubject, currentGrade, currentMode, router]);

  if (!currentSubject || !currentGrade || !currentMode) {
    return null;
  }

  // Only render content on the client to avoid hydration mismatch
  if (!isClient) {
    return <div className="container mx-auto py-2 px-2 max-w-3xl">
      <div>Loading...</div>
    </div>;
  }

  return (
    <div className="container mx-auto py-2 px-2 max-w-3xl">
      <TestingPage onSidePanelChange={setShowSidePanel} />
    </div>
  );
} 