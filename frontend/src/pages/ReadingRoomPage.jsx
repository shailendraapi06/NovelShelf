import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { BOOKS, READER_SPREADS } from '../data/booksData';
import AppearanceDrawer from '../components/reader/AppearanceDrawer';

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
    updateReaderSettings 
  } = useLibrary();

  const book = BOOKS.find(b => b.id === bookId) || BOOKS[0];
  const bookmarked = isBookmarked(book.id);

  const [currentSpreadIndex, setCurrentSpreadIndex] = useState(0);
  const [mobilePageSide, setMobilePageSide] = useState('left'); // 'left' | 'right' for mobile single-page view
  const [isDogEared, setIsDogEared] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

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
        if (res && res.progress && res.progress.spreadIndex !== undefined) {
          if (res.progress.spreadIndex < READER_SPREADS.length) {
            setCurrentSpreadIndex(res.progress.spreadIndex);
          }
        }
      }).catch(() => {});
    }
  }, [isAuthenticated, book.id]);

  const spread = READER_SPREADS[currentSpreadIndex] || READER_SPREADS[0];

  // Sync progress on page change
  const syncProgressToBackend = (newIndex) => {
    if (isAuthenticated && book.id) {
      const sp = READER_SPREADS[newIndex] || READER_SPREADS[0];
      api.saveReadingProgress(book.id, {
        currentPage: sp.leftPage,
        totalPages: book.pages || 500,
        chapter: sp.leftChapter || 'Chapter I',
        spreadIndex: newIndex
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
  }, [book.id, currentSpreadIndex, mobilePageSide]);

  // Turn page action adapted for both desktop spreads and mobile single page
  const handlePrevAction = () => {
    if (window.innerWidth < 768 && mobilePageSide === 'right') {
      setMobilePageSide('left');
      showToast(`Turned back to Page ${spread.leftPage}.`);
      return;
    }

    if (currentSpreadIndex > 0) {
      const nextIndex = currentSpreadIndex - 1;
      setCurrentSpreadIndex(nextIndex);
      syncProgressToBackend(nextIndex);
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
    if (window.innerWidth < 768 && mobilePageSide === 'left') {
      setMobilePageSide('right');
      showToast(`Turned to Page ${spread.rightPage}.`);
      return;
    }

    if (currentSpreadIndex < READER_SPREADS.length - 1) {
      const nextIndex = currentSpreadIndex + 1;
      setCurrentSpreadIndex(nextIndex);
      setMobilePageSide('left');
      syncProgressToBackend(nextIndex);
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

  const handleToggleSound = () => {
    const nextSound = !readerSettings.ambientSound;
    updateReaderSettings({ ambientSound: nextSound });
    if (nextSound) {
      showToast(`Ambient Library Audio Resumed (${readerSettings.ambientVolume}%).`);
    } else {
      showToast("Ambient Audio Muted.");
    }
  };

  const handleScrubTimeline = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = Math.round((clickX / rect.width) * 100);
    const targetPage = Math.round((percent / 100) * book.pages);
    showToast(`Navigated timeline to page ${targetPage} of ${book.pages} (${percent}%).`);
  };

  const handleJumpChapter = (val) => {
    showToast(`Jumped to Chapter ${val}`);
  };

  // 1. Theme configuration
  const getThemeClasses = () => {
    switch (readerSettings.theme) {
      case 'sepia':
        return {
          bg: 'bg-[#F4ECD8]',
          text: 'text-[#4A3B22]',
          leftGrad: 'bg-gradient-to-r from-[#F4ECD8] via-[#F4ECD8] to-[#E5D7BA]',
          rightGrad: 'bg-gradient-to-r from-[#E5D7BA] via-[#F4ECD8] to-[#F4ECD8]',
          sanctuaryBg: 'bg-[#e7d8be]',
          headerBg: 'bg-[#edd9ba]/95 text-[#4a3b22] border-[#d8c4a4]',
          dropCapColor: 'text-secondary',
          cardBorder: 'border-[#d8c4a4]'
        };
      case 'forest':
        return {
          bg: 'bg-[#173F35]',
          text: 'text-[#F7FAF4]',
          leftGrad: 'bg-gradient-to-r from-[#173F35] via-[#173F35] to-[#102d26]',
          rightGrad: 'bg-gradient-to-r from-[#102d26] via-[#173F35] to-[#173F35]',
          sanctuaryBg: 'bg-[#091512]',
          headerBg: 'bg-[#0e251f]/95 text-[#f7faf4] border-[#1d463b]',
          dropCapColor: 'text-[#fcd89c]', // Gold drop cap for dark midnight forest theme
          cardBorder: 'border-[#234e42]'
        };
      case 'parchment':
      default:
        return {
          bg: 'bg-[#F8F5EF]',
          text: 'text-[#202622]',
          leftGrad: 'bg-gradient-to-r from-[#F8F5EF] via-[#F8F5EF] to-[#EDE6D8]',
          rightGrad: 'bg-gradient-to-r from-[#EDE6D8] via-[#F8F5EF] to-[#F8F5EF]',
          sanctuaryBg: 'bg-gradient-to-b from-surface-container-high via-surface to-surface-container-low',
          headerBg: 'bg-surface-container-lowest/95 text-on-surface border-surface-variant/40',
          dropCapColor: 'text-primary',
          cardBorder: 'border-surface-variant/40'
        };
    }
  };

  const themeStyle = getThemeClasses();

  // 2. Font family helper
  const getFontFamilyStyle = () => {
    const f = readerSettings.fontClass?.toLowerCase() || '';
    if (f.includes('garamond')) {
      return "'EB Garamond', Garamond, Georgia, serif";
    }
    if (f.includes('modern') || f.includes('label')) {
      return "'Manrope', -apple-system, BlinkMacSystemFont, sans-serif";
    }
    return "'Playfair Display', Georgia, serif";
  };

  // 3. Font size helper (explicit inline values to ensure 100% responsiveness)
  const getFontSizeValue = () => {
    switch (readerSettings.fontSize) {
      case 'sm': return '14px';
      case 'lg': return '19px';
      case 'xl': return '23px';
      case 'md':
      default: return '16px';
    }
  };

  // 4. Line height helper (explicit numerical values)
  const getLineHeightValue = () => {
    const l = readerSettings.leading || '';
    if (l === 'compact' || l.includes('snug')) return 1.45;
    if (l === 'loose' || l.includes('loose')) return 2.25;
    return 1.85; // Standard relaxed
  };

  // 5. Desktop spread width helper
  const getSpreadMaxWidth = () => {
    const w = readerSettings.spreadWidth || '';
    if (w === 'narrow' || w.includes('960')) return '960px';
    if (w === 'expansive' || w.includes('1320') || w.includes('1360')) return '1360px';
    return '1180px'; // Standard
  };

  const activeMobilePageNumber = mobilePageSide === 'left' ? spread.leftPage : spread.rightPage;

  return (
    <div className={`flex flex-col w-full min-h-screen relative select-none transition-colors duration-500 ${themeStyle.sanctuaryBg} overflow-x-hidden`}>
      
      {/* Minimalist Top Reading Toolbar */}
      <header className={`w-full backdrop-blur-md shadow-xs z-30 transition-all duration-300 border-b sticky top-0 ${themeStyle.headerBg}`}>
        <div className="max-w-[1360px] mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Left: Back Navigation */}
          <Link 
            to={`/books/${book.id}`}
            className="inline-flex items-center gap-1.5 hover:opacity-80 transition-opacity group shrink-0 min-h-[40px]"
            title="Return to Book Details"
          >
            <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">
              arrow_back
            </span>
            <span className="font-label-lg text-xs sm:text-label-lg hidden xs:inline">Details</span>
          </Link>

          {/* Center: Volume & Progress Context */}
          <div className="flex flex-col items-center text-center min-w-0 px-1">
            <div className="flex items-center gap-1.5 max-w-full truncate">
              <span className="font-headline-sm text-xs sm:text-headline-sm font-serif font-bold truncate">
                {book.title}
              </span>
              <span className="text-outline text-xs hidden sm:inline">•</span>
              <span className="font-label-md text-xs text-secondary font-semibold hidden sm:inline truncate">
                {book.author}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-label-archival text-[9px] sm:text-label-archival uppercase tracking-wider font-bold truncate opacity-75">
                {spread.chapterTitle.split(':')[0]}
              </span>
              <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-surface-container/60 text-[10px] sm:text-[11px] font-label-md">
                p. {window.innerWidth < 768 ? activeMobilePageNumber : `${spread.leftPage}-${spread.rightPage}`} / {book.pages}
              </span>
            </div>
          </div>

          {/* Right: Action Controls */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Bookmark Button */}
            <button 
              type="button"
              onClick={() => toggleBookmark(book.id)}
              className={`p-2 sm:px-3 sm:py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer min-h-[38px] ${
                bookmarked
                  ? 'bg-secondary text-on-secondary shadow-xs font-semibold'
                  : 'bg-surface-container/60 hover:bg-surface-container text-on-surface-variant hover:text-primary'
              }`}
              title={`Bookmark Page ${spread.leftPage}`}
              aria-label="Bookmark this volume"
            >
              <span className={`material-symbols-outlined text-base ${bookmarked ? 'fill-1' : ''}`}>
                {bookmarked ? 'bookmark_added' : 'bookmark'}
              </span>
              <span className="hidden md:inline font-label-md text-xs sm:text-label-md">
                {bookmarked ? 'Saved' : 'Bookmark'}
              </span>
            </button>

            {/* Ambient Sound Toggle Trigger */}
            <button 
              type="button"
              onClick={handleToggleSound}
              className={`p-2 rounded-lg transition-all flex items-center cursor-pointer min-h-[38px] min-w-[38px] justify-center ${
                readerSettings.ambientSound
                  ? 'bg-secondary-container text-on-secondary-container'
                  : 'bg-surface-container/60 hover:bg-surface-container text-on-surface-variant hover:text-secondary'
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
              title="Customise Typography & Display"
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
            {/* Authentic Book Base Stack Depth */}
            <div className="absolute -bottom-2.5 left-4 right-4 h-2.5 bg-surface-dim rounded-b-lg -z-10 shadow-inner opacity-90 hidden sm:block" />
            <div className="absolute -bottom-1.5 left-2 right-2 h-1.5 bg-[#EEE7DA] rounded-b-lg -z-10 shadow-inner hidden sm:block" />

            {/* 
              LEFT PAGE:
              Visible on desktop (>=768px), OR on mobile if mobilePageSide === 'left'
            */}
            <article 
              className={`flex-1 px-5 sm:px-10 md:px-14 lg:px-16 py-8 sm:py-12 md:py-16 flex flex-col justify-between relative ${themeStyle.leftGrad} ${
                mobilePageSide === 'left' ? 'flex' : 'hidden md:flex'
              }`}
            >
              {/* Left Header */}
              <div className="flex items-center justify-between pb-4 sm:pb-6 opacity-60">
                <span className="font-label-archival text-[10px] sm:text-label-archival uppercase tracking-widest font-bold">
                  {book.author}
                </span>
                <span className="font-label-md text-xs sm:text-label-md font-semibold">{spread.leftPage}</span>
              </div>

              {/* Left Body Content with Drop Cap */}
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

              {/* Left Footer Marginalia */}
              <div className="pt-6 sm:pt-8 flex items-center justify-between opacity-40">
                <span className="font-label-archival text-[9px] sm:text-[10px] tracking-widest uppercase font-bold">
                  {book.title} • Part I
                </span>
                <div className="w-8 h-px bg-current opacity-40" />
              </div>
            </article>

            {/* CENTER BINDING GUTTER / SHADOW CREASE (Visible on desktop) */}
            <div className="hidden md:block w-10 relative shrink-0 -my-4 z-10 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-r from-black/15 via-black/25 to-black/15 shadow-inner" />
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-black/30 -translate-x-1/2" />
              {/* Silk Ribbon Bookmark */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-20 bg-secondary/80 rounded-b shadow-xs" />
            </div>

            {/* 
              RIGHT PAGE:
              Visible on desktop (>=768px), OR on mobile if mobilePageSide === 'right'
            */}
            <article 
              className={`flex-1 px-5 sm:px-10 md:px-14 lg:px-16 py-8 sm:py-12 md:py-16 flex flex-col justify-between relative ${themeStyle.rightGrad} ${
                mobilePageSide === 'right' ? 'flex' : 'hidden md:flex'
              }`}
            >
              {/* Dog-ear Ribbon / Interactive Corner */}
              <div 
                onClick={() => {
                  setIsDogEared(prev => !prev);
                  showToast(isDogEared ? "Fold smoothed on page." : "Archival dog-ear corner fold placed on page.");
                }}
                className="group absolute top-0 right-0 w-12 h-12 cursor-pointer z-10" 
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

              {/* Right Header */}
              <div className="flex items-center justify-between pb-4 sm:pb-6 opacity-60">
                <span className="font-label-archival text-[10px] sm:text-label-archival uppercase tracking-widest font-bold truncate max-w-[200px]">
                  {spread.chapterNum}. {spread.chapterTitle.replace(/Chapter\s+[IVXLCDM]+:\s*/, '')}
                </span>
                <span className="font-label-md text-xs sm:text-label-md font-semibold">{spread.rightPage}</span>
              </div>

              {/* Right Body Continuation */}
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

              {/* Right Footer Marginalia / Footnote */}
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

        {/* Reading Progress Track Section */}
        <div 
          style={{ maxWidth: getSpreadMaxWidth() }}
          className={`w-full mt-4 sm:mt-8 bg-surface-container-lowest/90 backdrop-blur-sm rounded-xl p-3 sm:p-5 shadow-xs border ${themeStyle.cardBorder} transition-all duration-300`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="font-label-md text-xs sm:text-label-md text-primary font-bold">
                {spread.chapterTitle.split(':')[0]}
              </span>
              <span className="text-xs text-outline">•</span>
              <span className="font-body-sm text-xs sm:text-body-sm text-on-surface-variant">
                Pages {spread.leftPage}–{spread.rightPage} of {book.pages}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-label-archival text-[10px] sm:text-label-archival text-secondary font-bold">
                {Math.round((spread.rightPage / book.pages) * 100)}% READ
              </span>
              <span className="text-xs text-outline hidden xs:inline">•</span>
              <span className="font-label-md text-xs sm:text-label-md text-on-surface-variant hidden xs:inline">
                ~18 mins remaining
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
              style={{ width: `${Math.round((spread.rightPage / book.pages) * 100)}%` }}
            />
            {/* Chapter Milestone Ticks */}
            <div className="absolute top-0 bottom-0 left-[4%] w-0.5 bg-surface-container-lowest opacity-80" title="Ch. 2" />
            <div className="absolute top-0 bottom-0 left-[8%] w-1 bg-secondary rounded-full" title="Ch. 4 (Current)" />
            <div className="absolute top-0 bottom-0 left-[15%] w-0.5 bg-surface-container-lowest opacity-80" title="Ch. 6" />
            <div className="absolute top-0 bottom-0 left-[26%] w-0.5 bg-surface-container-lowest opacity-80" title="Ch. 10" />
            <div className="absolute top-0 bottom-0 left-[50%] w-0.5 bg-surface-container-lowest opacity-80" title="Ch. 14" />
            <div className="absolute top-0 bottom-0 left-[75%] w-0.5 bg-surface-container-lowest opacity-80" title="Ch. 20" />
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
              <span>{window.innerWidth < 768 ? 'Prev Page' : 'Previous Spread'}</span>
            </button>
            <button 
              type="button"
              onClick={handleNextAction}
              className="flex-1 sm:flex-initial px-3 sm:px-4 py-2.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer font-semibold shadow-xs min-h-[44px] font-label-lg text-xs sm:text-sm"
            >
              <span>{window.innerWidth < 768 ? 'Next Page' : 'Next Spread'}</span>
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
              defaultValue="4"
              onChange={(e) => handleJumpChapter(e.target.value)}
              className="bg-surface-container/70 text-on-surface rounded-lg px-3 py-2 font-label-md text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-primary w-full sm:w-72 cursor-pointer min-h-[40px] border border-surface-variant/40"
            >
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
            </select>
          </div>

          {/* Ambient Library Sound Controller Bar */}
          <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3 bg-surface-container/60 px-3 py-1.5 rounded-full border border-surface-variant/40 w-full sm:w-auto">
            <button 
              type="button"
              onClick={handleToggleSound}
              className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer shrink-0"
              title="Toggle Ambient Audio"
            >
              <span className="material-symbols-outlined text-base">
                {readerSettings.ambientSound ? 'volume_up' : 'volume_off'}
              </span>
            </button>
            <div className="flex flex-col min-w-0">
              <span className="font-label-archival text-[9px] text-on-surface-variant uppercase tracking-wider font-bold">
                Atmosphere
              </span>
              <span className="font-label-md text-xs font-medium truncate">
                {readerSettings.ambientSound ? 'Rain & Fireplace' : 'Muted'}
              </span>
            </div>
            <input 
              type="range"
              min="0"
              max="100"
              value={readerSettings.ambientSound ? readerSettings.ambientVolume : 0}
              onChange={(e) => updateReaderSettings({ ambientVolume: Number(e.target.value), ambientSound: Number(e.target.value) > 0 })}
              className="w-16 sm:w-24 accent-primary h-1.5 bg-surface-container-highest rounded-lg cursor-pointer"
              title="Adjust Ambient Sound Volume"
            />
            <span className="font-label-archival text-[10px] text-outline font-semibold shrink-0">
              {readerSettings.ambientSound ? `${readerSettings.ambientVolume}%` : '0%'}
            </span>
          </div>

        </div>
      </footer>

      {/* Keyboard Shortcuts Hint Bar (Desktop only) */}
      <div className="w-full text-center py-2 text-outline text-[11px] hidden lg:flex items-center justify-center gap-6 font-label-archival uppercase tracking-wider bg-surface/80 border-t border-surface-variant/30">
        <span>Tip: Press <kbd className="px-1.5 py-0.5 bg-surface-container-high rounded text-on-surface font-mono">←</kbd> and <kbd className="px-1.5 py-0.5 bg-surface-container-high rounded text-on-surface font-mono">→</kbd> to turn pages</span>
        <span>•</span>
        <span>Press <kbd className="px-1.5 py-0.5 bg-surface-container-high rounded text-on-surface font-mono">B</kbd> to Bookmark</span>
        <span>•</span>
        <span>Press <kbd className="px-1.5 py-0.5 bg-surface-container-high rounded text-on-surface font-mono">F</kbd> for Fullscreen</span>
      </div>

      {/* Appearance Settings Drawer Modal */}
      <AppearanceDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />
    </div>
  );
}
