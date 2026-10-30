import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PageFlip } from 'page-flip';

// Use the official CDN worker for pdfjs-dist
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
}

/**
 * Authentic Realistic 3D Page-Flip Book Reader
 * Powered by StPageFlip (HTML5 Canvas 3D Curl & Shadow Physics engine)
 * With mouse drag, corner curl, smooth page turns, and appearance themes.
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
  const containerRef = useRef(null);
  const bookElRef = useRef(null);
  const pageFlipInstance = useRef(null);

  const [pdfDoc, setPdfDoc] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [renderProgress, setRenderProgress] = useState(0);

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
        return '#efe6d5';
      case 'forest':
        return '#1b2622';
      case 'parchment':
      default:
        return '#faf6ee';
    }
  };

  // 1. Load PDF Document
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setError(null);
    setRenderProgress(10);

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

        // Predefined chapters for Gunaho Ka Devta and canonical folios
        const detectedChapters = [
          { title: 'शीर्षक व समर्पण (Title & Prelude)', page: 1 },
          { title: 'भाग १ : परिचयात्मक प्रवाह (Part I)', page: 3 },
          { title: 'भाग २ : द्वंद्व और विरह (Part II)', page: 63 },
          { title: 'भाग ३ : उत्सर्ग और चरम (Part III)', page: 126 }
        ];
        if (onChaptersLoaded) onChaptersLoaded(detectedChapters);
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

  // 2. Initialize PageFlip 3D Engine once PDF is loaded
  useEffect(() => {
    if (!pdfDoc || !bookElRef.current) return;

    let isSubscribed = true;

    async function initPageFlipEngine() {
      try {
        setRenderProgress(30);
        const bookContainer = bookElRef.current;
        bookContainer.innerHTML = ''; // Clear previous

        // Destroy old PageFlip instance if any
        if (pageFlipInstance.current) {
          try {
            pageFlipInstance.current.destroy();
          } catch {}
          pageFlipInstance.current = null;
        }

        const numPages = pdfDoc.numPages;

        // Render each page into an authentic HTML page container
        // We render all pages so user can drag any page corner naturally!
        for (let i = 1; i <= numPages; i++) {
          if (!isSubscribed) return;

          const pageEl = document.createElement('div');
          pageEl.className = 'page-flip-page';
          pageEl.dataset.density = i === 1 || i === numPages ? 'hard' : 'soft';
          pageEl.style.backgroundColor = getThemeBg();
          pageEl.style.boxShadow = 'inset 0 0 30px rgba(0,0,0,0.06)';
          pageEl.style.display = 'flex';
          pageEl.style.flexDirection = 'column';
          pageEl.style.justifyContent = 'space-between';
          pageEl.style.alignItems = 'center';
          pageEl.style.padding = '12px 14px';
          pageEl.style.overflow = 'hidden';
          pageEl.style.position = 'relative';

          // Page Header
          const header = document.createElement('div');
          header.style.width = '100%';
          header.style.display = 'flex';
          header.style.justifyContent = 'space-between';
          header.style.fontSize = '10px';
          header.style.fontFamily = '"Playfair Display", serif';
          header.style.fontWeight = 'bold';
          header.style.opacity = '0.65';
          header.style.paddingBottom = '6px';
          header.style.borderBottom = '1px solid rgba(0,0,0,0.08)';
          header.innerHTML = `<span>धर्मवीर भारती • गुनाहों का देवता</span><span>पृष्ठ ${i}</span>`;
          pageEl.appendChild(header);

          // Canvas Container
          const canvasWrap = document.createElement('div');
          canvasWrap.style.flex = '1';
          canvasWrap.style.width = '100%';
          canvasWrap.style.display = 'flex';
          canvasWrap.style.alignItems = 'center';
          canvasWrap.style.justifyContent = 'center';
          canvasWrap.style.overflow = 'hidden';

          const canvas = document.createElement('canvas');
          canvas.id = `pdf-canvas-p-${i}`;
          canvas.style.maxWidth = '100%';
          canvas.style.maxHeight = '100%';
          canvas.style.objectFit = 'contain';
          canvas.style.filter = getThemeFilter();
          canvas.style.transition = 'filter 0.3s ease';
          canvasWrap.appendChild(canvas);
          pageEl.appendChild(canvasWrap);

          // Page Footer
          const footer = document.createElement('div');
          footer.style.width = '100%';
          footer.style.display = 'flex';
          footer.style.justifyContent = 'space-between';
          footer.style.fontSize = '9px';
          footer.style.letterSpacing = '0.08em';
          footer.style.textTransform = 'uppercase';
          footer.style.opacity = '0.5';
          footer.style.paddingTop = '6px';
          footer.style.borderTop = '1px solid rgba(0,0,0,0.08)';
          footer.innerHTML = `<span>NovelShelf Canonical Folio</span><span>Page ${i} of ${numPages}</span>`;
          pageEl.appendChild(footer);

          bookContainer.appendChild(pageEl);
        }

        // Determine dimensions based on viewport
        const isSmallScreen = window.innerWidth < 768;
        const pageW = isSmallScreen ? Math.min(380, window.innerWidth - 30) : 480;
        const pageH = isSmallScreen ? Math.min(560, window.innerHeight - 200) : 660;

        // Instantiate StPageFlip with full 3D physics & sound effects!
        const pageFlip = new PageFlip(bookContainer, {
          width: pageW,
          height: pageH,
          size: isSmallScreen ? 'fixed' : 'stretch',
          minWidth: 320,
          maxWidth: 620,
          minHeight: 460,
          maxHeight: 820,
          maxShadowOpacity: 0.65, // Authentic shadow depth
          showCover: true, // Realistic book hardcover behavior
          mobileScrollSupport: false,
          flippingTime: 700, // Smooth 700ms realistic page curl
          usePortrait: isSmallScreen,
          autoSize: true,
          drawShadow: true,
        });

        pageFlip.loadFromHTML(bookContainer.querySelectorAll('.page-flip-page'));

        pageFlip.on('flip', (e) => {
          const newP = e.data + 1;
          setCurrentPage(newP);
          if (onPageChange) {
            onPageChange(newP, numPages);
          }
        });

        pageFlipInstance.current = pageFlip;

        // Render first 6 initial pages quickly so user sees the book instantly
        setRenderProgress(60);
        await renderPageRange(pdfDoc, 1, Math.min(numPages, 6));

        // Start from initialPage
        if (initialPage > 1 && initialPage <= numPages) {
          pageFlip.turnToPage(initialPage - 1);
        }

        setLoading(false);
        setRenderProgress(100);

        // Render remainder of pages progressively in the background
        setTimeout(() => {
          if (isSubscribed) {
            renderPageRange(pdfDoc, 7, numPages);
          }
        }, 500);

      } catch (err) {
        console.error('Error initializing PageFlip:', err);
        setError('Error creating 3D page flip experience.');
        setLoading(false);
      }
    }

    initPageFlipEngine();

    return () => {
      isSubscribed = false;
      if (pageFlipInstance.current) {
        try {
          pageFlipInstance.current.destroy();
        } catch {}
        pageFlipInstance.current = null;
      }
    };
  }, [pdfDoc, spreadWidth]);

  // Helper: Render range of pages onto their respective canvas
  const renderPageRange = async (doc, start, end) => {
    for (let p = start; p <= end; p++) {
      const canvas = document.getElementById(`pdf-canvas-p-${p}`);
      if (!canvas) continue;
      try {
        const page = await doc.getPage(p);
        const viewport = page.getViewport({ scale: 1.4 });
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        await page.render({
          canvasContext: ctx,
          viewport: viewport
        }).promise;
      } catch (e) {
        // ignore cancelled renders
      }
    }
  };

  // Update canvas CSS filter whenever theme changes without re-rendering!
  useEffect(() => {
    if (!bookElRef.current) return;
    const canvases = bookElRef.current.querySelectorAll('canvas');
    canvases.forEach((c) => {
      c.style.filter = getThemeFilter();
    });
    const pages = bookElRef.current.querySelectorAll('.page-flip-page');
    pages.forEach((p) => {
      p.style.backgroundColor = getThemeBg();
    });
  }, [theme]);

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    nextPage: () => {
      if (pageFlipInstance.current) {
        pageFlipInstance.current.flipNext('top');
      }
    },
    prevPage: () => {
      if (pageFlipInstance.current) {
        pageFlipInstance.current.flipPrev('top');
      }
    },
    goToPage: (targetPage) => {
      if (pageFlipInstance.current && totalPages > 0) {
        const p = Math.max(1, Math.min(totalPages, Number(targetPage) || 1));
        pageFlipInstance.current.turnToPage(p - 1);
        setCurrentPage(p);
      }
    },
    currentPage,
    totalPages
  }));

  if (loading) {
    return (
      <div className="w-full min-h-[580px] flex flex-col items-center justify-center p-8 bg-surface-container-lowest/80 backdrop-blur-md rounded-2xl border border-surface-variant/40 shadow-xl">
        <div className="w-14 h-14 rounded-full border-3 border-primary/20 border-t-primary animate-spin mb-4 shadow-sm" />
        <p className="font-serif text-xl text-primary font-bold">
          असली 3D पन्ने तैयार किए जा रहे हैं...
        </p>
        <p className="text-xs text-outline font-label-archival uppercase tracking-wider mt-1.5">
          Initializing Realistic 3D Page-Flip Engine ({renderProgress}%)
        </p>
        <div className="w-48 h-1.5 bg-surface-container-high rounded-full overflow-hidden mt-3">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${renderProgress}%` }}
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-[400px] flex flex-col items-center justify-center p-8 bg-surface-container rounded-2xl border border-error/20 text-center">
        <span className="material-symbols-outlined text-4xl text-error mb-2">error</span>
        <p className="text-sm font-semibold text-primary">{error}</p>
        <p className="text-xs text-outline mt-1">कृपया पृष्ठ रिफ्रेश करें।</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full flex flex-col items-center justify-center py-2 sm:py-4 select-none"
    >
      {/* Turn Buttons (Floating Hotspots with Real Flip Action) */}
      <button
        type="button"
        aria-label="Previous Page Turn"
        onClick={() => pageFlipInstance.current?.flipPrev('top')}
        disabled={currentPage <= 1}
        className="hidden md:flex absolute -left-4 lg:-left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-surface-container-lowest/95 shadow-2xl flex-col items-center justify-center text-primary hover:bg-primary hover:text-on-primary hover:scale-110 active:scale-95 transition-all border border-surface-variant/60 disabled:opacity-30 disabled:cursor-not-allowed group cursor-pointer"
        title="Flip to Previous Page (or Drag Page Corner with Mouse)"
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
        onClick={() => pageFlipInstance.current?.flipNext('top')}
        disabled={currentPage >= totalPages}
        className="hidden md:flex absolute -right-4 lg:-right-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-surface-container-lowest/95 shadow-2xl flex-col items-center justify-center text-primary hover:bg-primary hover:text-on-primary hover:scale-110 active:scale-95 transition-all border border-surface-variant/60 disabled:opacity-30 disabled:cursor-not-allowed group cursor-pointer"
        title="Flip to Next Page (or Drag Page Corner with Mouse)"
      >
        <span className="material-symbols-outlined text-2xl group-hover:translate-x-0.5 transition-transform">
          arrow_forward_ios
        </span>
        <span className="text-[9px] font-label-archival text-outline group-hover:text-primary-fixed uppercase tracking-wider font-bold">
          Flip
        </span>
      </button>

      {/* Real 3D Book Stage (Supports Mouse Click, Corner Drag, and Natural Page Turn Physics) */}
      <div className="relative flex items-center justify-center max-w-full overflow-visible p-2">
        
        {/* Book Outer Binding Shadows */}
        <div className="absolute -bottom-3 left-6 right-6 h-3 bg-black/25 rounded-b-xl blur-xs -z-10" />
        <div className="absolute -bottom-1.5 left-3 right-3 h-2 bg-[#423118]/25 rounded-b-lg -z-10" />

        {/* StPageFlip Mounting Element */}
        <div
          ref={bookElRef}
          className="flip-book shadow-2xl rounded-xl overflow-hidden cursor-grab active:cursor-grabbing"
          style={{ margin: '0 auto' }}
        />
      </div>

      {/* Helpful Hint */}
      <div className="mt-3 flex items-center gap-1.5 text-[11px] font-label-archival text-outline">
        <span className="material-symbols-outlined text-sm">touch_app</span>
        <span>Tip: पन्ने के कोने को माउस से पकड़कर (Drag) असली किताब की तरह मोड़ा और पलटा जा सकता है!</span>
      </div>

    </div>
  );
});

export default PdfBookReader;
