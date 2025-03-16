"use client";

import { useEffect, useRef, useState } from "react";

interface PDFViewerProps {
  pdfUrl: string;
  currentPage: number;
  onPageChange: (page: number) => void;
  onTotalPagesChange: (total: number) => void;
  onPageContentExtracted: (content: string) => void;
  onError?: (error: string) => void;
  onLoadingChange?: (isLoading: boolean) => void;
  zoomLevel?: number;
}

export function PDFViewer({
  pdfUrl,
  currentPage,
  onPageChange,
  onTotalPagesChange,
  onPageContentExtracted,
  onError,
  onLoadingChange,
  zoomLevel = 100,
}: PDFViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pdfDocument, setPdfDocument] = useState<any>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [currentRenderTask, setCurrentRenderTask] = useState<any>(null);
  const maxRetries = 3;
  
  // Load PDF.js script dynamically
  useEffect(() => {
    if (!pdfUrl) {
      console.log("No PDF URL provided");
      return;
    }
    
    console.log("Loading PDF.js script");
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js';
    script.async = true;
    
    script.onload = () => {
      console.log("PDF.js script loaded successfully");
      // Set worker location
      (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
      console.log("Worker source set to CDN version");
      
      // Load the PDF
      loadPDF();
    };
    
    script.onerror = (error) => {
      console.error("Error loading PDF.js script:", error);
      setError("PDF.js yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.");
      setIsLoading(false);
    };
    
    document.head.appendChild(script);
    
    return () => {
      // Clean up
      if (pdfDocument) {
        try {
          pdfDocument.destroy();
        } catch (e) {
          console.error("Error destroying PDF document:", e);
        }
      }
      
      // Cancel any ongoing render task
      if (currentRenderTask) {
        try {
          currentRenderTask.cancel();
        } catch (e) {
          console.error("Error cancelling render task:", e);
        }
      }
    };
  }, [pdfUrl, retryCount]);
  
  // Function to load the PDF
  const loadPDF = () => {
    if (!pdfUrl || !(window as any).pdfjsLib) {
      return;
    }
    
    setIsLoading(true);
    setLoadingProgress(0);
    console.log(`Loading PDF: ${pdfUrl}`);
    
    // Try different loading options
    tryLoadingWithOptions();
  };
  
  // Function to try loading with different options
  const tryLoadingWithOptions = async () => {
    const pdfjsLib = (window as any).pdfjsLib;
    if (!pdfjsLib) {
      console.error("PDF.js library not loaded");
      setError("PDF.js kütüphanesi yüklenemedi.");
      setIsLoading(false);
      return;
    }
    
    // Options to try
    const options = [
      // Option 1: With range requests
      {
        url: pdfUrl,
        disableRange: false,
        disableStream: false,
        disableAutoFetch: false,
        rangeChunkSize: 32768,
      },
      // Option 2: Without range requests
      {
        url: pdfUrl,
        disableRange: true,
        disableStream: true,
        disableAutoFetch: true,
      },
      // Option 3: Minimal options
      {
        url: pdfUrl,
      }
    ];
    
    let pdf = null;
    let lastError = null;
    
    // Try each option until one works
    for (let i = 0; i < options.length; i++) {
      const currentOptions = options[i];
      console.log(`Trying PDF loading option ${i + 1}:`, currentOptions);
      
      try {
        const loadingTask = pdfjsLib.getDocument(currentOptions);
        
        // Add progress tracking
        loadingTask.onProgress = (data: { loaded: number, total: number }) => {
          console.log(`Loading progress (option ${i + 1}):`, data);
          if (data.total) {
            const progress = Math.min(100, Math.round((data.loaded / data.total) * 100));
            setLoadingProgress(progress);
          }
        };
        
        console.log(`Awaiting PDF loading task promise (option ${i + 1})`);
        pdf = await loadingTask.promise;
        console.log(`PDF loaded successfully with option ${i + 1}, numPages:`, pdf.numPages);
        
        // Success - break the loop
        break;
      } catch (error) {
        console.error(`Error loading PDF with option ${i + 1}:`, error);
        lastError = error;
        // Continue to next option
      }
    }
    
    // Check if any option succeeded
    if (pdf) {
      setPdfDocument(pdf);
      onTotalPagesChange(pdf.numPages);
      setLoadingProgress(100);
      
      // Render the first page
      renderPage(currentPage, pdf);
    } else {
      setError(`PDF yüklenirken bir hata oluştu: ${lastError instanceof Error ? lastError.message : 'Bilinmeyen hata'}`);
      setIsLoading(false);
    }
  };
  
  // Function to render a page
  const renderPage = async (pageNumber: number, pdf = pdfDocument) => {
    if (!pdf) {
      console.error("PDF document not loaded");
      return;
    }
    
    try {
      setIsLoading(true);
      console.log(`Rendering page ${pageNumber}`);
      
      // Cancel any ongoing render task
      if (currentRenderTask) {
        console.log("Cancelling previous render task");
        try {
          currentRenderTask.cancel();
        } catch (e) {
          console.error("Error cancelling previous render task:", e);
        }
        setCurrentRenderTask(null);
      }
      
      const page = await pdf.getPage(pageNumber);
      
      // Calculate scale based on zoom level
      const scale = (zoomLevel / 100) * 1.5;
      
      const viewport = page.getViewport({ scale });
      
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (!context) {
        throw new Error("Canvas context could not be created");
      }
      
      // Reset canvas dimensions and clear it
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      context.fillStyle = 'white';
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      
      console.log("Starting page render");
      const renderTask = page.render(renderContext);
      setCurrentRenderTask(renderTask);
      
      await renderTask.promise;
      console.log("Page rendered successfully");
      setCurrentRenderTask(null);
      
      // Extract text content
      console.log("Extracting text content");
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(" ");
      
      onPageContentExtracted(pageText);
      setIsLoading(false);
    } catch (error) {
      // Check if this is a cancelled render task error (which is expected and can be ignored)
      if (error instanceof Error && error.message.includes('cancelled')) {
        console.log("Render task was cancelled, this is expected during page changes");
      } else {
        console.error("Error rendering page:", error);
        setError(`Sayfa görüntülenirken bir hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
        setIsLoading(false);
      }
    }
  };
  
  // Render page when current page changes
  useEffect(() => {
    if (pdfDocument && currentPage) {
      renderPage(currentPage, pdfDocument);
    }
    
    // Cleanup function to cancel render task when component unmounts or page changes
    return () => {
      if (currentRenderTask) {
        console.log("Cancelling render task due to page change");
        try {
          currentRenderTask.cancel();
        } catch (e) {
          console.error("Error cancelling render task:", e);
        }
      }
    };
  }, [pdfDocument, currentPage]);
  
  // Function to retry loading
  const retryLoading = () => {
    if (retryCount < maxRetries) {
      console.log(`Retrying PDF load (${retryCount + 1}/${maxRetries})...`);
      setRetryCount(prev => prev + 1);
      setError(null);
      setLoadingProgress(0);
      
      // Cancel any ongoing render task
      if (currentRenderTask) {
        try {
          currentRenderTask.cancel();
        } catch (e) {
          console.error("Error cancelling render task:", e);
        }
        setCurrentRenderTask(null);
      }
    } else {
      setError(`PDF yüklenirken bir hata oluştu. Maksimum yeniden deneme sayısına ulaşıldı (${maxRetries}).`);
    }
  };
  
  // Update loading state
  useEffect(() => {
    if (onLoadingChange) {
      onLoadingChange(isLoading);
    }
  }, [isLoading, onLoadingChange]);

  // Update error state
  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  // Re-render when zoom level changes
  useEffect(() => {
    if (pdfDocument) {
      renderPage(currentPage, pdfDocument);
    }
  }, [zoomLevel, currentPage]);
  
  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-4">
        <div className="bg-card p-6 rounded-lg shadow-lg max-w-md">
          <h3 className="text-lg font-semibold text-red-500 mb-2">PDF Görüntüleyici Hatası</h3>
          <p className="text-sm mb-4">{error}</p>
          <div className="flex gap-2">
            <button
              onClick={retryLoading}
              disabled={retryCount >= maxRetries}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 disabled:opacity-50"
            >
              Yeniden Dene ({retryCount}/{maxRetries})
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm hover:bg-secondary/90"
            >
              Sayfayı Yenile
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full overflow-auto flex justify-center">
      {/* Always render the canvas but keep it hidden when loading */}
      <canvas
        ref={canvasRef}
        className={`max-w-full ${isLoading ? 'hidden' : ''}`}
      />
      
      {isLoading && (
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4 w-full">
          <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300 ease-in-out"
              style={{ width: `${loadingProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-muted-foreground">
            PDF yükleniyor... {loadingProgress}%
          </p>
          {loadingProgress === 0 && retryCount > 0 && (
            <p className="text-xs text-muted-foreground">
              Yükleme denemesi: {retryCount}/{maxRetries}
            </p>
          )}
          {loadingProgress === 0 && retryCount === 0 && (
            <button
              onClick={retryLoading}
              className="px-3 py-1 bg-primary/80 text-primary-foreground rounded-md text-xs hover:bg-primary/90 mt-2"
            >
              Yüklemeyi Yeniden Dene
            </button>
          )}
        </div>
      )}
    </div>
  );
} 