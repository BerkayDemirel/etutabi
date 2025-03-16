"use client";

import { TopicPage } from "@/components/topic/topic-page";
import { useEffect, useState } from "react";

export default function Page() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Only render the TopicPage component on the client side
  // This prevents hydration mismatches
  if (!isClient) {
    return <div className="absolute inset-x-0 bottom-0 top-[57px] flex">
      <div className="flex-1 flex flex-col min-w-0 px-6 py-4">
        <div className="flex items-center justify-between h-8 mb-4">
          <div>Loading...</div>
        </div>
      </div>
    </div>;
  }

  return <TopicPage />;
} 