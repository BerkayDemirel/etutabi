"use client";

import { useState, useEffect, useRef } from "react";
import { useAppContext } from "@/lib/context/app-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ChevronRight, 
  PanelLeftClose, 
  PanelLeftOpen, 
  HelpCircle, 
  ZoomIn, 
  ZoomOut, 
  ChevronsLeft, 
  ChevronsRight,
  BookOpen
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { TopicFollowUpPanel } from "./topic-follow-up-panel";
import { PDFViewer } from "./pdf-viewer";

export function TopicPage() {
  const { currentSubject, currentGrade, clearSelections } = useAppContext();
  const router = useRouter();
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageContent, setPageContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const sidePanelRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState(100);

  // Function to get formatted subject name in Turkish
  const getFormattedSubjectName = (subject: string | null): string => {
    if (!subject) return "";
    
    const subjectDisplayMap: { [key: string]: string } = {
      "math": "Matematik",
      "physics": "Fizik",
      "chemistry": "Kimya",
      "biology": "Biyoloji",
      "social-studies": "Sosyal Bilgiler",
      "english": "İngilizce"
    };
    
    return subjectDisplayMap[subject] || subject;
  };

  // Debug log for component mount
  useEffect(() => {
    console.log("TopicPage mounted - DEBUG INFO:");
    console.log("- currentSubject:", currentSubject);
    console.log("- currentGrade:", currentGrade);
    console.log("- localStorage.currentSubject:", typeof window !== 'undefined' ? localStorage.getItem('currentSubject') : 'N/A');
    console.log("- localStorage.currentGrade:", typeof window !== 'undefined' ? localStorage.getItem('currentGrade') : 'N/A');
  }, []);

  // Check if subject and grade are selected
  useEffect(() => {
    console.log("TopicPage subject/grade effect - subject:", currentSubject, "grade:", currentGrade);
    
    if (!currentSubject || !currentGrade) {
      console.log("Missing subject or grade, will redirect to home page");
      setError("Konu ve sınıf seçilmedi. Ana sayfaya yönlendiriliyorsunuz...");
      
      // Short delay before redirect to show the error message
      const timer = setTimeout(() => {
        router.push("/");
      }, 2000);
      
      return () => clearTimeout(timer);
    }
    
    setError(null);
    
    // Generate PDF URL
    const subjectMap: { [key: string]: string } = {
      "math": "matematik",
      "physics": "fizik",
      "chemistry": "kimya",
      "biology": "biyoloji",
      "social-studies": "sosyal",
      "english": "ingilizce"
    };
    
    const subjectName = subjectMap[currentSubject] || currentSubject;
    const url = `/pdfs/${subjectName}-${currentGrade}.pdf`;
    
    console.log("Setting PDF URL:", url, "for subject:", currentSubject, "grade:", currentGrade);
    setPdfUrl(url);
    
    // Verify the PDF file exists
    fetch(url, { method: 'HEAD' })
      .then(response => {
        console.log(`PDF file check: ${url} - Status: ${response.status} ${response.ok ? 'OK' : 'Not Found'}`);
        if (!response.ok) {
          setError(`PDF dosyası bulunamadı: ${url}`);
        }
      })
      .catch(error => {
        console.error(`Error checking PDF file: ${url}`, error);
        setError(`PDF dosyasına erişilemiyor: ${error.message}`);
      });
  }, [currentSubject, currentGrade, router]);

  // Function to handle page navigation
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      console.log(`Navigating to page ${newPage} of ${totalPages}`);
    }
  };

  // Function to handle direct page input
  const handlePageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const page = parseInt(e.target.value);
    if (!isNaN(page)) {
      handlePageChange(page);
    }
  };

  // Function to reset and go home
  const resetAndGoHome = () => {
    clearSelections();
    router.push("/");
  };

  // Function to handle page content extraction
  const handlePageContentExtracted = (content: string) => {
    console.log(`Page ${currentPage} content extracted, length: ${content.length} characters`);
    setPageContent(content);
  };

  // Function to toggle side panel
  const toggleSidePanel = () => {
    setShowSidePanel(prev => !prev);
    
    // If opening the panel, scroll to top
    if (!showSidePanel && sidePanelRef.current) {
      setTimeout(() => {
        if (sidePanelRef.current) {
          sidePanelRef.current.scrollTop = 0;
        }
      }, 100);
    }
  };

  // Get the full PDF URL including the origin
  const getFullPdfUrl = () => {
    if (!pdfUrl) return "";
    
    // If already an absolute URL, return as is
    if (pdfUrl.startsWith('http')) {
      return pdfUrl;
    }
    
    // Otherwise, prepend the origin
    if (typeof window !== 'undefined') {
      return `${window.location.origin}${pdfUrl}`;
    }
    
    return pdfUrl;
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 10, 50));
  };

  const handleJumpForward = () => {
    handlePageChange(Math.min(currentPage + 10, totalPages));
  };

  const handleJumpBackward = () => {
    handlePageChange(Math.max(currentPage - 10, 1));
  };

  // If subject or grade is missing, show a message
  if (!currentSubject || !currentGrade) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-md">
        <div className="bg-card rounded-lg border shadow-sm p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">Konu ve sınıf seçilmedi</h2>
          <p className="text-muted-foreground mb-6">
            PDF görüntülemek için önce ana sayfadan konu ve sınıf seçmelisiniz.
          </p>
          <Button onClick={() => router.push("/")}>
            Ana Sayfaya Dön
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-x-0 bottom-0 top-[57px] flex">
      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 px-6 py-4">
        {/* Header with navigation */}
        <div className="flex items-center justify-between h-8 mb-4">
          <div className="flex items-center gap-4">
            <h1 className="text-base font-semibold flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              Konu Modu
            </h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>Ders: {getFormattedSubjectName(currentSubject)}</span>
              <span>•</span>
              <span>{currentGrade}. Sınıf</span>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="bg-card rounded-lg border shadow-sm p-4 flex-1 overflow-y-auto min-h-0 mb-20">
          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md text-sm mb-4">
              {error}
            </div>
          )}
          
          {/* PDF Viewer */}
          <div className="min-h-[70vh] max-h-[calc(100vh-220px)] bg-white rounded-lg border mb-4 flex items-center justify-center overflow-hidden">
            {pdfUrl && !error ? (
              <PDFViewer 
                pdfUrl={pdfUrl} 
                currentPage={currentPage}
                onPageChange={handlePageChange}
                onTotalPagesChange={setTotalPages}
                onPageContentExtracted={handlePageContentExtracted}
                onError={setError}
                onLoadingChange={setIsLoading}
                zoomLevel={zoomLevel}
              />
            ) : (
              <div className="text-center p-8">
                {isLoading ? (
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                    <p className="text-sm text-muted-foreground">PDF yükleniyor...</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">PDF görüntülenemiyor.</p>
                )}
              </div>
            )}
          </div>
        </div>
          
        {/* Fixed PDF Navigation Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t px-6 py-3 flex flex-wrap items-center justify-between gap-4 z-50">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleJumpBackward}
              disabled={currentPage <= 1 || isLoading}
              title="10 sayfa geri"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1 || isLoading}
              title="Önceki sayfa"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="ml-1">Önceki</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || isLoading}
              title="Sonraki sayfa"
            >
              <span className="mr-1">Sonraki</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleJumpForward}
              disabled={currentPage >= totalPages || isLoading}
              title="10 sayfa ileri"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              disabled={isLoading || zoomLevel <= 50}
              title="Uzaklaştır"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              %{zoomLevel}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              disabled={isLoading || zoomLevel >= 200}
              title="Yakınlaştır"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              Sayfa {currentPage} / {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <Input
                type="number"
                min={1}
                max={totalPages}
                value={currentPage}
                onChange={handlePageInput}
                className="w-16 h-8 text-sm"
                disabled={isLoading}
              />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handlePageChange(currentPage)}
                disabled={isLoading}
              >
                Git
              </Button>
            </div>
          </div>
          
          {/* Mobile help button */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSidePanel}
            className="md:hidden"
            title={showSidePanel ? "Yardım panelini kapat" : "Yardım iste"}
          >
            {showSidePanel ? <PanelLeftClose className="h-4 w-4" /> : <HelpCircle className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Side Panel */}
      {showSidePanel && (
        <div 
          ref={sidePanelRef}
          className="border-l bg-background flex-shrink-0 relative transition-all duration-200 ease-in-out overflow-hidden"
          style={{ 
            width: '400px',
            maxHeight: 'calc(100vh - 120px)' // Ensure it doesn't overlap with navigation
          }}
        >
          <Button
            variant="ghost"
            size="sm"
            className="absolute -left-[120px] top-2 h-10 px-3 rounded-l bg-background border-l border-y hover:bg-muted flex items-center gap-2"
            onClick={toggleSidePanel}
            title="Paneli Kapat"
          >
            <PanelLeftOpen className="h-5 w-5" />
            <span className="text-sm font-medium">Paneli Kapat</span>
          </Button>
          <TopicFollowUpPanel
            currentPage={currentPage}
            pdfContent={pageContent}
            pdfUrl={getFullPdfUrl()}
          />
        </div>
      )}

      {!showSidePanel && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-0 top-2 h-10 px-3 rounded-l bg-background border-l border-y hover:bg-muted flex items-center gap-2"
          onClick={toggleSidePanel}
          title="Yardım İste"
        >
          <PanelLeftClose className="h-5 w-5" />
          <span className="text-sm font-medium">Yardım İste</span>
        </Button>
      )}
    </div>
  );
} 