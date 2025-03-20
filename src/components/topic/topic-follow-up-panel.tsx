"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Send, Loader2, MessageCircle, Trash2, X } from "lucide-react";
import { useAppContext } from "@/lib/context/app-context";
import Latex from 'react-latex-next';
import 'katex/dist/katex.min.css';
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import rehypeRaw from 'rehype-raw';

interface TopicFollowUpPanelProps {
  currentPage: number;
  pdfContent: string;
  pdfUrl?: string;
}

interface FollowUpMessage {
  question: string;
  answer: string;
  timestamp: Date;
  pageNumber: number;
  subject: string;  // Subject of the question
  grade: number;    // Grade level of the question
}

// Function to process text and wrap LaTeX expressions
const processLatexInText = (text: string): string => {
  // Replace \( and \) with $ for inline math
  let processed = text.replace(/\\\(/g, '$').replace(/\\\)/g, '$');
  
  // Replace \[ and \] with $$ for block math
  processed = processed.replace(/\\\[/g, '$$').replace(/\\\]/g, '$$');
  
  return processed;
};

// Custom component for rendering markdown with LaTeX support
const MarkdownWithLatex = ({ content }: { content: string }) => {
  return (
    <div className="text-sm math-content">
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeKatex, rehypeRaw]}
        components={{
          p: ({ children, ...props }: any) => <p className="my-1" {...props}>{children}</p>,
          h1: ({ children, ...props }: any) => <h1 className="text-lg font-semibold mt-3 mb-1" {...props}>{children}</h1>,
          h2: ({ children, ...props }: any) => <h2 className="text-base font-semibold mt-2 mb-1" {...props}>{children}</h2>,
          h3: ({ children, ...props }: any) => <h3 className="text-sm font-semibold mt-2 mb-1" {...props}>{children}</h3>,
          ul: ({ children, ...props }: any) => <ul className="list-disc pl-5 my-1" {...props}>{children}</ul>,
          ol: ({ children, ...props }: any) => <ol className="list-decimal pl-5 my-1" {...props}>{children}</ol>,
          li: ({ children, ...props }: any) => <li className="my-0.5" {...props}>{children}</li>,
          code: ({ inline, className, children, ...props }: any) => {
            return inline ? 
              <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono" {...props}>
                {children}
              </code> : 
              <code className={className} {...props}>
                {children}
              </code>
          },
          pre: ({ children, ...props }: any) => <pre className="bg-gray-100 p-2 rounded my-2 overflow-x-auto text-xs" {...props}>{children}</pre>,
          blockquote: ({ children, ...props }: any) => <blockquote className="border-l-2 border-gray-300 pl-2 italic my-2" {...props}>{children}</blockquote>,
          table: ({ children, ...props }: any) => <table className="border-collapse w-full my-2" {...props}>{children}</table>,
          th: ({ children, ...props }: any) => <th className="border border-gray-300 px-2 py-1 bg-gray-100 font-semibold" {...props}>{children}</th>,
          td: ({ children, ...props }: any) => <td className="border border-gray-300 px-2 py-1" {...props}>{children}</td>
        }}
      >
        {processLatexInText(content)}
      </ReactMarkdown>
    </div>
  );
};

