import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext';
import { BOOKS, COMMUNITY_REVIEWS } from '../data/booksData';

export default function BookDetailsPage() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { isBookmarked, toggleBookmark, showToast, books } = useLibrary();

  const libraryBooks = books && books.length > 0 ? books : BOOKS;
  // Find target book or default to shadow-of-the-wind
  const book = libraryBooks.find(b => b.id === bookId || b.slug === bookId) || libraryBooks[0];
  const bookmarked = isBookmarked(book.id);

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [reviewFilter, setReviewFilter] = useState('thoughtful'); // thoughtful | recent
  const [showReflectionInput, setShowReflectionInput] = useState(false);
  const [newReflection, setNewReflection] = useState('');

  // Related books
  const relatedBooks = BOOKS.filter(b => b.id !== book.id).slice(0, 4);

  const handleAudioExcerpt = () => {
    setIsPlayingAudio(true);
    showToast("Playing archival spoken recording: 'Every volume, every book you see here has a soul...'");
    setTimeout(() => {
      setIsPlayingAudio(false);
    }, 4500);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast("Archival volume link copied to clipboard!", "success");
    } else {
      showToast("Link shared: " + window.location.href);
    }
  };

  const handleAddReflection = (e) => {
    e.preventDefault();
    if (newReflection.trim()) {
      showToast("Your literary reflection has been cataloged for community review!", "success");
      setNewReflection('');
      setShowReflectionInput(false);
    }
  };

  return (
    <div className="flex flex-col w-full">
      <div className="w-full max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-8 flex flex-col gap-8 sm:gap-12">
        
        {/* Breadcrumb & Archival Registry Tag */}
        <section className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
          <nav className="flex items-center gap-2 font-label-md text-xs sm:text-label-md text-on-surface-variant flex-wrap">
            <Link to="/explore" className="hover:text-primary transition-colors">Catalog</Link>
            <span className="text-outline text-xs">/</span>
            <Link to={`/explore?genre=${encodeURIComponent(book.genre)}`} className="hover:text-primary transition-colors">
              {book.genre}
            </Link>
            <span className="text-outline text-xs">/</span>
            <span className="text-primary font-semibold truncate max-w-xs">{book.title}</span>
          </nav>
          <div className="flex items-center gap-2 px-3 py-1 bg-surface-container rounded-full font-label-archival text-[11px] sm:text-xs text-secondary uppercase tracking-widest font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            {book.provenanceTag || "Curator Archive Vol. #1084-BCN"}
          </div>
        </section>

        {/* Masterpiece Showcase Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          
          {/* Left Column: Book Physicality & Reading Action Core */}
          <div className="lg:col-span-5 flex flex-col gap-6 sm:gap-8 w-full max-w-md mx-auto lg:max-w-none">
            <div className="relative group">
              {/* Ambient Glow Backdrop */}
              <div className="absolute -inset-4 bg-gradient-to-br from-primary-container/10 via-secondary-container/20 to-transparent rounded-2xl blur-2xl -z-10" />

              {/* Book Container with Perspective Tilt */}
              <div className="relative bg-surface-container-high rounded-xl p-6 sm:p-8 flex items-center justify-center overflow-hidden shadow-xl min-h-[380px] sm:min-h-[480px] border border-surface-variant/40">
                {/* Archival Ribbon Accents */}
                <div className="absolute top-3 sm:top-4 left-3 sm:left-4 z-20 flex items-center gap-1.5 px-2.5 sm:px-3 py-1 bg-primary text-on-primary rounded font-label-archival text-[10px] sm:text-xs tracking-wider uppercase shadow-md font-bold">
                  <span className="material-symbols-outlined text-xs">menu_book</span>
                  <span>Digital Reading Room</span>
                </div>
                <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-20 flex items-center gap-1 px-2.5 py-1 bg-secondary-container text-on-secondary-container rounded font-label-archival text-[10px] sm:text-xs font-bold">
                  <span className="material-symbols-outlined text-xs">verified</span>
                  <span>Canonical</span>
                </div>

                {/* Hardcover Book Render Card */}
                <div className="relative w-52 sm:w-64 h-72 sm:h-96 transition-transform duration-500 ease-out transform group-hover:scale-[1.02] group-hover:-rotate-1">
                  {/* Book Thickness / Depth Shadow Spine */}
                  <div className="absolute left-0 top-0 bottom-0 w-4 sm:w-5 bg-gradient-to-r from-primary to-primary-container rounded-l-sm shadow-2xl z-10" />
                  
                  {/* Cover Surface */}
                  <div className="w-full h-full relative rounded-r rounded-l-sm overflow-hidden shadow-2xl bg-primary-container flex flex-col justify-between p-4 sm:p-6">
                    {/* Cover Photographic Layer */}
                    <img 
                      src={book.coverImage} 
                      alt={book.title}
                      className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60" 
                    />
                    
                    <div className="relative z-10 flex flex-col gap-1 sm:gap-2">
                      <span className="font-label-archival text-[9px] sm:text-xs tracking-widest text-secondary-fixed uppercase font-bold">
                        {book.subtitle ? book.subtitle.split(',')[0] : 'Curated Volume'}
                      </span>
                      <div className="w-8 h-px bg-secondary-fixed/40 my-1" />
                      <h3 className="font-headline-md text-lg sm:text-headline-md text-surface text-shadow font-serif tracking-tight leading-snug">
                        {book.title}
                      </h3>
                    </div>

                    <div className="relative z-10 flex flex-col">
                      <span className="font-label-md text-xs sm:text-label-md text-secondary-fixed-dim tracking-wide uppercase font-semibold">
                        {book.author}
                      </span>
                      <span className="font-label-archival text-[10px] sm:text-xs text-surface/70 mt-0.5 sm:mt-1">
                        First Edition Masterwork
                      </span>
                    </div>

                    {/* Foil Ornament Inlay */}
                    <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 text-secondary-fixed/40 pointer-events-none">
                      <span className="material-symbols-outlined text-3xl sm:text-4xl">auto_stories</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Metric Reading Capsule */}
            <div className="grid grid-cols-3 gap-2 bg-surface-container rounded-lg p-3 text-center border border-surface-variant/40">
              <div className="flex flex-col py-1">
                <span className="font-headline-sm text-lg sm:text-headline-sm text-primary font-semibold font-serif">
                  {book.pages}
                </span>
                <span className="font-label-archival text-[10px] sm:text-xs text-on-surface-variant uppercase tracking-wider font-bold">
                  Pages
                </span>
              </div>
              <div className="flex flex-col py-1 bg-surface-container-high rounded">
                <span className="font-headline-sm text-lg sm:text-headline-sm text-primary font-semibold font-serif">
                  {(book.pages / 54).toFixed(1)} h
                </span>
                <span className="font-label-archival text-[10px] sm:text-xs text-on-surface-variant uppercase tracking-wider font-bold">
                  Est. Duration
                </span>
              </div>
              <div className="flex flex-col py-1">
                <span className="font-headline-sm text-lg sm:text-headline-sm text-secondary font-semibold font-serif">
                  98%
                </span>
                <span className="font-label-archival text-[10px] sm:text-xs text-on-surface-variant uppercase tracking-wider font-bold">
                  Completion
                </span>
              </div>
            </div>

            {/* Action Control Core */}
            <div className="flex flex-col gap-3">
              <Link 
                to={`/reader/${book.id}`}
                className="w-full py-3.5 px-6 bg-primary text-on-primary hover:bg-primary-container font-label-lg text-sm sm:text-label-lg rounded-lg text-center shadow-md transition-all flex items-center justify-center gap-2 font-semibold min-h-[44px]"
              >
                <span className="material-symbols-outlined text-lg">local_library</span>
                <span>Start Reading in Sanctuary</span>
              </Link>

              <div className="grid grid-cols-3 gap-2">
                <button 
                  type="button"
                  onClick={() => toggleBookmark(book.id)}
                  className={`py-2.5 px-2 sm:px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors font-label-md text-xs sm:text-label-md font-semibold cursor-pointer min-h-[44px] ${
                    bookmarked 
                      ? 'bg-secondary text-surface' 
                      : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                  }`}
                >
                  <span className={`material-symbols-outlined text-base ${bookmarked ? 'fill-1' : 'text-secondary'}`}>
                    {bookmarked ? 'bookmark' : 'bookmark_add'}
                  </span>
                  <span>{bookmarked ? 'Saved' : 'Save'}</span>
                </button>
                <button 
                  type="button"
                  onClick={() => navigate('/my-library')}
                  className="py-2.5 px-2 sm:px-3 bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-xs sm:text-label-md rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[44px]"
                >
                  <span className="material-symbols-outlined text-base text-primary">shelves</span>
                  <span>Library</span>
                </button>
                <button 
                  type="button"
                  onClick={handleShare}
                  className="py-2.5 px-2 sm:px-3 bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-xs sm:text-label-md rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[44px]"
                >
                  <span className="material-symbols-outlined text-base">ios_share</span>
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Dossier & Literary Details */}
          <div className="lg:col-span-7 flex flex-col gap-6 w-full min-w-0">
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="font-label-lg text-xs sm:text-label-lg text-secondary font-semibold tracking-wide uppercase">
                  {book.author}
                </span>
                {book.translator && (
                  <>
                    <span className="text-outline text-xs">•</span>
                    <span className="font-body-sm text-xs sm:text-body-sm text-on-surface-variant">
                      Translated by {book.translator}
                    </span>
                  </>
                )}
              </div>
              <h1 className="font-display-hero text-2xl sm:text-4xl lg:text-display-hero text-primary tracking-tight leading-tight font-serif font-bold">
                {book.title}
              </h1>
              {book.subtitle && (
                <p className="font-headline-sm text-base sm:text-headline-sm text-on-surface-variant italic font-serif">
                  {book.subtitle}
                </p>
              )}
            </div>

            {/* Rating & Critique Aggregate Bar */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 py-2 border-y border-surface-variant/40">
              <div className="flex items-center gap-1 text-secondary">
                <span className="material-symbols-outlined text-lg sm:text-xl fill-1">star</span>
                <span className="material-symbols-outlined text-lg sm:text-xl fill-1">star</span>
                <span className="material-symbols-outlined text-lg sm:text-xl fill-1">star</span>
                <span className="material-symbols-outlined text-lg sm:text-xl fill-1">star</span>
                <span className="material-symbols-outlined text-lg sm:text-xl fill-1">star_half</span>
                <span className="font-label-lg text-sm sm:text-label-lg text-on-surface font-bold ml-1">
                  {book.rating}
                </span>
              </div>
              <span className="text-outline text-xs">•</span>
              <span className="font-body-sm text-xs sm:text-body-sm text-on-surface-variant">
                {book.reviewsCount.toLocaleString()} reviews
              </span>
              <span className="text-outline text-xs">•</span>
              <span className="font-body-sm text-xs sm:text-body-sm text-on-surface-variant">
                {book.readingLogs.toLocaleString()} reading logs
              </span>
            </div>

            {/* Archival Tags */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {book.tags?.map(t => (
                <span 
                  key={t}
                  className="px-2.5 sm:px-3 py-1 bg-surface-container rounded-full font-label-md text-xs sm:text-label-md text-on-surface font-medium border border-surface-variant/30"
                >
                  {t}
                </span>
              ))}
            </div>

            {/* Editorial Synopsis */}
            <div className="flex flex-col gap-3 sm:gap-4 text-on-surface-variant">
              <h2 className="font-title-editorial text-lg sm:text-title-editorial text-primary font-serif font-bold">
                Curatorial Synopsis
              </h2>
              <p className="font-body-lg text-sm sm:text-body-lg leading-relaxed">
                {book.synopsis}
              </p>
              <p className="font-body-md text-xs sm:text-body-md leading-relaxed">
                {book.synopsisExtended}
              </p>
            </div>

            {/* Interactive Excerpt Inscription Plate */}
            <div className="relative bg-surface-container rounded-xl p-5 sm:p-6 overflow-hidden shadow-xs border border-surface-variant/40">
              <div className="absolute -right-2 -bottom-2 text-primary/5 pointer-events-none select-none">
                <span className="material-symbols-outlined text-8xl sm:text-9xl">format_quote</span>
              </div>
              <div className="relative z-10 flex flex-col gap-3">
                <span className="font-label-archival text-xs text-secondary uppercase tracking-widest font-bold">
                  Inscribed Page 7
                </span>
                <blockquote className="font-headline-sm text-base sm:text-headline-sm text-primary font-serif italic leading-relaxed">
                  “{book.quote}”
                </blockquote>
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                  <span className="font-label-md text-xs sm:text-label-md text-on-surface-variant font-medium">
                    — {book.quoteAuthor || book.author}
                  </span>
                  <button 
                    type="button"
                    onClick={handleAudioExcerpt}
                    className="text-secondary hover:text-primary font-label-md text-xs sm:text-label-md flex items-center gap-1 transition-colors cursor-pointer font-semibold min-h-[36px]"
                  >
                    <span className="material-symbols-outlined text-base">
                      {isPlayingAudio ? 'volume_up' : 'play_circle'}
                    </span>
                    <span>{isPlayingAudio ? 'Listening...' : 'Listen to Excerpt'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Curatorial Footnote Stats */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-surface-container-high rounded-lg text-on-surface-variant font-body-sm text-xs sm:text-body-sm border border-surface-variant/40">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-primary">history_edu</span>
                <span>Archived in Catalog by Custodian Helena V.</span>
              </div>
              <span className="font-label-archival text-xs uppercase text-secondary font-bold">
                Original Folio: {book.year}
              </span>
            </div>
          </div>
        </section>

        {/* Digital Editions & Preservation Specifications */}
        <section className="flex flex-col gap-6 pt-6 border-t border-surface-variant/40">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-2xl">auto_stories</span>
                <h2 className="font-headline-md text-xl sm:text-headline-md text-primary font-serif font-bold">
                  Digital Reading Room Editions &amp; Features
                </h2>
              </div>
              <p className="font-body-sm text-xs sm:text-body-sm text-on-surface-variant mt-1">
                Optimized for prolonged deep reading with archival typography, ambient soundtracks, and responsive viewports.
              </p>
            </div>
            <Link 
              to={`/reader/${book.id}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary hover:bg-primary-container rounded-lg font-label-md text-xs sm:text-sm font-semibold transition-colors min-h-[40px]"
            >
              <span>Launch Reading Room</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-surface-container-low rounded-xl p-5 sm:p-6 border border-surface-variant/40 flex flex-col justify-between">
              <div>
                <span className="material-symbols-outlined text-primary text-2xl mb-2">auto_stories</span>
                <h3 className="font-title-editorial text-base text-primary font-bold">Two-Page &amp; Single-Page Flow</h3>
                <p className="font-body-sm text-xs sm:text-sm text-on-surface-variant mt-2 leading-relaxed">
                  Seamlessly toggles between panoramic two-page spreads on desktop and clean, comfortable single-page reading on mobile.
                </p>
              </div>
              <span className="mt-4 font-label-archival text-[10px] text-secondary uppercase font-bold">
                Responsive Engine Active
              </span>
            </div>

            <div className="bg-surface-container-low rounded-xl p-5 sm:p-6 border border-surface-variant/40 flex flex-col justify-between">
              <div>
                <span className="material-symbols-outlined text-secondary text-2xl mb-2">palette</span>
                <h3 className="font-title-editorial text-base text-primary font-bold">3 Calibrated Paper Palettes</h3>
                <p className="font-body-sm text-xs sm:text-sm text-on-surface-variant mt-2 leading-relaxed">
                  Parchment cream for daytime reading, warm sepia for evening immersion, and deep forest emerald for nocturnal study.
                </p>
              </div>
              <span className="mt-4 font-label-archival text-[10px] text-secondary uppercase font-bold">
                Parchment • Sepia • Forest
              </span>
            </div>

            <div className="bg-surface-container-low rounded-xl p-5 sm:p-6 border border-surface-variant/40 flex flex-col justify-between">
              <div>
                <span className="material-symbols-outlined text-outline text-2xl mb-2">graphic_eq</span>
                <h3 className="font-title-editorial text-base text-primary font-bold">Atmospheric Soundscapes</h3>
                <p className="font-body-sm text-xs sm:text-sm text-on-surface-variant mt-2 leading-relaxed">
                  Optional ambient acoustics including gentle rain on library glass and crackling oak hearth to enhance reading flow.
                </p>
              </div>
              <span className="mt-4 font-label-archival text-[10px] text-secondary uppercase font-bold">
                Built-in Audio Synthesizer
              </span>
            </div>
          </div>
        </section>

        {/* Literary Reader Reviews & Discussions */}
        <section className="flex flex-col gap-6 sm:gap-8 pt-4 border-t border-surface-variant/40">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-2">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary text-2xl">rate_review</span>
              <h2 className="font-headline-md text-xl sm:text-headline-md text-primary font-serif font-bold">
                Community Literary Reflections
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button 
                type="button"
                onClick={() => setReviewFilter('thoughtful')}
                className={`px-3 py-1.5 rounded-lg font-label-md text-xs sm:text-label-md transition-colors cursor-pointer min-h-[36px] ${
                  reviewFilter === 'thoughtful' 
                    ? 'bg-primary text-on-primary font-semibold' 
                    : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                }`}
              >
                Most Thoughtful
              </button>
              <button 
                type="button"
                onClick={() => setReviewFilter('recent')}
                className={`px-3 py-1.5 rounded-lg font-label-md text-xs sm:text-label-md transition-colors cursor-pointer min-h-[36px] ${
                  reviewFilter === 'recent' 
                    ? 'bg-primary text-on-primary font-semibold' 
                    : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
                }`}
              >
                Recent Logs
              </button>
              <button 
                type="button"
                onClick={() => setShowReflectionInput(prev => !prev)}
                className="px-3.5 py-1.5 bg-primary text-on-primary rounded-lg font-label-md text-xs sm:text-label-md hover:bg-primary-container transition-colors cursor-pointer font-semibold min-h-[36px]"
              >
                Write Reflection
              </button>
            </div>
          </div>

          {/* New Reflection Form */}
          {showReflectionInput && (
            <form onSubmit={handleAddReflection} className="bg-surface-container-low p-4 sm:p-6 rounded-xl border border-secondary/30 animate-fade-in flex flex-col gap-3">
              <h3 className="font-title-editorial text-sm font-bold text-primary">Inscribe Your Reading Note</h3>
              <textarea 
                rows="3"
                required
                placeholder="What passages, character arcs, or literary resonances stayed with you after finishing this book?"
                value={newReflection}
                onChange={(e) => setNewReflection(e.target.value)}
                className="w-full p-3 bg-surface rounded-lg text-on-surface font-body-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary border border-surface-variant resize-none"
              />
              <div className="flex items-center justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowReflectionInput(false)}
                  className="px-4 py-1.5 font-label-md text-xs sm:text-label-md text-on-surface-variant hover:text-primary min-h-[36px]"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-1.5 bg-primary text-on-primary rounded-lg font-label-md text-xs sm:text-label-md font-semibold hover:bg-primary-container min-h-[36px]"
                >
                  Publish Note
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {COMMUNITY_REVIEWS.map((rev) => (
              <article 
                key={rev.id}
                className="bg-surface-container-low rounded-xl p-5 sm:p-6 flex flex-col justify-between gap-4 shadow-xs border border-surface-variant/40"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img 
                        src={rev.avatar} 
                        alt={rev.author} 
                        className="w-9 h-9 rounded-full object-cover ring-1 ring-secondary/30" 
                      />
                      <div className="flex flex-col">
                        <span className="font-label-md text-sm text-on-surface font-semibold">
                          {rev.author}
                        </span>
                        <span className="font-label-archival text-[10px] text-secondary uppercase font-bold">
                          {rev.role}
                        </span>
                      </div>
                    </div>
                    <div className="flex text-secondary text-xs">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={`material-symbols-outlined text-sm ${i < rev.rating ? 'fill-1' : ''}`}>
                          star
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="font-body-md text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    {rev.content}
                  </p>
                </div>
                <div className="flex items-center justify-between text-on-surface-variant font-label-archival text-[10px] sm:text-xs pt-3 bg-surface-container -mx-5 sm:-mx-6 -mb-5 sm:-mb-6 px-5 sm:px-6 py-3 rounded-b-xl border-t border-surface-variant/40">
                  <span>{rev.readCount}</span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs text-secondary">favorite</span> 
                    {rev.likes} readers found this evocative
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Readers Also Treasured (Carousel / Grid) */}
        <section className="flex flex-col gap-6 pt-4 mb-4 border-t border-surface-variant/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-2xl">collections_bookmark</span>
                <h2 className="font-headline-md text-xl sm:text-headline-md text-primary font-serif font-bold">
                  Readers Also Treasured
                </h2>
              </div>
              <p className="font-body-sm text-xs sm:text-body-sm text-on-surface-variant mt-1">
                Labyrinthine mysteries, literary obsessions, and antique manuscript histories.
              </p>
            </div>
            <Link 
              to="/explore"
              className="text-xs font-label-archival uppercase text-secondary hover:text-primary font-bold"
            >
              Browse All Related →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedBooks.map((rel) => (
              <Link 
                key={rel.id} 
                to={`/books/${rel.id}`} 
                className="group flex flex-col gap-2.5"
              >
                <div className="relative bg-surface-container-high rounded-lg p-3 sm:p-4 aspect-[2/3] overflow-hidden flex items-center justify-center shadow-xs transition-transform duration-300 group-hover:-translate-y-1 border border-surface-variant/40">
                  <img src={rel.coverImage} alt={rel.title} className="w-full h-full object-cover rounded shadow-xs" />
                  <span className="absolute top-2 right-2 px-1.5 sm:px-2 py-0.5 bg-primary/90 text-on-primary text-[10px] font-bold rounded">
                    ★ {rel.rating}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-title-editorial text-sm sm:text-title-editorial text-primary group-hover:text-secondary transition-colors font-serif truncate font-semibold">
                    {rel.title}
                  </span>
                  <span className="font-label-md text-xs sm:text-label-md text-on-surface-variant truncate">
                    {rel.author}
                  </span>
                  <span className="font-label-archival text-[10px] text-secondary uppercase mt-0.5 font-bold">
                    {rel.genre}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
