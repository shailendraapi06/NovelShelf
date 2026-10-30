import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { BOOKS, READER_SPREADS } from '../data/booksData';
import AppearanceDrawer from '../components/reader/AppearanceDrawer';
import PdfBookReader from '../components/reader/PdfBookReader';

export default function ReadingRoomPage() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { 
    isBookmarked, 
    toggleBookmark, 
    showToast, 
    readerSettings, 
    updateReaderSettings,
    books
  } = useLibrary();

  const libraryBooks = books && books.length > 0 ? books : BOOKS;
  const book = libraryBooks.find(b => b.id === bookId || b.slug === bookId) || libraryBooks[0];
  const bookmarked = isBookmarked(book.id);

  // States
  const [currentSpreadIndex, setCurrentSpreadIndex] = useState(0);
  const [mobilePageSide, setMobilePageSide] = useState('left'); // 'left' | 'right' for mobile single-page view
  const [isDogEared, setIsDogEared] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // PDF Reader States
  const pdfReaderRef = useRef(null);
  const [pdfCurrentPage, setPdfCurrentPage] = useState(1);
  const [pdfTotalPages, setPdfTotalPages] = useState(book.pages || 184);
  const [pdfChapters, setPdfChapters] = useState([
    { title: 'Title & Archival Prelude', page: 1 },
    { title: 'Part I: The Flow Begins', page: 3 },
    { title: 'Part II: Conflict & Longing', page: 63 },
    { title: 'Part III: The Sublime Climax', page: 126 }
  ]);

  const hasPdf = Boolean(book.pdfUrl || (book.pdfFile && (book.pdfFile.filePath || book.pdfFile.filename)));
  const pdfSource = book.pdfUrl || (book.pdfFile ? `/api/v1/books/${book.id}/content` : null);

  // Require authentication to read: Redirect guest to login
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      showToast('Patron authentication required to enter the Reading Room.', 'error');
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`, { replace: true });
    }
  }, [isAuthenticated, authLoading, location.pathname, navigate, showToast]);

  // Sync saved reading progress from backend
  useEffect(() => {
    if (isAuthenticated && book.id) {
      api.getReadingProgress(book.id).then(res => {
        if (res && res.progress) {
          if (res.progress.currentPage && hasPdf) {
            setPdfCurrentPage(res.progress.currentPage);
          }
          if (res.progress.spreadIndex !== undefined && res.progress.spreadIndex < READER_SPREADS.length) {
            setCurrentSpreadIndex(res.progress.spreadIndex);
          }
        }
      }).catch(() => {});
    }
  }, [isAuthenticated, book.id, hasPdf]);

  const spread = READER_SPREADS[currentSpreadIndex] || READER_SPREADS[0];

  // Sync progress on page change
  const syncProgressToBackend = (newPage, total) => {
    if (isAuthenticated && book.id) {
      api.saveReadingProgress(book.id, {
        currentPage: newPage,
        totalPages: total || book.pages || 500,
        chapter: hasPdf ? `Page ${newPage}` : spread.chapterTitle,
        spreadIndex: hasPdf ? Math.floor(newPage / 2) : currentSpreadIndex
      }).catch(() => {});
    }
  };

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowLeft') handlePrevAction();
      if (e.key === 'ArrowRight') handleNextAction();
      if (e.key.toLowerCase() === 'b') toggleBookmark(book.id);
      if (e.key.toLowerCase() === 'f') handleToggleFullscreen();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [book.id, currentSpreadIndex, mobilePageSide, hasPdf, pdfCurrentPage]);

  // Turn page actions
  const handlePrevAction = () => {
    if (hasPdf && pdfReaderRef.current) {
      pdfReaderRef.current.prevPage();
      showToast('Turned back one page folio.');
      return;
    }

    if (window.innerWidth < 768 && mobilePageSide === 'right') {
      setMobilePageSide('left');
      showToast(`Turned back to Page ${spread.leftPage}.`);
      return;
    }

    if (currentSpreadIndex > 0) {
      const nextIndex = currentSpreadIndex - 1;
      setCurrentSpreadIndex(nextIndex);
      syncProgressToBackend(READER_SPREADS[nextIndex].leftPage, book.pages);
      if (window.innerWidth < 768) {
        setMobilePageSide('right');
        showToast(`Turned back to Page ${READER_SPREADS[nextIndex].rightPage}.`);
      } else {
        showToast(`Turned back to Pages ${READER_SPREADS[nextIndex].leftPage}–${READER_SPREADS[nextIndex].rightPage}.`);
      }
    } else {
      showToast("You are at the beginning of this archival excerpt.");
    }
  };

  const handleNextAction = () => {
    if (hasPdf && pdfReaderRef.current) {
      pdfReaderRef.current.nextPage();
      showToast('Flipped forward to next page folio.');
      return;
    }

    if (window.innerWidth < 768 && mobilePageSide === 'left') {
      setMobilePageSide('right');
      showToast(`Turned to Page ${spread.rightPage}.`);
      return;
    }

    if (currentSpreadIndex < READER_SPREADS.length - 1) {
      const nextIndex = currentSpreadIndex + 1;
      setCurrentSpreadIndex(nextIndex);
      setMobilePageSide('left');
      syncProgressToBackend(READER_SPREADS[nextIndex].leftPage, book.pages);
      if (window.innerWidth < 768) {
        showToast(`Turned forward to Page ${READER_SPREADS[nextIndex].leftPage}.`);
      } else {
        showToast(`Turned forward to Pages ${READER_SPREADS[nextIndex].leftPage}–${READER_SPREADS[nextIndex].rightPage}.`);
      }
    } else {
      showToast("Reached the end of this digital preview chapter.");
    }
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
      showToast("Entered Tranquil Fullscreen Reading Mode.");
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
        showToast("Exited Fullscreen.");
      }
    }
  };

  const handleJumpChapter = (pageVal) => {
    const pageNum = Number(pageVal) || 1;
    if (hasPdf && pdfReaderRef.current) {
      pdfReaderRef.current.goToPage(pageNum);
      setPdfCurrentPage(pageNum);
      syncProgressToBackend(pageNum, pdfTotalPages);
      showToast(`Navigated to Page ${pageNum}.`);
    } else {
      showToast(`Jumped to Chapter.`);
    }
  };

  const handleToggleSound = () => {
    updateReaderSettings({ ambientSound: !readerSettings.ambientSound });
    showToast(
      !readerSettings.ambientSound
        ? "Rain & library ambient atmosphere enabled."
        : "Ambient sound muted."
    );
  };

  const handleScrubTimeline = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));

    if (hasPdf && pdfReaderRef.current && pdfTotalPages > 0) {
      const targetPage = Math.max(1, Math.round(ratio * pdfTotalPages));
      pdfReaderRef.current.goToPage(targetPage);
      setPdfCurrentPage(targetPage);
      syncProgressToBackend(targetPage, pdfTotalPages);
      showToast(`Navigated timeline to Page ${targetPage} (${Math.round(ratio * 100)}%).`);
    } else {
      const targetIndex = Math.min(
        READER_SPREADS.length - 1,
        Math.floor(ratio * READER_SPREADS.length)
      );
      setCurrentSpreadIndex(targetIndex);
      syncProgressToBackend(READER_SPREADS[targetIndex].leftPage, book.pages);
      showToast(`Navigated timeline to Pages ${READER_SPREADS[targetIndex].leftPage}–${READER_SPREADS[targetIndex].rightPage}.`);
    }
  };

  // Appearance theme mapping
  const getThemeStyles = () => {
    switch (readerSettings.theme) {
      case 'sepia':
        return {
          bg: 'bg-[#efe6d5]',
          text: 'text-[#443828]',
          cardBorder: 'border-[#d8c8b0]',
          headerBg: 'bg-[#efe6d5]/95 border-[#d8c8b0]',
          leftGrad: 'bg-gradient-to-r from-[#e7dcc7] via-[#efe6d5] to-[#f5edd9]',
          rightGrad: 'bg-gradient-to-l from-[#e7dcc7] via-[#efe6d5] to-[#f5edd9]',
          dropCapColor: 'text-[#8c5028]',
        };
      case 'forest':
        return {
          bg: 'bg-[#1b2622]',
          text: 'text-[#dfede6]',
          cardBorder: 'border-[#2c3d37]',
          headerBg: 'bg-[#1b2622]/95 border-[#2c3d37]',
          leftGrad: 'bg-gradient-to-r from-[#141d1a] via-[#1b2622] to-[#202d28]',
          rightGrad: 'bg-gradient-to-l from-[#141d1a] via-[#1b2622] to-[#202d28]',
          dropCapColor: 'text-[#b8c9c0]',
        };
      case 'parchment':
      default:
        return {
          bg: 'bg-[#faf6ee]',
          text: 'text-[#2b332f]',
          cardBorder: 'border-[#e8dfcf]',
          headerBg: 'bg-surface/95 border-surface-variant/40',
          leftGrad: 'bg-gradient-to-r from-[#f1ebd9] via-[#faf6ee] to-[#fbf7f0]',
          rightGrad: 'bg-gradient-to-l from-[#f1ebd9] via-[#faf6ee] to-[#fbf7f0]',
          dropCapColor: 'text-primary',
        };
    }
  };

  const themeStyle = getThemeStyles();

  const getFontFamilyStyle = () => {
    switch (readerSettings.fontClass) {
      case 'font-reader-et-book':
        return '"ET Book", "Palatino", serif';
      case 'font-reader-garamond':
        return '"EB Garamond", serif';
      case 'font-reader-baskerville':
        return '"Libre Baskerville", serif';
      case 'font-reader-manrope':
        return '"Manrope", sans-serif';
      case 'font-reader-playfair':
      default:
        return '"Playfair Display", serif';
    }
  };

  const getFontSizeValue = () => {
    switch (readerSettings.fontSize) {
      case 'sm': return '0.9rem';
      case 'lg': return '1.15rem';
      case 'xl': return '1.28rem';
      case 'md':
      default: return '1.02rem';
    }
  };

  const getLineHeightValue = () => {
    switch (readerSettings.leading) {
      case 'compact': return '1.5';
      case 'loose': return '2.0';
      case 'relaxed':
      default: return '1.75';
    }
  };

  const getSpreadMaxWidth = () => {
    switch (readerSettings.spreadWidth) {
      case 'reader-width-narrow': return '860px';
      case 'reader-width-expansive': return '1260px';
      case 'reader-width-standard':
      default: return '1060px';
    }
  };

  const displayPage = hasPdf ? pdfCurrentPage : spread.leftPage;
  const displayTotal = hasPdf ? pdfTotalPages : book.pages;
  const readPercent = Math.min(100, Math.round((displayPage / (displayTotal || 100)) * 100));

  return (
    <div className={`min-h-screen ${themeStyle.bg} ${themeStyle.text} transition-colors duration-300 flex flex-col justify-between overflow-x-hidden select-none`}>
      
      {/* Top Reading Navigation Bar */}
      <header className={`sticky top-0 z-40 backdrop-blur-md px-3 sm:px-6 lg:px-12 py-3 border-b transition-colors shadow-xs ${themeStyle.headerBg}`}>
        <div className="max-w-[1360px] mx-auto flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Left: Back to Book Details and Breadcrumbs */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link 
              to={`/books/${book.id}`}
              className="p-1.5 sm:p-2 rounded-lg bg-surface-container/60 hover:bg-surface-container text-primary transition-all flex items-center justify-center shrink-0 min-h-[38px] min-w-[38px]"
              title="Return to Book Overview"
              aria-label="Back to book details"
            >
              <span className="material-symbols-outlined text-lg sm:text-xl">arrow_back</span>
            </Link>

            <div className="flex flex-col min-w-0">
              <span className="font-title-editorial text-sm sm:text-base font-bold text-primary truncate leading-tight">
                {book.title}
              </span>
              <span className="font-label-archival text-[9px] sm:text-[10px] text-secondary tracking-widest uppercase truncate font-semibold">
                {book.author} • {hasPdf ? 'Authentic Digital Folio' : spread.chapterTitle.split(':')[0]}
              </span>
            </div>
          </div>

          {/* Right: Actions, Themes & Appearance */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* Quick Ribbon Bookmark Toggle */}
            <button 
              type="button"
              onClick={() => toggleBookmark(book.id)}
              className={`p-2 rounded-lg transition-all flex items-center cursor-pointer min-h-[38px] min-w-[38px] justify-center ${
                bookmarked 
                  ? 'bg-secondary text-surface shadow-xs font-bold' 
                  : 'bg-surface-container/60 hover:bg-surface-container text-on-surface-variant hover:text-primary'
              }`}
              title={bookmarked ? "Archival Bookmark saved" : "Bookmark this volume"}
              aria-label="Bookmark"
            >
              <span className="material-symbols-outlined text-base">
                {bookmarked ? 'bookmark' : 'bookmark_border'}
              </span>
            </button>

            {/* Ambient Sound Toggle */}
            <button 
              type="button"
              onClick={handleToggleSound}
              className={`p-2 rounded-lg transition-all flex items-center cursor-pointer min-h-[38px] min-w-[38px] justify-center ${
                readerSettings.ambientSound 
                  ? 'bg-primary-container text-on-primary-container' 
                  : 'bg-surface-container/60 hover:bg-surface-container text-on-surface-variant hover:text-primary'
              }`}
              title="Toggle Library Rain & Hearth Audio"
              aria-label="Toggle ambient audio"
            >
              <span className="material-symbols-outlined text-base">
                {readerSettings.ambientSound ? 'water_drop' : 'music_off'}
              </span>
            </button>

            {/* Reading Appearance Trigger */}
            <button 
              type="button"
              onClick={() => setIsDrawerOpen(prev => !prev)}
              className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container transition-all flex items-center gap-1.5 shadow-xs font-semibold cursor-pointer min-h-[38px]"
              title="Customise Typography, Themes & Display"
              aria-label="Open appearance settings"
            >
              <span className="material-symbols-outlined text-base">tune</span>
              <span className="hidden sm:inline font-label-lg text-xs sm:text-label-lg">Appearance</span>
            </button>

            {/* Fullscreen Trigger */}
            <button 
              type="button"
              onClick={handleToggleFullscreen}
              className="p-2 rounded-lg bg-surface-container/60 hover:bg-surface-container text-on-surface-variant hover:text-primary transition-all flex items-center cursor-pointer min-h-[38px] min-w-[38px] justify-center"
              title="Toggle Fullscreen Focus"
              aria-label="Toggle fullscreen"
            >
              <span className="material-symbols-outlined text-base">
                {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Sanctuary Reading Room Viewport */}
      <div className="w-full py-4 sm:py-8 md:py-12 px-3 sm:px-6 lg:px-12 flex flex-col items-center justify-center flex-1">
        
        {/* If Book has authentic PDF, Render the Real Canvas-based Book Reader! */}
        {hasPdf ? (
          <div 
            style={{ maxWidth: getSpreadMaxWidth() }}
            className="w-full mx-auto transition-all duration-300"
          >
            <PdfBookReader
              ref={pdfReaderRef}
              pdfUrl={pdfSource}
              initialPage={pdfCurrentPage}
              theme={readerSettings.theme}
              spreadWidth={readerSettings.spreadWidth}
              onPageChange={(currPage, total) => {
                setPdfCurrentPage(currPage);
                setPdfTotalPages(total);
                syncProgressToBackend(currPage, total);
              }}
              onTotalPagesLoaded={(total) => setPdfTotalPages(total)}
              onChaptersLoaded={(chaps) => setPdfChapters(chaps)}
            />
          </div>
        ) : (
          /* Standard Excerpt Spread Engine for other Books */
          <>
            {/* Mobile Page Switcher Pill (< 768px) */}
            <div className="md:hidden flex items-center justify-center gap-2 mb-3 bg-surface-container/80 rounded-full p-1 shadow-xs border border-surface-variant/40">
              <button 
                type="button"
                onClick={() => setMobilePageSide('left')}
                className={`px-3 py-1 rounded-full font-label-md text-xs transition-all ${
                  mobilePageSide === 'left' 
                    ? 'bg-primary text-on-primary font-bold shadow-xs' 
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                Page {spread.leftPage}
              </button>
              <button 
                type="button"
                onClick={() => setMobilePageSide('right')}
                className={`px-3 py-1 rounded-full font-label-md text-xs transition-all ${
                  mobilePageSide === 'right' 
                    ? 'bg-primary text-on-primary font-bold shadow-xs' 
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                Page {spread.rightPage}
              </button>
            </div>

            {/* The Open Book Stage with Dynamic Width Binding */}
            <div 
              style={{ maxWidth: getSpreadMaxWidth() }}
              className="relative w-full mx-auto flex items-center justify-center transition-all duration-300"
            >
              {/* Left Page Flip Hotzone & Floating Button (Desktop) */}
              <button 
                type="button"
                aria-label="Previous Page"
                onClick={handlePrevAction}
                className="hidden sm:flex group absolute -left-3 lg:-left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-surface-container-lowest/90 backdrop-blur-md shadow-xl flex-col items-center justify-center text-primary hover:bg-primary hover:text-on-primary hover:scale-105 active:scale-95 transition-all cursor-pointer border border-surface-variant/40"
              >
                <span className="material-symbols-outlined text-xl sm:text-2xl group-hover:-translate-x-0.5 transition-transform">
                  arrow_back_ios_new
                </span>
                <span className="text-[8px] sm:text-[9px] font-label-archival text-outline group-hover:text-primary-fixed uppercase tracking-wider hidden sm:block font-bold">
                  Prev
                </span>
              </button>

              {/* The Book Spread Container */}
              <div 
                id="bookSpread"
                className={`w-full relative rounded-xl shadow-[0_20px_60px_-15px_rgba(23,63,55,0.22),0_8px_24px_-6px_rgba(0,0,0,0.12)] ${themeStyle.bg} ${themeStyle.text} transition-all duration-300 overflow-hidden flex flex-col md:flex-row min-h-[500px] md:min-h-[700px] border ${themeStyle.cardBorder}`}
              >
                <div className="absolute -bottom-2.5 left-4 right-4 h-2.5 bg-surface-dim rounded-b-lg -z-10 shadow-inner opacity-90 hidden sm:block" />
                <div className="absolute -bottom-1.5 left-2 right-2 h-1.5 bg-[#EEE7DA] rounded-b-lg -z-10 shadow-inner hidden sm:block" />

                {/* LEFT PAGE */}
                <article 
                  className={`flex-1 px-5 sm:px-10 md:px-14 lg:px-16 py-8 sm:py-12 md:py-16 flex flex-col justify-between relative ${themeStyle.leftGrad} ${
                    mobilePageSide === 'left' ? 'flex' : 'hidden md:flex'
                  }`}
                >
                  <div className="flex items-center justify-between pb-4 sm:pb-6 opacity-60">
                    <span className="font-label-archival text-[10px] sm:text-label-archival uppercase tracking-widest font-bold">
                      {book.author}
                    </span>
                    <span className="font-label-md text-xs sm:text-label-md font-semibold">{spread.leftPage}</span>
                  </div>

                  <div 
                    style={{
                      fontFamily: getFontFamilyStyle(),
                      fontSize: getFontSizeValue(),
                      lineHeight: getLineHeightValue()
                    }}
                    className="space-y-4 sm:space-y-5 text-justify transition-all duration-200"
                  >
                    <p style={{ lineHeight: getLineHeightValue() }}>
                      <span className={`float-left text-4xl sm:text-5xl md:text-6xl font-bold leading-none pr-2.5 sm:pr-3 pt-0.5 sm:pt-1 drop-cap ${themeStyle.dropCapColor}`}>
                        {spread.leftDropCap}
                      </span>
                      {spread.leftFirstParagraph}
                    </p>
                    {spread.leftParagraphs.map((p, idx) => (
                      <p key={idx} style={{ lineHeight: getLineHeightValue() }}>{p}</p>
                    ))}
                  </div>

                  <div className="pt-6 sm:pt-8 flex items-center justify-between opacity-40">
                    <span className="font-label-archival text-[9px] sm:text-[10px] tracking-widest uppercase font-bold">
                      {book.title} • Part I
                    </span>
                    <span className="font-label-archival text-[9px] sm:text-[10px] uppercase font-bold">Folio Ex-Libris</span>
                  </div>
                </article>

                {/* Gutter / Center Spine Crease */}
                <div className="hidden md:block w-px relative bg-gradient-to-b from-transparent via-black/15 to-transparent">
                  <div className="absolute top-0 bottom-0 -left-3 w-6 bg-gradient-to-r from-transparent via-black/5 to-transparent pointer-events-none" />
                </div>

                {/* RIGHT PAGE */}
                <article 
                  className={`flex-1 px-5 sm:px-10 md:px-14 lg:px-16 py-8 sm:py-12 md:py-16 flex flex-col justify-between relative ${themeStyle.rightGrad} ${
                    mobilePageSide === 'right' ? 'flex' : 'hidden md:flex'
                  }`}
                >
                  <div 
                    onClick={() => {
                      setIsDogEared(prev => !prev);
                      showToast(!isDogEared ? "Page dog-eared corner preserved." : "Dog-ear removed.");
                    }}
                    className="absolute top-0 right-0 w-9 h-9 cursor-pointer group z-10"
                    title="Fold / Unfold page corner"
                  >
                    <div className={`w-0 h-0 border-t-[36px] border-l-[36px] border-l-transparent transition-all ${
                      isDogEared 
                        ? 'border-t-secondary' 
                        : 'border-t-secondary/30 group-hover:border-t-secondary'
                    }`} />
                    <span className="material-symbols-outlined text-[12px] text-surface absolute top-1 right-1 opacity-80 pointer-events-none">
                      bookmark
                    </span>
                  </div>

                  <div className="flex items-center justify-between pb-4 sm:pb-6 opacity-60">
                    <span className="font-label-archival text-[10px] sm:text-label-archival uppercase tracking-widest font-bold truncate max-w-[200px]">
                      {spread.chapterNum}. {spread.chapterTitle.replace(/Chapter\s+[IVXLCDM]+:\s*/, '')}
                    </span>
                    <span className="font-label-md text-xs sm:text-label-md font-semibold">{spread.rightPage}</span>
                  </div>

                  <div 
                    style={{
                      fontFamily: getFontFamilyStyle(),
                      fontSize: getFontSizeValue(),
                      lineHeight: getLineHeightValue()
                    }}
                    className="space-y-4 sm:space-y-5 text-justify transition-all duration-200"
                  >
                    {spread.rightParagraphs.map((p, idx) => (
                      <p key={idx} style={{ lineHeight: getLineHeightValue() }}>{p}</p>
                    ))}
                  </div>

                  <div className="pt-6 sm:pt-8 flex items-center justify-between opacity-50">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                      <span className="font-label-archival text-[9px] sm:text-[10px] uppercase tracking-wider font-bold">
                        Edición Archival Colección
                      </span>
                    </div>
                    <span className="font-label-archival text-[9px] sm:text-[10px] tracking-widest uppercase font-bold">
                      Libro I • 1945
                    </span>
                  </div>
                </article>
              </div>

              {/* Right Page Flip Hotzone & Floating Button (Desktop) */}
              <button 
                type="button"
                aria-label="Next Page"
                onClick={handleNextAction}
                className="hidden sm:flex group absolute -right-3 lg:-right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-surface-container-lowest/90 backdrop-blur-md shadow-xl flex-col items-center justify-center text-primary hover:bg-primary hover:text-on-primary hover:scale-105 active:scale-95 transition-all cursor-pointer border border-surface-variant/40"
              >
                <span className="material-symbols-outlined text-xl sm:text-2xl group-hover:translate-x-0.5 transition-transform">
                  arrow_forward_ios
                </span>
                <span className="text-[8px] sm:text-[9px] font-label-archival text-outline group-hover:text-primary-fixed uppercase tracking-wider hidden sm:block font-bold">
                  Next
                </span>
              </button>
            </div>
          </>
        )}

        {/* Reading Progress Track Section */}
        <div 
          style={{ maxWidth: getSpreadMaxWidth() }}
          className={`w-full mt-4 sm:mt-8 bg-surface-container-lowest/90 backdrop-blur-sm rounded-xl p-3 sm:p-5 shadow-xs border ${themeStyle.cardBorder} transition-all duration-300`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="font-label-md text-xs sm:text-label-md text-primary font-bold">
                {hasPdf ? `Page ${pdfCurrentPage} of ${pdfTotalPages}` : spread.chapterTitle.split(':')[0]}
              </span>
              <span className="text-xs text-outline">•</span>
              <span className="font-body-sm text-xs sm:text-body-sm text-on-surface-variant">
                {hasPdf ? `Canonical Archival Folio` : `Pages ${spread.leftPage}–${spread.rightPage} of ${book.pages}`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-label-archival text-[10px] sm:text-label-archival text-secondary font-bold">
                {readPercent}% READ
              </span>
              <span className="text-xs text-outline hidden xs:inline">•</span>
              <span className="font-label-md text-xs sm:text-label-md text-on-surface-variant hidden xs:inline">
                ~{Math.max(1, Math.round(((displayTotal - displayPage) * 1.5)))} mins remaining
              </span>
            </div>
          </div>

          {/* Scrubbable Progress Bar with Chapter Milestone Dots */}
          <div 
            id="scrubRail"
            onClick={handleScrubTimeline}
            className="relative w-full h-2.5 sm:h-3 bg-surface-container-high rounded-full overflow-hidden cursor-pointer"
            title="Click to navigate through timeline"
          >
            <div 
              className="absolute left-0 top-0 bottom-0 bg-primary rounded-full transition-all duration-200"
              style={{ width: `${readPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Reading Navigation Tray */}
      <footer className={`w-full shadow-[0_-2px_12px_rgba(23,63,55,0.06)] py-3 px-3 sm:px-6 lg:px-12 z-20 border-t mt-auto ${themeStyle.headerBg}`}>
        <div className="max-w-[1360px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
          
          {/* Prev & Next Jump Buttons (Touch-friendly 44px targets) */}
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <button 
              type="button"
              onClick={handlePrevAction}
              className="flex-1 sm:flex-initial px-3 sm:px-4 py-2.5 rounded-lg bg-surface-container/60 hover:bg-surface-container text-on-surface active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px] font-label-lg text-xs sm:text-sm font-semibold"
            >
              <span className="material-symbols-outlined text-base">chevron_left</span>
              <span>{hasPdf ? 'Previous Page' : window.innerWidth < 768 ? 'Prev Page' : 'Previous Spread'}</span>
            </button>
            <button 
              type="button"
              onClick={handleNextAction}
              className="flex-1 sm:flex-initial px-3 sm:px-4 py-2.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer font-semibold shadow-xs min-h-[44px] font-label-lg text-xs sm:text-sm"
            >
              <span>{hasPdf ? 'Next Page' : window.innerWidth < 768 ? 'Next Page' : 'Next Spread'}</span>
              <span className="material-symbols-outlined text-base">chevron_right</span>
            </button>
          </div>

          {/* Chapter Jump Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-center">
            <span className="material-symbols-outlined text-outline text-lg hidden sm:inline">menu_book</span>
            <label className="font-label-md text-label-md text-on-surface-variant sr-only" htmlFor="chapterSelect">
              Select Chapter
            </label>
            <select 
              id="chapterSelect"
              value={hasPdf ? (pdfChapters.reduce((acc, c) => (pdfCurrentPage >= c.page ? c.page : acc), 1)) : currentSpreadIndex + 1}
              onChange={(e) => handleJumpChapter(e.target.value)}
              className="bg-surface-container/70 text-on-surface rounded-lg px-3 py-2 font-label-md text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-primary w-full sm:w-72 cursor-pointer min-h-[40px] border border-surface-variant/40"
            >
              {hasPdf ? (
                pdfChapters.map((chap) => (
                  <option key={chap.page} value={chap.page}>
                    {chap.title} (Page {chap.page})
                  </option>
                ))
              ) : (
                <>
                  <option value="1">Chapter I: The Boy Who Walked in Fog</option>
                  <option value="2">Chapter II: Calle del Arco del Teatro</option>
                  <option value="3">Chapter III: The Key to the Vaults</option>
                  <option value="4">Chapter IV: The Cemetery of Forgotten Books</option>
                  <option value="5">Chapter V: The Stranger in the Rain</option>
                  <option value="6">Chapter VI: The Footsteps of Julián Carax</option>
                  <option value="7">Chapter VII: Clotilde and the Shadows</option>
                  <option value="8">Chapter VIII: The Burnt Manuscript</option>
                  <option value="9">Chapter IX: Don Anacleto’s Warning</option>
                  <option value="10">Chapter X: The Clockwork Angel</option>
                </>
              )}
            </select>
          </div>

          {/* Page Number Quick Indicator / Jump Input */}
          <div className="flex items-center gap-2 bg-surface-container/60 px-3 py-1.5 rounded-full border border-surface-variant/40 w-full sm:w-auto justify-between sm:justify-start">
            <span className="font-label-archival text-[11px] text-primary font-bold uppercase tracking-wider">
              {hasPdf ? `Folio ${pdfCurrentPage} of ${pdfTotalPages}` : `Folio ${spread.leftPage}–${spread.rightPage}`}
            </span>
          </div>
        </div>
      </footer>

      {/* Appearance Customizer Drawer Component */}
      <AppearanceDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />
    </div>
  );
}