export function TopicFollowUpPanel({ currentPage, pdfContent, pdfUrl }: TopicFollowUpPanelProps) {
  const { currentSubject, currentGrade } = useAppContext();
  const [question, setQuestion] = useState("");
  const [followUpHistory, setFollowUpHistory] = useState<FollowUpMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const [showAllPages, setShowAllPages] = useState(false);
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  // Load conversation history from localStorage
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem("topicFollowUpHistory");
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        
        // Migrate old data to include subject and grade if missing
        const migratedHistory = parsedHistory.map((item: any) => {
          // Use 'any' type for the item to avoid TypeScript errors during migration
          return {
            question: item.question,
            answer: item.answer,
            timestamp: new Date(item.timestamp),
            pageNumber: item.pageNumber,
            subject: item.subject || currentSubject || "",
            grade: typeof item.grade === 'number' ? item.grade : (currentGrade ? Number(currentGrade) : 0)
          };
        });
        
        setFollowUpHistory(migratedHistory);
      }
    } catch (error) {
      console.error("Error loading conversation history:", error);
    }
  }, [currentSubject, currentGrade]);

  // Save conversation history to localStorage
  useEffect(() => {
    if (followUpHistory.length > 0) {
      try {
        localStorage.setItem("topicFollowUpHistory", JSON.stringify(followUpHistory));
      } catch (error) {
        console.error("Error saving conversation history:", error);
      }
    }
  }, [followUpHistory]);

  // Filter history to only show questions for the current page/subject/grade
  const filteredHistory = followUpHistory.filter(item => {
    // Always filter by subject and grade if available
    const subjectMatch = !item.subject || item.subject === currentSubject;
    const gradeMatch = !item.grade || item.grade === Number(currentGrade);
    
    // Only filter by page if not showing all pages
    const pageMatch = showAllPages || item.pageNumber === currentPage;
    
    return subjectMatch && gradeMatch && pageMatch;
  });

  // Test API connection
  const testApiConnection = async () => {
    try {
      console.log("Testing API connection...");
      
      // Get the base URL
      const baseUrl = window.location.origin;
      const apiUrl = `${baseUrl}/api/test`;
      
      console.log("Testing API at:", apiUrl);
      
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      console.log("Test API response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Test API error:", errorText);
        setError(`API test failed: ${response.status} ${errorText}`);
        return;
      }
      
      const data = await response.json();
      console.log("Test API response:", data);
      setError(`API test successful: ${JSON.stringify(data)}`);
    } catch (error: any) {
      console.error("Test API error:", error);
      setError(`API test failed: ${error.message}`);
    }
  };

  const handleFollowUpSubmit = async () => {
    if (!question.trim()) return;
    
    setError(null);
    setIsLoading(true);
    setPendingQuestion(question);
    
    try {
      if (!currentSubject || !currentGrade) {
        throw new Error("Konu veya sınıf seçilmemiş");
      }
      
      // Check if we have either content or URL
      if ((!pdfContent || pdfContent.trim().length < 10) && !pdfUrl) {
        throw new Error("Sayfa içeriği yüklenemedi veya boş");
      }
      
      console.log("Sending question about page", currentPage);
      console.log("Current subject:", currentSubject);
      console.log("Current grade:", currentGrade);
      
      if (pdfContent) {
        console.log("Content length:", pdfContent.length);
      }
      if (pdfUrl) {
        console.log("Using PDF URL:", pdfUrl);
      }
      
      // Ensure subject is correctly formatted
      const subjectToSend = currentSubject.toString();
      const gradeToSend = Number(currentGrade);
      
      console.log("Sending API request with subject:", subjectToSend, "grade:", gradeToSend);
      
      try {
        // Get the base URL
        const baseUrl = window.location.origin;
        const apiUrl = `${baseUrl}/api/topic-follow-up`;
        
        console.log("Fetching from URL:", apiUrl);
        
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            subject: subjectToSend,
            grade: gradeToSend,
            pageNumber: currentPage,
            pageContent: pdfContent, // Send the parsed content if available
            pdfUrl: pdfUrl, // Send the PDF URL if available
            pdfPageNumber: currentPage, // Send the current page number
            followUpQuestion: question,
            previousConversation: followUpHistory.slice(-3), // Send only last 3 messages for context
          }),
        });
        
        console.log("API response status:", response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("API error response:", errorText);
          throw new Error(`API yanıt hatası: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        console.log("API response data received");
        
        const newMessage: FollowUpMessage = {
          question,
          answer: data.answer,
          timestamp: new Date(),
          pageNumber: currentPage,
          subject: subjectToSend,
          grade: gradeToSend
        };
        
        setFollowUpHistory(prev => [...prev, newMessage]);
        setQuestion("");
        setPendingQuestion(null);
      } catch (fetchError: any) {
        console.error("Fetch error:", fetchError);
        throw new Error(`API isteği başarısız: ${fetchError.message}`);
      }
    } catch (error) {
      console.error("Error:", error);
      setError(error instanceof Error ? error.message : "Bilinmeyen bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleFollowUpSubmit();
    }
  };

  const handleDeleteQuestion = (index: number) => {
    const newHistory = followUpHistory.filter((_, i) => i !== index);
    setFollowUpHistory(newHistory);
    setDeleteConfirmIndex(null);
  };

  const confirmDelete = (index: number) => {
    setDeleteConfirmIndex(index);
    // Auto-hide confirmation after 3 seconds if not acted upon
    setTimeout(() => {
      setDeleteConfirmIndex(null);
    }, 3000);
  };

  // Function to clear all questions
  const handleClearAll = () => {
    if (showAllPages) {
      // Clear all questions for current subject and grade
      const updatedHistory = followUpHistory.filter(item => 
        (item.subject && item.subject !== currentSubject) || 
        (item.grade && item.grade !== Number(currentGrade))
      );
      setFollowUpHistory(updatedHistory);
    } else {
      // Clear only questions for the current page, subject and grade
      const updatedHistory = followUpHistory.filter(item => 
        item.pageNumber !== currentPage || 
        (item.subject && item.subject !== currentSubject) || 
        (item.grade && item.grade !== Number(currentGrade))
      );
      setFollowUpHistory(updatedHistory);
    }
    setConfirmClearAll(false);
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="flex items-center gap-1.5 h-7 px-3 border-b">
        <MessageCircle className="h-3.5 w-3.5" />
        <h2 className="text-sm font-medium">Sorularınız</h2>
        <span className="text-xs text-muted-foreground ml-auto">
          Sayfa: {currentPage} {!showAllPages && filteredHistory.length > 0 && `(${filteredHistory.length} soru)`}
        </span>
      </div>

      {/* Filter toggle and clear all */}
      <div className="flex items-center justify-between px-3 py-1 border-b">
        <button 
          onClick={() => setShowAllPages(!showAllPages)}
          className={`text-xs px-2 py-1 rounded ${showAllPages ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`}
        >
          {showAllPages ? 'Sadece bu sayfayı göster' : 'Bu dersteki tüm soruları göster'}
        </button>

        {filteredHistory.length > 0 && (
          confirmClearAll ? (
            <div className="flex items-center gap-1 bg-white shadow-sm border rounded-md p-0.5">
              <span className="text-xs text-red-500 px-1">
                {showAllPages ? 'Bu dersteki tüm soruları silmek' : 'Bu sayfadaki soruları silmek'} istediğinize emin misiniz?
              </span>
              <button 
                onClick={handleClearAll}
                className="p-1 rounded-full hover:bg-red-50 text-red-500"
                title="Evet, sil"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <button 
                onClick={() => setConfirmClearAll(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
                title="İptal"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setConfirmClearAll(true)}
              className="text-xs px-2 py-1 rounded hover:bg-red-50 text-red-500 flex items-center gap-1"
              title={showAllPages ? "Bu dersteki tüm soruları sil" : "Bu sayfadaki tüm soruları sil"}
            >
              <Trash2 className="h-3 w-3" />
              <span>{showAllPages ? 'Tümünü Sil' : 'Sayfadakileri Sil'}</span>
            </button>
          )
        )}
      </div>

      {/* Error message if any */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-2 m-2 rounded-md text-sm">
          {error}
          <div className="mt-1">
            <button 
              onClick={testApiConnection}
              className="text-xs px-2 py-1 rounded bg-red-100 hover:bg-red-200 text-red-700"
            >
              Test API Connection
            </button>
          </div>
        </div>
      )}

      {/* Question History - Scrollable */}
      <div className="flex-1 overflow-y-auto min-h-0 px-3 py-2">
        {filteredHistory.length > 0 ? (
          filteredHistory.map((item, index) => {
            // Find the original index in the full history array
            const originalIndex = followUpHistory.findIndex(
              historyItem => 
                historyItem.question === item.question && 
                historyItem.timestamp === item.timestamp && 
                historyItem.pageNumber === item.pageNumber &&
                historyItem.subject === item.subject &&
                historyItem.grade === item.grade
            );
            
            const isConfirmingDelete = deleteConfirmIndex === originalIndex;
            
            return (
              <Card key={index} className={`p-2 mb-2 last:mb-0 relative group ${isConfirmingDelete ? 'border-red-300' : ''}`}>
                <div className="text-sm font-medium text-muted-foreground -mb-0.5 flex justify-between">
                  <span>Soru:</span>
                  <span className="text-xs">Sayfa {item.pageNumber}</span>
                </div>
                <p className="text-sm">{item.question}</p>
                <div className="text-sm font-medium text-muted-foreground -mb-0.5 mt-1">
                  Cevap:
                </div>
                <div className="prose prose-sm max-w-none">
                  <MarkdownWithLatex content={item.answer} />
                </div>
                <div className="flex justify-between items-center mt-1">
                  <div className="text-xs text-muted-foreground">
                    {new Date(item.timestamp).toLocaleTimeString('tr-TR')}
                  </div>
                  
                  {/* Delete button or confirmation */}
                  {isConfirmingDelete ? (
                    <div className="flex items-center gap-1 bg-white shadow-sm border rounded-md p-0.5">
                      <span className="text-xs text-red-500 px-1">Emin misiniz?</span>
                      <button 
                        onClick={() => handleDeleteQuestion(originalIndex)}
                        className="p-1 rounded-full hover:bg-red-50 text-red-500"
                        title="Evet, sil"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        onClick={() => setDeleteConfirmIndex(null)}
                        className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
                        title="İptal"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => confirmDelete(originalIndex)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-red-50 text-red-500"
                      title="Bu soruyu sil"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </Card>
            );
          })
        ) : (
          <div className="text-center text-sm text-muted-foreground py-4">
            {showAllPages ? 'Bu ders için henüz soru sorulmamış.' : 'Bu sayfa için henüz soru sorulmamış.'}
          </div>
        )}
        
        {/* Pending question while loading */}
        {isLoading && pendingQuestion && (
          <Card className="p-2 mb-2 border-primary/20 bg-primary/5">
            <div className="text-sm font-medium text-muted-foreground -mb-0.5 flex justify-between">
              <span>Soru:</span>
              <span className="text-xs">Sayfa {currentPage}</span>
            </div>
            <p className="text-sm">{pendingQuestion}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Yanıt hazırlanıyor...</span>
            </div>
          </Card>
        )}
      </div>

      {/* New Question Input - Fixed at bottom */}
      <div className="border-t p-2 bg-background sticky bottom-0">
        <textarea
          className="w-full h-16 p-2 text-sm border rounded-md resize-none"
          placeholder="Yeni bir soru sorun... (Göndermek için Ctrl+Enter)"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
        <div className="flex justify-end mt-1">
          <Button
            onClick={handleFollowUpSubmit}
            disabled={isLoading || !question.trim() || (!pdfContent && !pdfUrl)}
            size="sm"
            className="text-sm"
          >
            {isLoading ? (
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