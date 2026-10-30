import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BOOKS, CURATORS, GENRES_LIST } from '../data/booksData';
import { useLibrary } from '../context/LibraryContext';
import Bookshelf3D from '../components/books/Bookshelf3D';

export default function HomePage() {
  const { isBookmarked, toggleBookmark, showToast, books } = useLibrary();
  const navigate = useNavigate();
  const [heroSearch, setHeroSearch] = useState('');
  const [formatFilter, setFormatFilter] = useState('all');
  const [showSearchTray, setShowSearchTray] = useState(false);

  const libraryBooks = books && books.length > 0 ? books : BOOKS;
  const featuredBooks = libraryBooks.slice(0, 6);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      navigate(`/explore?search=${encodeURIComponent(heroSearch.trim())}`);
    } else {
      navigate('/explore');
    }
  };

  const handleTagClick = (tag) => {
    navigate(`/explore?genre=${encodeURIComponent(tag)}`);
  };

  return (
    <div className="flex flex-col w-full overflow-x-hidden">
      {/* 1. CINEMATIC EDITORIAL HERO SECTION */}
      <section className="relative w-full overflow-hidden bg-surface pb-16 sm:pb-24 pt-4 sm:pt-8 lg:pt-14">
        {/* Atmospheric Ambient Gradient Spheres */}
        <div className="pointer-events-none absolute -left-48 top-0 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-1/4 h-[30rem] w-[30rem] rounded-full bg-primary-fixed-dim/20 blur-3xl" />

        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-16">
            {/* Left Editorial Column */}
            <div className="flex flex-col items-start lg:col-span-6 z-10">
              {/* Eyebrow Pill */}
              <div className="inline-flex items-center gap-2 rounded-full bg-surface-container-high px-4 py-1.5 shadow-xs">
                <span className="text-secondary font-headline-sm text-sm">✦</span>
                <span className="font-label-archival text-xs uppercase tracking-widest text-secondary font-bold">
                  Your Digital Reading Sanctuary
                </span>
              </div>

              {/* Main Title */}
              <h1 className="mt-6 font-display-hero text-3xl sm:text-5xl lg:text-display-hero text-primary tracking-tight leading-tight sm:leading-none">
                Every Book Opens a{' '}
                <span className="italic text-secondary underline decoration-secondary-fixed-dim decoration-wavy decoration-1 underline-offset-8">
                  New World.
                </span>
              </h1>

              {/* Poetic Subtitle */}
              <p className="mt-5 sm:mt-6 max-w-xl font-body-lg text-base sm:text-body-lg text-on-surface-variant leading-relaxed">
                Discover masterworks worth remembering, build your personal digital folio collection, and experience the timeless joy of distraction-free reading in a sanctuary crafted for curious minds.
              </p>

              {/* Dual CTAs */}
              <div className="mt-8 sm:mt-9 flex flex-wrap items-center gap-3 sm:gap-4 w-full sm:w-auto">
                <Link 
                  to="/explore"
                  className="group inline-flex items-center justify-center gap-3 rounded-lg bg-primary px-6 sm:px-7 py-3.5 font-label-lg text-label-lg text-on-primary shadow-md hover:bg-primary-container hover:text-secondary-fixed transition-all duration-300 w-full sm:w-auto min-h-[44px]"
                >
                  <span>Explore the Library</span>
                  <span className="material-symbols-outlined text-sm transition-transform duration-300 group-hover:translate-x-1">
                    arrow_forward
                  </span>
                </Link>
                <Link 
                  to="/reader/shadow-of-the-wind"
                  className="inline-flex items-center justify-center gap-2.5 rounded-lg bg-surface-container-low px-5 sm:px-6 py-3.5 font-label-lg text-label-lg text-primary shadow-xs hover:bg-surface-container hover:text-secondary transition-all duration-300 w-full sm:w-auto min-h-[44px]"
                >
                  <span className="material-symbols-outlined text-lg text-secondary">menu_book</span>
                  <span>Enter Reading Room</span>
                </Link>
              </div>

              {/* Editorial Metric Strip */}
              <div className="mt-10 sm:mt-12 flex flex-wrap items-center gap-6 sm:gap-8 pt-6 sm:pt-8 border-t border-surface-variant/40 w-full">
                <div>
                  <p className="font-headline-md text-2xl sm:text-headline-md text-primary font-bold">42,800+</p>
                  <p className="font-label-archival text-xs text-on-surface-variant uppercase tracking-wider">
                    Archived Volumes
                  </p>
                </div>
                <div className="h-8 w-px bg-surface-variant hidden sm:block" />
                <div>
                  <p className="font-headline-md text-2xl sm:text-headline-md text-primary font-bold">14,350</p>
                  <p className="font-label-archival text-xs text-on-surface-variant uppercase tracking-wider">
                    Active Readers
                  </p>
                </div>
                <div className="h-8 w-px bg-surface-variant hidden sm:block" />
                <div>
                  <p className="font-headline-md text-2xl sm:text-headline-md text-secondary font-bold">100%</p>
                  <p className="font-label-archival text-xs text-on-surface-variant uppercase tracking-wider">
                    Public Domain Access
                  </p>
                </div>
              </div>
            </div>

            {/* Right 3D Perspective Hero Display */}
            <div className="relative lg:col-span-6 flex items-center justify-center w-full overflow-hidden sm:overflow-visible">
              {/* Backing ambient shadow disc */}
              <div className="absolute h-64 sm:h-80 w-64 sm:w-80 rounded-full bg-secondary-fixed/40 blur-2xl -z-10" />
              <div className="relative flex items-center justify-center gap-2 sm:gap-4 py-6 sm:py-8 [perspective:1200px] max-w-full">
                
                {/* Book 1: Shadow of the Wind */}
                <Link 
                  to="/books/shadow-of-the-wind"
                  className="group relative w-24 sm:w-36 transition-all duration-500 hover:-translate-y-4 [transform:rotateY(-18deg)_rotateZ(-2deg)] hover:[transform:rotateY(0deg)_rotateZ(0deg)] cursor-pointer"
                >
                  <div className="relative h-48 sm:h-72 w-full rounded-l-sm rounded-r-md bg-gradient-to-r from-primary via-primary-container to-primary p-2 sm:p-3 shadow-xl flex flex-col justify-between overflow-hidden">
                    <div className="absolute left-1 top-0 bottom-0 w-2.5 bg-black/25" />
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-surface-variant/40" />
                    <div className="absolute -top-1 right-3 sm:right-4 w-3 sm:w-3.5 h-8 sm:h-12 bg-secondary rounded-b shadow-md" />
                    <div className="pl-1.5 sm:pl-2 pt-1.5 sm:pt-2">
                      <span className="font-label-archival text-[8px] sm:text-[9px] text-secondary-fixed uppercase tracking-widest block font-bold">
                        Carlos R. Zafón
                      </span>
                      <h3 className="font-headline-sm text-xs sm:text-base text-on-primary font-semibold mt-1 leading-tight font-serif">
                        The Shadow of the Wind
                      </h3>
                    </div>
                    <div className="pl-1.5 sm:pl-2 pb-1">
                      <span className="font-label-archival text-[7px] sm:text-[8px] text-primary-fixed uppercase tracking-wider block">
                        Gothic Romance
                      </span>
                      <div className="mt-1 flex items-center text-secondary text-[10px] sm:text-xs">
                        ★★★★★
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Book 2: Invisible Cities (Elevated Centerpiece) */}
                <Link 
                  to="/books/invisible-cities"
                  className="group relative w-28 sm:w-44 -mt-4 sm:-mt-8 transition-all duration-500 hover:-translate-y-5 [transform:scale(1.08)] cursor-pointer z-20"
                >
                  <div className="relative h-56 sm:h-80 w-full rounded-l-sm rounded-r-md bg-gradient-to-r from-secondary to-[#5b4315] p-2.5 sm:p-4 shadow-2xl flex flex-col justify-between overflow-hidden">
                    <div className="absolute left-1.5 top-0 bottom-0 w-3 bg-black/30" />
                    <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-secondary-fixed/50" />
                    <div className="absolute right-2 sm:right-3 top-2 sm:top-3 h-6 sm:h-8 w-6 sm:w-8 rounded-full bg-secondary-fixed/20 flex items-center justify-center text-secondary-fixed text-[10px] sm:text-xs">
                      ✦
                    </div>
                    <div className="pl-2 sm:pl-3 pt-2 sm:pt-3">
                      <span className="font-label-archival text-[8px] sm:text-[10px] text-secondary-fixed uppercase tracking-widest block font-bold">
                        Italo Calvino
                      </span>
                      <h3 className="font-headline-md text-sm sm:text-xl text-on-secondary font-semibold mt-1 leading-snug font-serif">
                        Invisible Cities
                      </h3>
                    </div>
                    <div className="pl-2 sm:pl-3 pb-2">
                      <span className="font-label-archival text-[7px] sm:text-[9px] text-secondary-fixed-dim uppercase tracking-widest block">
                        Philosophical Fiction
                      </span>
                      <div className="mt-1 sm:mt-2 inline-flex items-center gap-1 rounded bg-black/30 px-1.5 sm:px-2 py-0.5 text-secondary-fixed text-[9px] sm:text-xs font-semibold">
                        <span>Rare Archival</span>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Book 3: Piranesi */}
                <Link 
                  to="/books/piranesi"
                  className="group relative w-24 sm:w-36 transition-all duration-500 hover:-translate-y-4 [transform:rotateY(16deg)_rotateZ(2deg)] hover:[transform:rotateY(0deg)_rotateZ(0deg)] cursor-pointer"
                >
                  <div className="relative h-48 sm:h-72 w-full rounded-l-sm rounded-r-md bg-gradient-to-r from-tertiary-container via-primary-container to-tertiary p-2 sm:p-3 shadow-xl flex flex-col justify-between overflow-hidden">
                    <div className="absolute left-1 top-0 bottom-0 w-2.5 bg-black/25" />
                    <div className="absolute -top-1 right-3 sm:right-4 w-3 sm:w-3.5 h-7 sm:h-10 bg-secondary-fixed rounded-b shadow-md" />
                    <div className="pl-1.5 sm:pl-2 pt-1.5 sm:pt-2">
                      <span className="font-label-archival text-[8px] sm:text-[9px] text-tertiary-fixed uppercase tracking-widest block font-bold">
                        Susanna Clarke
                      </span>
                      <h3 className="font-headline-sm text-xs sm:text-base text-on-primary font-semibold mt-1 leading-tight font-serif">
                        Piranesi
                      </h3>
                    </div>
                    <div className="pl-1.5 sm:pl-2 pb-1">
                      <span className="font-label-archival text-[7px] sm:text-[8px] text-tertiary-fixed-dim uppercase tracking-wider block">
                        Speculative Fiction
                      </span>
                      <div className="mt-1 flex items-center text-secondary-fixed text-[10px] sm:text-xs">
                        ★★★★★
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Book 4: Solitude (Large screens) */}
                <Link 
                  to="/books/one-hundred-years-of-solitude"
                  className="hidden xl:block group relative w-28 -ml-2 transition-all duration-500 hover:-translate-y-4 [transform:rotateY(24deg)_rotateZ(4deg)] cursor-pointer"
                >
                  <div className="relative h-56 w-full rounded-l-sm rounded-r-md bg-gradient-to-r from-secondary-container via-surface-container-highest to-surface-variant p-2.5 shadow-lg flex flex-col justify-between">
                    <div className="pl-2 pt-2">
                      <span className="font-label-archival text-[8px] text-on-secondary-container uppercase tracking-wider block font-bold">
                        G.G. Márquez
                      </span>
                      <h3 className="font-headline-sm text-xs text-on-surface font-semibold mt-1 font-serif">
                        Solitude
                      </h3>
                    </div>
                    <div className="pl-2 pb-1">
                      <span className="font-label-archival text-[8px] text-secondary font-bold">
                        Classic
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PROMINENT DISCOVERY SEARCH & FILTER BAR */}
      <section className="relative z-30 -mt-6 sm:-mt-10 mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-xl bg-surface-container-lowest p-4 sm:p-7 shadow-xl border border-surface-variant/40">
          <form onSubmit={handleHeroSearch} className="relative flex flex-col md:flex-row items-stretch md:items-center gap-3">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-4.5 top-1/2 -translate-y-1/2 text-outline text-xl sm:text-2xl pointer-events-none">
                search
              </span>
              <input 
                id="novelshelf-hero-search"
                type="text"
                placeholder="Search books, authors, genres, or rare folios..."
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
                onFocus={() => setShowSearchTray(true)}
                className="w-full pl-12 pr-10 py-3.5 sm:py-4 bg-surface-container-low rounded-lg text-on-surface placeholder:text-outline font-body-md text-sm sm:text-base focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary shadow-inner transition-all min-h-[44px]"
              />
              <button 
                type="button" 
                onClick={() => showToast("Voice search activated. Listening for book titles...")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1.5 text-outline hover:text-on-surface transition-colors"
                title="Voice Search"
                aria-label="Voice Search"
              >
                <span className="material-symbols-outlined text-lg">mic</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 md:w-52">
                <select 
                  value={formatFilter}
                  onChange={(e) => setFormatFilter(e.target.value)}
                  className="w-full appearance-none rounded-lg bg-surface-container-high py-3.5 sm:py-4 pl-4 pr-10 font-label-md text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer min-h-[44px]"
                >
                  <option value="all">All Digital Formats</option>
                  <option value="digital">Reading Room (Digital)</option>
                  <option value="annotated">Annotated &amp; Illustrated</option>
                  <option value="rare">Archival &amp; Rare Folios</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-base">
                  expand_more
                </span>
              </div>
              <button 
                type="submit"
                className="shrink-0 flex items-center justify-center gap-2 rounded-lg bg-primary px-5 sm:px-7 py-3.5 sm:py-4 font-label-lg text-sm sm:text-label-lg text-on-primary hover:bg-primary-container transition-colors shadow-xs font-semibold min-h-[44px]"
              >
                <span className="material-symbols-outlined text-sm">filter_list</span>
                <span className="hidden sm:inline">Find Stories</span>
              </button>
            </div>
          </form>

          {/* Popular Tags Strip */}
          <div className="mt-4 flex flex-wrap items-center gap-2 pt-2 border-t border-surface-variant/40">
            <span className="font-label-archival text-xs text-on-surface-variant uppercase tracking-wider mr-1">
              Trending Archives:
            </span>
            {["Magical Realism", "Philosophy of Mind", "Post-Modern Fiction", "Illuminated Manuscripts", "Vintage Sci-Fi"].map(tag => (
              <button 
                key={tag}
                type="button"
                onClick={() => handleTagClick(tag)}
                className="rounded-md bg-surface-container-high px-2.5 sm:px-3 py-1 font-label-md text-xs text-on-surface-variant hover:bg-secondary-container hover:text-on-secondary-fixed transition-colors cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Quick Drawer Preview Tray */}
          {showSearchTray && heroSearch.trim() && (
            <div className="mt-4 pt-4 border-t border-surface-variant animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {BOOKS.filter(b => 
                  b.title.toLowerCase().includes(heroSearch.toLowerCase()) ||
                  b.author.toLowerCase().includes(heroSearch.toLowerCase())
                ).slice(0, 3).map(b => (
                  <Link 
                    key={b.id} 
                    to={`/books/${b.id}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-container-high transition-colors"
                  >
                    <img src={b.coverImage} alt={b.title} className="h-10 w-8 rounded object-cover shadow-xs shrink-0" />
                    <div className="min-w-0">
                      <p className="font-label-lg text-sm text-on-surface truncate font-semibold">{b.title}</p>
                      <p className="font-body-sm text-xs text-outline truncate">{b.author} • {b.genre}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3. INTERACTIVE 3D WOODEN BOOKSHELF EXPERIENCE */}
      <Bookshelf3D />

      {/* 4. FEATURED BOOKS SECTION — STORIES WORTH GETTING LOST IN */}
      <section className="w-full py-16 sm:py-24 bg-surface">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-14">
            <div>
              <span className="font-label-archival text-xs text-secondary uppercase tracking-widest font-bold block mb-1">
                Editor's Desk Selection
              </span>
              <h2 className="font-headline-lg text-2xl sm:text-headline-lg text-primary font-bold">
                Stories Worth Getting Lost In
              </h2>
              <p className="font-body-md text-sm sm:text-body-md text-on-surface-variant mt-2 max-w-xl">
                Handpicked reads spanning speculative worlds, reflective memoirs, and unforgettable masterworks.
              </p>
            </div>
            <Link 
              to="/explore"
              className="inline-flex items-center gap-2 font-label-lg text-sm sm:text-label-lg text-primary hover:text-secondary transition-colors underline decoration-secondary decoration-1 underline-offset-4"
            >
              <span>View All Books in Catalog</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>

          {/* Responsive Books Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            {featuredBooks.map((book) => {
              const bookmarked = isBookmarked(book.id);
              return (
                <div 
                  key={book.id} 
                  className="group relative flex flex-col rounded-lg bg-surface-container-low p-2.5 sm:p-3 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="relative aspect-[2/3] w-full overflow-hidden rounded bg-surface-container-highest shadow-sm">
                    <img 
                      src={book.coverImage} 
                      alt={book.title} 
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <button 
                      type="button"
                      onClick={() => toggleBookmark(book.id)}
                      aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
                      className={`absolute top-2 right-2 rounded-full p-1.5 transition-colors shadow-md ${
                        bookmarked 
                          ? 'bg-secondary text-on-secondary' 
                          : 'bg-surface/80 text-on-surface hover:bg-surface'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm leading-none block">
                        {bookmarked ? 'bookmark' : 'bookmark_border'}
                      </span>
                    </button>
                  </div>
                  <div className="mt-3 flex flex-1 flex-col justify-between">
                    <div>
                      <span className="font-label-archival text-[9px] sm:text-[10px] text-secondary font-bold uppercase tracking-wider block">
                        {book.genre}
                      </span>
                      <Link 
                        to={`/books/${book.id}`}
                        className="font-title-editorial text-sm sm:text-base font-semibold text-primary hover:text-secondary transition-colors line-clamp-1 mt-0.5"
                      >
                        {book.title}
                      </Link>
                      <p className="font-body-sm text-xs text-on-surface-variant truncate">
                        {book.author}
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-surface-variant/40 flex items-center justify-between">
                      <div className="flex items-center text-secondary text-xs">
                        <span className="font-bold text-on-surface mr-1">{book.rating}</span>
                        <span>★</span>
                      </div>
                      <Link 
                        to={`/reader/${book.id}`}
                        className="font-label-md text-xs text-primary font-semibold hover:text-secondary flex items-center gap-0.5"
                      >
                        <span>Read</span>
                        <span className="material-symbols-outlined text-xs">chevron_right</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. IMMERSIVE READING ROOM SPOTLIGHT */}
      <section className="w-full py-16 sm:py-24 bg-surface-container-lowest border-y border-surface-variant/40">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left Content */}
            <div className="lg:col-span-5 flex flex-col items-start">
              <span className="font-label-archival text-xs text-secondary uppercase tracking-widest font-bold block mb-1">
                Distraction-Free Sanctuary
              </span>
              <h2 className="font-headline-lg text-2xl sm:text-headline-lg text-primary font-bold">
                Designed for the Lost Art of Deep Reading
              </h2>
              <p className="font-body-md text-sm sm:text-body-md text-on-surface-variant mt-3 leading-relaxed">
                Step into a digital reading chamber calibrated for prolonged focus: customizable parchment tones, realistic page-turning acoustics, ambient library soundscapes, and marginalia note-taking.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary text-xl">palette</span>
                  <span className="font-body-sm text-sm text-on-surface">
                    Parchment, Sepia &amp; Forest Reading Canvases
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary text-xl">font_download</span>
                  <span className="font-body-sm text-sm text-on-surface">
                    Custom editorial typography &amp; adjustable leading
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary text-xl">sync</span>
                  <span className="font-body-sm text-sm text-on-surface">
                    Archival bookmark syncing and ribbon place-holding
                  </span>
                </div>
              </div>
              <div className="mt-8">
                <Link 
                  to="/reader/shadow-of-the-wind"
                  className="inline-flex items-center gap-2.5 rounded-lg bg-primary px-6 sm:px-7 py-3.5 font-label-lg text-label-lg text-on-primary hover:bg-primary-container hover:text-secondary-fixed transition-colors shadow-md font-semibold min-h-[44px]"
                >
                  <span className="material-symbols-outlined text-lg">chrome_reader_mode</span>
                  <span>Enter the Reading Room</span>
                </Link>
              </div>
            </div>

            {/* Right Realistic Open Book Reading Simulator */}
            <div className="lg:col-span-7 w-full">
              <div className="relative rounded-2xl bg-surface-container-high p-4 sm:p-6 shadow-2xl border border-surface-variant/40">
                {/* Reader Mini Header Toolbar Mock */}
                <div className="flex items-center justify-between pb-3 sm:pb-4 mb-3 sm:mb-4 border-b border-surface-variant/60">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-secondary" />
                    <span className="font-label-archival text-xs text-on-surface font-bold uppercase tracking-wider">
                      Reading Room • Chapter IV
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="h-7 w-7 rounded bg-surface-container-lowest text-xs font-bold text-primary flex items-center justify-center shadow-xs">
                      A-
                    </button>
                    <button className="h-7 w-7 rounded bg-surface-container-lowest text-xs font-bold text-primary flex items-center justify-center shadow-xs">
                      A+
                    </button>
                    <button className="px-2.5 py-1 rounded bg-[#fcd89c] text-on-secondary-container font-label-archival text-[10px] font-bold">
                      Sepia
                    </button>
                  </div>
                </div>

                {/* Two Page Spread Card / Single page on mobile */}
                <div className="relative grid grid-cols-1 md:grid-cols-2 rounded-lg bg-[#fcf9f2] p-5 sm:p-8 shadow-inner text-[#2d312d]">
                  {/* Center Crease Simulation */}
                  <div className="hidden md:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-8 bg-gradient-to-r from-black/5 via-black/15 to-transparent pointer-events-none" />

                  {/* Left Page */}
                  <div className="pr-0 md:pr-6 pb-6 md:pb-0 flex flex-col justify-between">
                    <div>
                      <span className="font-label-archival text-[9px] text-[#717975] uppercase tracking-widest block mb-2 sm:mb-3 font-bold">
                        Invisible Cities • Italo Calvino
                      </span>
                      <p className="font-body-md text-xs sm:text-sm leading-relaxed text-[#2d312d]">
                        <span className="float-left text-3xl font-headline-lg font-bold leading-none pr-2 pt-0.5 text-secondary drop-cap font-serif">
                          L
                        </span>
                        eaving there and proceeding for three days towards the east, one reaches Diomira, a city with sixty silver domes, bronze statues of all the gods, streets paved with lead, a crystal theater, and a golden cock that crows each morning on a tower.
                      </p>
                      <p className="font-body-md text-xs sm:text-sm leading-relaxed text-[#2d312d] mt-3">
                        All these beauties the traveler already knows, having seen them also in other cities. But the special quality of this city for the man who arrives there on a September evening...
                      </p>
                    </div>
                    <div className="pt-4 flex items-center justify-between text-xs text-[#717975]">
                      <span>Page 48</span>
                      <span className="material-symbols-outlined text-sm">bookmark</span>
                    </div>
                  </div>

                  {/* Right Page (hidden on smallest screens to illustrate clean responsive single view) */}
                  <div className="hidden md:flex pl-6 flex-col justify-between">
                    <div>
                      <span className="font-label-archival text-[9px] text-[#717975] uppercase tracking-widest block mb-3 font-bold">
                        Chapter IV • Cities &amp; Memory
                      </span>
                      <p className="font-body-md text-sm leading-relaxed text-[#2d312d]">
                        ...is that he feels envy toward those who now believe they have once before lived an evening identical to this and who think they were happy, that time.
                      </p>
                      <div className="my-4 rounded bg-[#fcd89c]/40 p-3 text-xs italic text-[#5b4315] font-title-editorial">
                        "Memory's images, once they are fixed in words, are erased," Polo said. "Perhaps I am afraid of losing Venice all at once, if I speak of it."
                      </div>
                    </div>
                    <div className="pt-4 flex items-center justify-between text-xs text-[#717975]">
                      <span>26 min left in session</span>
                      <span>Page 49</span>
                    </div>
                  </div>
                </div>

                {/* Page flip footer cue */}
                <div className="mt-4 flex items-center justify-between text-xs text-on-surface-variant font-label-md">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">volume_up</span>
                    <span>Ambient: Gentle Rain &amp; Oak Fireplace</span>
                  </span>
                  <Link 
                    to="/reader/shadow-of-the-wind" 
                    className="hover:text-primary cursor-pointer flex items-center gap-1 font-semibold"
                  >
                    <span>Turn Page</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward_ios</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. LITERARY COMMUNITY, QUOTE & CONTRIBUTION HIGHLIGHTS */}
      <section className="w-full py-16 sm:py-24 bg-surface">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-12">
          {/* Quote of the Day Banner */}
          <div className="rounded-xl bg-primary-container p-6 sm:p-12 text-on-primary shadow-xl mb-12 sm:mb-16 relative overflow-hidden">
            <div className="pointer-events-none absolute right-4 bottom-2 text-primary-fixed-dim/10 font-headline-lg text-7xl sm:text-9xl select-none">
              “
            </div>
            <div className="relative z-10 max-w-3xl">
              <span className="font-label-archival text-xs text-secondary-fixed uppercase tracking-widest font-bold block mb-2">
                Quote of the Day
              </span>
              <p className="font-headline-md text-xl sm:text-headline-md italic leading-relaxed text-surface font-serif">
                "A reader lives a thousand lives before he dies. The man who never reads lives only one."
              </p>
              <p className="mt-4 font-label-lg text-sm sm:text-label-lg text-secondary-fixed">
                — George R.R. Martin, <span className="text-on-primary-container text-xs sm:text-sm">A Dance with Dragons</span>
              </p>
            </div>
          </div>

          {/* Curator Spotlight Grid */}
          <div className="mb-14 sm:mb-20">
            <div className="mb-6 sm:mb-8">
              <span className="font-label-archival text-xs text-secondary uppercase tracking-widest font-bold block mb-1">
                Archival Custodians
              </span>
              <h2 className="font-headline-md text-2xl sm:text-headline-md text-primary font-bold">
                Featured Library Curators
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {CURATORS.map((curator) => (
                <div 
                  key={curator.id} 
                  className="flex items-center gap-4 p-4 sm:p-5 rounded-lg bg-surface-container-low border border-surface-variant/40"
                >
                  <img 
                    src={curator.avatar} 
                    alt={curator.name} 
                    className="h-14 w-14 sm:h-16 sm:w-16 rounded-full object-cover shrink-0 ring-2 ring-secondary/40" 
                  />
                  <div className="min-w-0">
                    <h3 className="font-title-editorial text-base text-primary font-semibold font-serif truncate">
                      {curator.name}
                    </h3>
                    <p className="font-label-archival text-[10px] text-secondary uppercase font-bold">
                      {curator.stat}
                    </p>
                    <p className="font-body-sm text-xs text-on-surface-variant mt-1 leading-snug line-clamp-2">
                      {curator.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contribution Banner */}
          <div className="rounded-2xl bg-surface-container-highest p-6 sm:p-12 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 border border-surface-variant/50">
            <div className="max-w-2xl">
              <span className="font-label-archival text-xs text-secondary uppercase tracking-widest font-bold block mb-1">
                Open Archival Guild
              </span>
              <h2 className="font-headline-lg text-2xl sm:text-headline-lg text-primary font-bold">
                Help Another Reader Discover a Masterwork.
              </h2>
              <p className="font-body-md text-sm sm:text-body-md text-on-surface-variant mt-3 leading-relaxed">
                Have rare public domain literature to index or digitized manuscripts for our global reading rooms? Contribute digital folios, transcribe historical texts, and preserve world literature for future generations.
              </p>
              <p className="mt-3 font-label-archival text-[10px] sm:text-[11px] text-outline">
                All submitted texts respect open archival copyright declarations and digital preservation standards.
              </p>
            </div>
            <div className="shrink-0 flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <Link 
                to="/contribute"
                className="w-full sm:w-auto text-center rounded-lg bg-primary px-7 py-3.5 font-label-lg text-label-lg text-on-primary hover:bg-primary-container transition-colors shadow-md font-semibold min-h-[44px] flex items-center justify-center"
              >
                Contribute a Folio
              </Link>
              <Link 
                to="/explore"
                className="w-full sm:w-auto text-center rounded-lg bg-surface-container px-6 py-3.5 font-label-lg text-label-lg text-primary hover:bg-surface-container-high transition-colors min-h-[44px] flex items-center justify-center"
              >
                Browse Catalog
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
