import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PageFlip } from 'page-flip';

// Use CDN worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
}

/**
 * Instant 3D Page-Flip Book Reader
 * Zero full-page loader screens: Renders the active spread instantly and
 * stream-renders adjacent pages seamlessly in background.
 * All English typography, authentic corner drag & realistic curl physics.
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
  const pdfDocRef = useRef(null);
  const renderedPagesRef = useRef(new Set());

  const [totalPages, setTotalPages] = useState(184);
  const [currentPage, setCurrentPage] = useState(initialPage);

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

  // Helper to render a single page onto its canvas
  const renderSinglePage = async (doc, pageNum) => {
    if (!doc || renderedPagesRef.current.has(pageNum)) return;
    const canvas = document.getElementById(`pdf-page-canvas-${pageNum}`);
    if (!canvas) return;

    try {
      renderedPagesRef.current.add(pageNum);
      const page = await doc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.4 });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      await page.render({
        canvasContext: ctx,
        viewport: viewport
      }).promise;
      // remove placeholder animation if present
      const skeleton = document.getElementById(`skeleton-p-${pageNum}`);
      if (skeleton) skeleton.style.display = 'none';
      canvas.style.opacity = '1';
    } catch (e) {
      renderedPagesRef.current.delete(pageNum);
    }
  };

  // Render a batch of pages around current view
  const renderVisibleRange = (doc, centerPage, total) => {
    if (!doc) return;
    const start = Math.max(1, centerPage - 4);
    const end = Math.min(total, centerPage + 6);
    for (let p = start; p <= end; p++) {
      renderSinglePage(doc, p);
    }
  };

  // 1. Initialize Book Structure instantly without loading screen
  useEffect(() => {
    let isSubscribed = true;
    const bookContainer = bookElRef.current;
    if (!bookContainer) return;

    bookContainer.innerHTML = '';
    renderedPagesRef.current.clear();

    const assumedPages = 184;

    // Create all page shells instantly so StPageFlip mounts immediately
    for (let i = 1; i <= assumedPages; i++) {
      const pageEl = document.createElement('div');
      pageEl.className = 'page-flip-page';
      pageEl.dataset.density = i === 1 || i === assumedPages ? 'hard' : 'soft';
      pageEl.style.backgroundColor = getThemeBg();
      pageEl.style.boxShadow = 'inset 0 0 25px rgba(0,0,0,0.06)';
      pageEl.style.display = 'flex';
      pageEl.style.flexDirection = 'column';
      pageEl.style.justifyContent = 'space-between';
      pageEl.style.alignItems = 'center';
      pageEl.style.padding = '12px 16px';
      pageEl.style.overflow = 'hidden';
      pageEl.style.position = 'relative';

      // English Header
      const header = document.createElement('div');
      header.style.width = '100%';
      header.style.display = 'flex';
      header.style.justifyContent = 'space-between';
      header.style.fontSize = '10px';
      header.style.fontFamily = '"Playfair Display", serif';
      header.style.fontWeight = 'bold';
      header.style.letterSpacing = '0.04em';
      header.style.opacity = '0.65';
      header.style.paddingBottom = '6px';
      header.style.borderBottom = '1px solid rgba(0,0,0,0.08)';
      header.innerHTML = `<span>DHARAMVIR BHARATI • GUNAHO KA DEVTA</span><span>PAGE ${i}</span>`;
      pageEl.appendChild(header);

      // Canvas / Content Wrap
      const canvasWrap = document.createElement('div');
      canvasWrap.style.flex = '1';
      canvasWrap.style.width = '100%';
      canvasWrap.style.display = 'flex';
      canvasWrap.style.alignItems = 'center';
      canvasWrap.style.justifyContent = 'center';
      canvasWrap.style.overflow = 'hidden';
      canvasWrap.style.position = 'relative';

      // Elegant parchment placeholder skeleton while page renders
      const skeleton = document.createElement('div');
      skeleton.id = `skeleton-p-${i}`;
      skeleton.style.position = 'absolute';
      skeleton.style.inset = '10px';
      skeleton.style.borderRadius = '6px';
      skeleton.style.background = 'linear-gradient(180deg, rgba(0,0,0,0.03) 0%, rgba(0,0,0,0.01) 100%)';
      skeleton.style.display = 'flex';
      skeleton.style.flexDirection = 'column';
      skeleton.style.justifyContent = 'center';
      skeleton.style.alignItems = 'center';
      skeleton.innerHTML = `<span style="font-size:11px; font-family:'Playfair Display', serif; opacity:0.4;">Archival Folio ${i}</span>`;
      canvasWrap.appendChild(skeleton);

      const canvas = document.createElement('canvas');
      canvas.id = `pdf-page-canvas-${i}`;
      canvas.style.maxWidth = '100%';
      canvas.style.maxHeight = '100%';
      canvas.style.objectFit = 'contain';
      canvas.style.filter = getThemeFilter();
      canvas.style.opacity = '0';
      canvas.style.transition = 'opacity 0.25s ease, filter 0.3s ease';
      canvasWrap.appendChild(canvas);
      pageEl.appendChild(canvasWrap);

      // English Footer
      const footer = document.createElement('div');
      footer.style.width = '100%';
      footer.style.display = 'flex';
      footer.style.justifyContent = 'space-between';
      footer.style.fontSize = '9px';
      footer.style.letterSpacing = '0.08em';
      footer.style.textTransform = 'uppercase';
      footer.style.opacity = '0.45';
      footer.style.paddingTop = '6px';
      footer.style.borderTop = '1px solid rgba(0,0,0,0.08)';
      footer.innerHTML = `<span>NovelShelf Canonical Archive</span><span>Page ${i} of ${assumedPages}</span>`;
      pageEl.appendChild(footer);

      bookContainer.appendChild(pageEl);
    }

    const isSmallScreen = window.innerWidth < 768;
    const pageW = isSmallScreen ? Math.min(380, window.innerWidth - 30) : 480;
    const pageH = isSmallScreen ? Math.min(560, window.innerHeight - 200) : 660;

    // Mount StPageFlip immediately so book appears right away without loading screen
    const pageFlip = new PageFlip(bookContainer, {
      width: pageW,
      height: pageH,
      size: isSmallScreen ? 'fixed' : 'stretch',
      minWidth: 320,
      maxWidth: 620,
      minHeight: 460,
      maxHeight: 820,
      maxShadowOpacity: 0.65,
      showCover: true,
      mobileScrollSupport: false,
      flippingTime: 650,
      usePortrait: isSmallScreen,
      autoSize: true,
      drawShadow: true,
    });

    pageFlip.loadFromHTML(bookContainer.querySelectorAll('.page-flip-page'));

    pageFlip.on('flip', (e) => {
      const newPage = e.data + 1;
      setCurrentPage(newPage);
      if (onPageChange) onPageChange(newPage, assumedPages);
      if (pdfDocRef.current) {
        renderVisibleRange(pdfDocRef.current, newPage, assumedPages);
      }
    });

    pageFlipInstance.current = pageFlip;

    // Load PDF Document in background and render immediately
    pdfjsLib.getDocument({
      url: pdfUrl,
      cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/cmaps/',
      cMapPacked: true,
    }).promise.then((doc) => {
      if (!isSubscribed) return;
      pdfDocRef.current = doc;
      setTotalPages(doc.numPages);
      if (onTotalPagesLoaded) onTotalPagesLoaded(doc.numPages);

      // Inform parent of canonical English chapters
      if (onChaptersLoaded) {
        onChaptersLoaded([
          { title: 'Title & Archival Prelude', page: 1 },
          { title: 'Part I: The Flow Begins', page: 3 },
          { title: 'Part II: Conflict & Longing', page: 63 },
          { title: 'Part III: The Sublime Climax', page: 126 }
        ]);
      }

      // Render the currently active page and immediate neighbors right now
      renderVisibleRange(doc, initialPage, doc.numPages);

      // Render remainder progressively
      setTimeout(() => {
        if (!isSubscribed) return;
        for (let p = 1; p <= doc.numPages; p++) {
          renderSinglePage(doc, p);
        }
      }, 800);
    }).catch((err) => {
      console.warn('PDF load notice:', err.message);
    });

    return () => {
      isSubscribed = false;
      if (pageFlipInstance.current) {
        try {
          pageFlipInstance.current.destroy();
        } catch {}
        pageFlipInstance.current = null;
      }
    };
  }, [pdfUrl, spreadWidth]);

  // Update canvas CSS filter whenever theme changes
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
        if (pdfDocRef.current) {
          renderVisibleRange(pdfDocRef.current, p, totalPages);
        }
      }
    },
    currentPage,
    totalPages
  }));

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
        <span>Tip: Drag page corners with your mouse or click to flip pages naturally!</span>
      </div>
    </div>
  );
});

export default PdfBookReader;
