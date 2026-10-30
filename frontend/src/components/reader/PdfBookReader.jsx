import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Use the local or CDN worker for pdfjs-dist
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
}

/**
 * Authentic Canvas-based Two-Page & Single-Page Book Reader
 * Integrates directly with Sanctuary appearance settings (Parchment, Sepia, Forest),
 * smooth flip animations, manual page navigation, and chapter bookmarks.
 */
const PdfBookReader = forwardRef(function PdfBookReader(
  {
    pdfUrl,
    initialPage = 1,
    theme = 'parchment', // 'parchment' | 'sepia' | 'forest'
    spreadWidth = 'reader-width-standard',
    onPageChange,
    onTotalPagesLoaded,
    onChaptersLoaded
  },
  ref
) {
  const [pdfDoc, setPdfDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState('next'); // 'next' | 'prev'

  const leftCanvasRef = useRef(null);
  const rightCanvasRef = useRef(null);
  const singleCanvasRef = useRef(null);
  const renderTaskRef = useRef({});

  // Detect responsive mode
  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load PDF document
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setError(null);

    const loadingTask = pdfjsLib.getDocument({
      url: pdfUrl,
      cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/cmaps/',
      cMapPacked: true,
    });

    loadingTask.promise
      .then(async (doc) => {
        if (isCancelled) return;
        setPdfDoc(doc);
        setTotalPages(doc.numPages);
        if (onTotalPagesLoaded) onTotalPagesLoaded(doc.numPages);

        // Defined chapters for Gunaho Ka Devta and canonical folios
        const detectedChapters = [
          { title: 'शीर्षक व समर्पण (Title & Prelude)', page: 1 },
          { title: 'भाग १ : परिचयात्मक प्रवाह (Part I: The Flow Begins)', page: 3 },
          { title: 'भाग २ : द्वंद्व और विरह (Part II: Conflict & Longing)', page: 63 },
          { title: 'भाग ३ : उत्सर्ग और चरम (Part III: The Sublime Climax)', page: 126 }
        ];
        if (onChaptersLoaded) onChaptersLoaded(detectedChapters);
        setLoading(false);
      })
      .catch((err) => {
        if (isCancelled) return;
        console.error('Error loading PDF Document:', err);
        setError('Failed to load digital folio manuscript.');
        setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [pdfUrl]);

  // Calculate spread pages
  // Desktop spreads are: (1 & 2), (3 & 4) or (2 & 3), (4 & 5)
  // Page 1 is usually the cover or title, Page 2 left, Page 3 right
  const leftPageNum = currentPage % 2 === 0 ? currentPage : Math.max(1, currentPage - 1);
  const rightPageNum = leftPageNum + 1 <= totalPages ? leftPageNum + 1 : null;

  // Render Page onto Canvas
  const renderPage = async (pageNumber, canvas) => {
    if (!pdfDoc || !canvas || pageNumber < 1 || pageNumber > totalPages) return;

    try {
      if (renderTaskRef.current[pageNumber]) {
        renderTaskRef.current[pageNumber].cancel();
      }

      const page = await pdfDoc.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1.5 });
      const context = canvas.getContext('2d');

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };

      const task = page.render(renderContext);
      renderTaskRef.current[pageNumber] = task;
      await task.promise;
    } catch (err) {
      if (err?.name !== 'RenderingCancelledException') {
        console.warn('Render page notice:', err.message);
      }
    }
  };

  // Render on page change or mobile switch
  useEffect(() => {
    if (!pdfDoc || loading) return;

    if (isMobile) {
      if (singleCanvasRef.current) {
        renderPage(currentPage, singleCanvasRef.current);
      }
    } else {
      if (leftCanvasRef.current) {
        renderPage(leftPageNum, leftCanvasRef.current);
      }
      if (rightCanvasRef.current && rightPageNum) {
        renderPage(rightPageNum, rightCanvasRef.current);
      }
    }

    if (onPageChange) {
      onPageChange(currentPage, totalPages);
    }
  }, [pdfDoc, currentPage, isMobile, loading, totalPages]);

  // Page turns
  const goToNextPage = () => {
    if (isMobile) {
      if (currentPage < totalPages) {
        triggerFlipAnimation('next', () => setCurrentPage((p) => Math.min(totalPages, p + 1)));
      }
    } else {
      if (rightPageNum && rightPageNum < totalPages) {
        triggerFlipAnimation('next', () => setCurrentPage((p) => Math.min(totalPages, (leftPageNum || p) + 2)));
      } else if (leftPageNum + 1 < totalPages) {
        triggerFlipAnimation('next', () => setCurrentPage((p) => Math.min(totalPages, p + 2)));
      }
    }
  };

  const goToPrevPage = () => {
    if (isMobile) {
      if (currentPage > 1) {
        triggerFlipAnimation('prev', () => setCurrentPage((p) => Math.max(1, p - 1)));
      }
    } else {
      if (leftPageNum > 1) {
        triggerFlipAnimation('prev', () => setCurrentPage((p) => Math.max(1, leftPageNum - 2)));
      }
    }
  };

  const jumpToPage = (target) => {
    const p = Math.max(1, Math.min(totalPages, Number(target) || 1));
    triggerFlipAnimation(p > currentPage ? 'next' : 'prev', () => setCurrentPage(p));
  };

  const triggerFlipAnimation = (direction, callback) => {
    setFlipDirection(direction);
    setIsFlipping(true);
    setTimeout(() => {
      callback();
      setTimeout(() => {
        setIsFlipping(false);
      }, 250);
    }, 150);
  };

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    nextPage: goToNextPage,
    prevPage: goToPrevPage,
    goToPage: jumpToPage,
    currentPage,
    totalPages
  }));

  // Appearance Theme styling filters
  const getThemeFilter = () => {
    switch (theme) {
      case 'sepia':
        return 'sepia(45%) contrast(92%) brightness(96%) hue-rotate(-15deg)';
      case 'forest':
        return 'contrast(105%) brightness(88%) invert(88%) hue-rotate(140deg)';
      case 'parchment':
      default:
        return 'sepia(18%) contrast(98%) brightness(98%)';
    }
  };

  const getThemeBg = () => {
    switch (theme) {
      case 'sepia':
        return 'bg-[#efe6d5] border-[#d8c8b0]';
      case 'forest':
        return 'bg-[#1b2622] border-[#2c3d37]';
      case 'parchment':
      default:
        return 'bg-[#faf6ee] border-[#e8dfcf]';
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-[500px] flex flex-col items-center justify-center p-8 bg-surface-container-lowest/70 backdrop-blur-md rounded-2xl border border-surface-variant/40">
        <div className="w-12 h-12 rounded-full border-3 border-primary/20 border-t-primary animate-spin mb-4" />
        <p className="font-serif text-lg text-primary font-bold">आर्काइवल पृष्ठ तैयार किए जा रहे हैं...</p>
        <p className="text-xs text-outline font-label-archival uppercase tracking-wider mt-1">
          Rendering Authentic Manuscript Folio
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-[400px] flex flex-col items-center justify-center p-8 bg-surface-container rounded-2xl border border-error/20 text-center">
        <span className="material-symbols-outlined text-4xl text-error mb-2">error</span>
        <p className="text-sm font-semibold text-primary">{error}</p>
        <p className="text-xs text-outline mt-1">कृपया पृष्ठ रिफ्रेश करें या पुनः प्रयास करें।</p>
      </div>
    );
  }

  return (
    <div className="relative w-full flex flex-col items-center select-none">
      
      {/* Turn Buttons (Desktop Floating Hotspots) */}
      <button
        type="button"
        aria-label="Previous Page Turn"
        onClick={goToPrevPage}
        disabled={currentPage <= 1}
        className="hidden md:flex absolute -left-4 lg:-left-7 top-1/2 -translate-y-1/2 z-30 w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-surface-container-lowest/95 shadow-2xl flex-col items-center justify-center text-primary hover:bg-primary hover:text-on-primary hover:scale-105 active:scale-95 transition-all border border-surface-variant/60 disabled:opacity-30 disabled:cursor-not-allowed group cursor-pointer"
      >
        <span className="material-symbols-outlined text-2xl group-hover:-translate-x-0.5 transition-transform">
          arrow_back_ios_new
        </span>
        <span className="text-[9px] font-label-archival text-outline group-hover:text-primary-fixed uppercase tracking-wider font-bold">
          Flip
        </span>
      </button>

      <button
        type="button"
        aria-label="Next Page Turn"
        onClick={goToNextPage}
        disabled={currentPage >= totalPages}
        className="hidden md:flex absolute -right-4 lg:-right-7 top-1/2 -translate-y-1/2 z-30 w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-surface-container-lowest/95 shadow-2xl flex-col items-center justify-center text-primary hover:bg-primary hover:text-on-primary hover:scale-105 active:scale-95 transition-all border border-surface-variant/60 disabled:opacity-30 disabled:cursor-not-allowed group cursor-pointer"
      >
        <span className="material-symbols-outlined text-2xl group-hover:translate-x-0.5 transition-transform">
          arrow_forward_ios
        </span>
        <span className="text-[9px] font-label-archival text-outline group-hover:text-primary-fixed uppercase tracking-wider font-bold">
          Flip
        </span>
      </button>

      {/* Book Container with Realistic Binding, Spine Depth & Appearance Themes */}
      <div
        className={`w-full relative rounded-2xl shadow-[0_25px_70px_-15px_rgba(23,63,55,0.28),0_10px_30px_-5px_rgba(0,0,0,0.18)] ${getThemeBg()} border transition-all duration-300 overflow-hidden flex flex-col md:flex-row`}
      >
        {/* Realistic Book Base Stack Layers (Desktop) */}
        <div className="absolute -bottom-2.5 left-4 right-4 h-2.5 bg-[#423118]/20 rounded-b-lg -z-10 hidden sm:block" />
        <div className="absolute -bottom-1 left-2 right-2 h-1 bg-[#D8CEBE] rounded-b-lg -z-10 hidden sm:block" />

        {/* Center Spine Crease Gradient Shadow (Desktop) */}
        <div className="hidden md:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-8 bg-gradient-to-r from-black/15 via-black/5 to-black/15 pointer-events-none z-20 shadow-inner" />

        {/* 
          MOBILE: Single Page Canvas View
        */}
        {isMobile ? (
          <div className="w-full p-3 sm:p-5 flex flex-col items-center justify-center min-h-[500px]">
            <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-black/10 text-xs font-serif text-primary/80">
              <span className="font-bold">गुनाहों का देवता</span>
              <span className="font-semibold">पृष्ठ {currentPage} / {totalPages}</span>
            </div>

            <div
              className={`w-full flex items-center justify-center overflow-hidden transition-transform duration-300 ${
                isFlipping
                  ? flipDirection === 'next'
                    ? 'scale-[0.98] rotate-y-3 opacity-80'
                    : 'scale-[0.98] -rotate-y-3 opacity-80'
                  : 'scale-100 rotate-y-0 opacity-100'
              }`}
            >
              <canvas
                ref={singleCanvasRef}
                style={{ filter: getThemeFilter() }}
                className="max-w-full h-auto rounded-lg shadow-md transition-all duration-300"
              />
            </div>
          </div>
        ) : (
          /* 
            DESKTOP: Open Book Two-Page Spread (Left Page & Right Page)
          */
          <div className="w-full flex min-h-[650px] relative">
            
            {/* Left Page */}
            <div className="flex-1 p-5 lg:p-8 flex flex-col items-center justify-between relative border-r border-black/10 bg-gradient-to-r from-transparent via-transparent to-black/[0.04]">
              <div className="w-full flex items-center justify-between pb-3 mb-2 border-b border-black/10 opacity-70 text-xs font-serif">
                <span className="font-bold text-primary">धर्मवीर भारती • गुनाहों का देवता</span>
                <span className="font-bold text-primary">पृष्ठ {leftPageNum}</span>
              </div>

              <div
                className={`w-full flex-1 flex items-center justify-center overflow-hidden transition-all duration-300 ${
                  isFlipping && flipDirection === 'prev'
                    ? '-rotate-y-6 scale-[0.99] opacity-80'
                    : 'rotate-y-0 scale-100 opacity-100'
                }`}
              >
                <canvas
                  ref={leftCanvasRef}
                  style={{ filter: getThemeFilter() }}
                  className="max-w-full max-h-[720px] h-auto object-contain rounded shadow-sm transition-all duration-300"
                />
              </div>

              <div className="w-full pt-3 mt-2 border-t border-black/10 flex justify-between items-center opacity-60 text-[11px] font-label-archival">
                <span>भारतीय साहित्य canonical archive</span>
                <span>Part I • Allahabad Edition</span>
              </div>
            </div>

            {/* Right Page */}
            <div className="flex-1 p-5 lg:p-8 flex flex-col items-center justify-between relative bg-gradient-to-l from-transparent via-transparent to-black/[0.04]">
              <div className="w-full flex items-center justify-between pb-3 mb-2 border-b border-black/10 opacity-70 text-xs font-serif">
                <span className="font-bold text-primary">उपन्यास प्रवाह</span>
                <span className="font-bold text-primary">पृष्ठ {rightPageNum || '—'}</span>
              </div>

              <div
                className={`w-full flex-1 flex items-center justify-center overflow-hidden transition-all duration-300 ${
                  isFlipping && flipDirection === 'next'
                    ? 'rotate-y-6 scale-[0.99] opacity-80'
                    : 'rotate-y-0 scale-100 opacity-100'
                }`}
              >
                {rightPageNum ? (
                  <canvas
                    ref={rightCanvasRef}
                    style={{ filter: getThemeFilter() }}
                    className="max-w-full max-h-[720px] h-auto object-contain rounded shadow-sm transition-all duration-300"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-outline font-serif italic text-sm">
                    — ग्रन्थ का अन्तिम पृष्ठ —
                  </div>
                )}
              </div>

              <div className="w-full pt-3 mt-2 border-t border-black/10 flex justify-between items-center opacity-60 text-[11px] font-label-archival">
                <span>NovelShelf Archival Preservation</span>
                <span>Folio #{leftPageNum + 1}</span>
              </div>
            </div>

          </div>
        )}
      </div>

    </div>
  );
});

export default PdfBookReader;
