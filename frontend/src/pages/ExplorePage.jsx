import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext';
import BookCard from '../components/books/BookCard';

export default function ExplorePage() {
  const { books, showToast } = useLibrary();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters State
  const [activeTab, setActiveTab] = useState('all'); // all | staff | awards | classics
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedGenres, setSelectedGenres] = useState(() => {
    const genreParam = searchParams.get('genre');
    return genreParam ? [genreParam] : ['Fiction'];
  });
  const [formatDigital, setFormatDigital] = useState(true);
  const [formatIllustrated, setFormatIllustrated] = useState(true);
  const [formatAudio, setFormatAudio] = useState(false);
  const [language, setLanguage] = useState('en');
  const [era, setEra] = useState('all');
  const [maxPages, setMaxPages] = useState(400);
  const [layoutMode, setLayoutMode] = useState('grid'); // grid | list
  const [sortBy, setSortBy] = useState('curator'); // curator | newest | rating | title
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Sync search param when changed
  useEffect(() => {
    const q = searchParams.get('search');
    if (q !== null && q !== searchQuery) {
      setSearchQuery(q);
    }
    const g = searchParams.get('genre');
    if (g && !selectedGenres.includes(g)) {
      setSelectedGenres([g]);
    }
  }, [searchParams]);

  const genresList = [
    { name: 'Fiction', count: 412 },
    { name: 'Classic Literature', count: 189 },
    { name: 'Sci-Fi & Speculative', count: 94 },
    { name: 'Philosophy & Ethics', count: 130 },
    { name: 'Mystery & Detective', count: 78 },
    { name: 'Poetry & Verse', count: 52 },
    { name: 'History & Art', count: 115 },
    { name: 'Non-Fiction', count: 204 },
  ];

  const handleGenreToggle = (genreName) => {
    if (selectedGenres.includes(genreName)) {
      if (selectedGenres.length > 1) {
        setSelectedGenres(selectedGenres.filter(g => g !== genreName));
      } else {
        setSelectedGenres([]);
      }
    } else {
      setSelectedGenres([...selectedGenres, genreName]);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedGenres(['Fiction']);
    setFormatDigital(true);
    setFormatIllustrated(true);
    setFormatAudio(false);
    setLanguage('en');
    setEra('all');
    setMaxPages(400);
    setActiveTab('all');
    setSortBy('curator');
    setSearchParams({});
    showToast('Filters cleared to default catalog state.');
  };

  // Filtered & Sorted books
  const filteredBooks = useMemo(() => {
    return books.filter(b => {
      // Tab filter
      if (activeTab === 'staff' && !b.isStaffPick) return false;
      if (activeTab === 'awards' && !b.isAwards) return false;
      if (activeTab === 'classics' && !b.isClassics && b.era !== '19th Century Classics') return false;

      // Search text
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matches = 
          b.title.toLowerCase().includes(query) ||
          b.author.toLowerCase().includes(query) ||
          b.genre.toLowerCase().includes(query) ||
          b.tags?.some(t => t.toLowerCase().includes(query));
        if (!matches) return false;
      }

      // Genre filter (if any selected)
      if (selectedGenres.length > 0) {
        const genreMatch = selectedGenres.some(g => 
          b.genre.toLowerCase().includes(g.toLowerCase()) || 
          b.category?.toLowerCase().includes(g.toLowerCase())
        );
        if (!genreMatch) return false;
      }

      // Era filter
      if (era !== 'all' && b.era && !b.era.toLowerCase().includes(era.toLowerCase())) {
        return false;
      }

      // Max Pages
      if (b.pages > maxPages) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'newest') return b.year - a.year;
      return 0; // default curator
    });
  }, [books, activeTab, searchQuery, selectedGenres, era, maxPages, sortBy]);

  const itemsPerPage = 9;
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage) || 1;
  const paginatedBooks = filteredBooks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const filtersContent = (
    <div className="bg-surface-container-low rounded-xl p-5 sm:p-6 shadow-sm flex flex-col gap-6 border border-surface-variant/40">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-xl">tune</span>
          <h2 className="font-title-editorial text-title-editorial text-primary font-bold">Catalog Filters</h2>
        </div>
        <button 
          onClick={handleResetFilters}
          className="font-label-archival text-xs uppercase tracking-wider text-secondary hover:text-primary transition-colors cursor-pointer" 
          type="button"
        >
          Clear All
        </button>
      </div>

      {/* Internal Search */}
      <div className="relative w-full">
        <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-lg pointer-events-none">
          search
        </span>
        <input 
          className="w-full pl-9 pr-3 py-2 bg-surface-container-highest/60 rounded text-on-surface placeholder:text-outline text-body-sm font-body-sm focus:outline-none focus:bg-surface-container-lowest focus:shadow-sm transition-all" 
          placeholder="Filter title, author, motif..." 
          type="text"
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
        />
      </div>

      {/* Genres Checkbox List */}
      <div className="space-y-3">
        <span className="font-label-archival text-xs uppercase tracking-widest text-on-surface-variant block font-bold">
          Genres
        </span>
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {genresList.map(g => (
            <label key={g.name} className="flex items-center justify-between group cursor-pointer py-0.5">
              <div className="flex items-center gap-2.5">
                <input 
                  type="checkbox"
                  checked={selectedGenres.includes(g.name)}
                  onChange={() => handleGenreToggle(g.name)}
                  className="w-4 h-4 rounded bg-surface text-primary focus:ring-0 accent-primary cursor-pointer"
                />
                <span className="font-body-sm text-body-sm text-on-surface group-hover:text-primary">
                  {g.name}
                </span>
              </div>
              <span className="font-label-archival text-[10px] text-outline bg-surface-container px-1.5 py-0.5 rounded">
                {g.count}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Digital Reading Formats */}
      <div className="space-y-3">
        <span className="font-label-archival text-xs uppercase tracking-widest text-on-surface-variant block font-bold">
          Digital Formats
        </span>
        <div className="grid grid-cols-1 gap-2">
          <label className="flex items-center gap-3 p-2.5 rounded bg-surface hover:bg-surface-container-high transition-colors cursor-pointer border border-surface-variant/30">
            <input 
              type="checkbox"
              checked={formatDigital}
              onChange={(e) => setFormatDigital(e.target.checked)}
              className="w-4 h-4 rounded text-primary accent-primary" 
            />
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base">auto_stories</span>
              <span className="font-label-md text-label-md text-on-surface font-medium">Digital Reader Edition</span>
            </div>
          </label>
          <label className="flex items-center gap-3 p-2.5 rounded bg-surface hover:bg-surface-container-high transition-colors cursor-pointer border border-surface-variant/30">
            <input 
              type="checkbox"
              checked={formatIllustrated}
              onChange={(e) => setFormatIllustrated(e.target.checked)}
              className="w-4 h-4 rounded text-primary accent-primary" 
            />
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-base">brush</span>
              <span className="font-label-md text-label-md text-on-surface font-medium">Illuminated &amp; Annotated</span>
            </div>
          </label>
          <label className="flex items-center gap-3 p-2.5 rounded bg-surface hover:bg-surface-container-high transition-colors cursor-pointer border border-surface-variant/30">
            <input 
              type="checkbox"
              checked={formatAudio}
              onChange={(e) => setFormatAudio(e.target.checked)}
              className="w-4 h-4 rounded text-primary accent-primary" 
            />
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-outline text-base">headphones</span>
              <span className="font-label-md text-label-md text-on-surface font-medium">Ambient Audio Scape</span>
            </div>
          </label>
        </div>
      </div>

      {/* Edition Language */}
      <div className="space-y-3">
        <span className="font-label-archival text-xs uppercase tracking-widest text-on-surface-variant block font-bold">
          Edition Language
        </span>
        <div className="relative">
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full bg-surface-container-highest/60 rounded px-3 py-2 text-on-surface font-body-sm text-body-sm appearance-none focus:outline-none focus:bg-surface-container-lowest cursor-pointer min-h-[40px]"
          >
            <option value="en">English (Original &amp; Translations)</option>
            <option value="fr">French (Français)</option>
            <option value="es">Spanish (Español)</option>
            <option value="de">German (Deutsch)</option>
            <option value="ja">Japanese (日本語)</option>
          </select>
          <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-outline text-lg pointer-events-none">
            expand_more
          </span>
        </div>
      </div>

      {/* Publication Era */}
      <div className="space-y-3">
        <span className="font-label-archival text-xs uppercase tracking-widest text-on-surface-variant block font-bold">
          Publication Era
        </span>
        <div className="space-y-1.5">
          {[
            { id: 'all', label: 'All Eras' },
            { id: 'Contemporary', label: 'Contemporary (2000+)' },
            { id: '20th Century', label: '20th Century' },
            { id: '19th Century Classics', label: '19th Century Classics' },
            { id: 'Rare Folios', label: 'Rare Folios & Manuscripts' }
          ].map(item => (
            <label key={item.id} className="flex items-center gap-2.5 cursor-pointer py-0.5">
              <input 
                type="radio" 
                name="era"
                value={item.id}
                checked={era === item.id}
                onChange={(e) => setEra(e.target.value)}
                className="w-3.5 h-3.5 accent-primary text-primary"
              />
              <span className="font-body-sm text-body-sm text-on-surface">
                {item.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Volume Length Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-label-archival text-xs uppercase tracking-widest text-on-surface-variant font-bold">
            Volume Length
          </span>
          <span className="font-label-md text-label-md text-primary font-bold">
            &lt; {maxPages} pages
          </span>
        </div>
        <input 
          type="range"
          min="80" 
          max="950" 
          value={maxPages}
          onChange={(e) => setMaxPages(Number(e.target.value))}
          className="w-full accent-primary h-1.5 bg-surface-variant rounded-lg cursor-pointer" 
        />
        <div className="flex flex-wrap gap-1.5 pt-1">
          <button 
            type="button"
            onClick={() => setMaxPages(150)}
            className={`page-pill px-2.5 py-1 text-[11px] font-label-archival rounded transition-colors cursor-pointer ${
              maxPages === 150 ? 'bg-primary text-on-primary font-bold' : 'bg-surface hover:bg-surface-container text-on-surface-variant'
            }`}
          >
            Novella (&lt;150p)
          </button>
          <button 
            type="button"
            onClick={() => setMaxPages(400)}
            className={`page-pill px-2.5 py-1 text-[11px] font-label-archival rounded transition-colors cursor-pointer ${
              maxPages === 400 ? 'bg-primary text-on-primary font-bold' : 'bg-surface hover:bg-surface-container text-on-surface-variant'
            }`}
          >
            Standard (&lt;400p)
          </button>
          <button 
            type="button"
            onClick={() => setMaxPages(950)}
            className={`page-pill px-2.5 py-1 text-[11px] font-label-archival rounded transition-colors cursor-pointer ${
              maxPages >= 600 ? 'bg-primary text-on-primary font-bold' : 'bg-surface hover:bg-surface-container text-on-surface-variant'
            }`}
          >
            Tome (600p+)
          </button>
        </div>
      </div>

      {/* Ex-Libris Seal Guarantee */}
      <div className="p-4 bg-secondary-fixed/30 rounded-xl flex items-start gap-3 border border-secondary/20">
        <span className="material-symbols-outlined text-secondary text-2xl mt-0.5 shrink-0">verified</span>
        <div>
          <h3 className="font-label-lg text-sm text-on-secondary-fixed font-semibold">Ex-Libris Digital Provenance</h3>
          <p className="font-body-sm text-xs text-on-secondary-fixed-variant mt-0.5 leading-relaxed">
            Every digitized volume in NovelShelf is calibrated for typographic fidelity, verified public domain accuracy, and distraction-free deep reading.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col w-full">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-10 w-full">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-secondary" />
              <span className="font-label-archival text-xs text-secondary tracking-widest uppercase font-bold">
                Archival Collections &amp; Digital Registry
              </span>
            </div>
            <h1 className="font-headline-lg text-2xl sm:text-headline-lg text-primary tracking-tight font-bold">
              Explore the Library
            </h1>
            <p className="font-body-md text-sm sm:text-body-md text-on-surface-variant max-w-2xl mt-1.5 leading-relaxed">
              Find your next favorite story among curated editions, timeless ideas, and public domain masterworks preserved in high-fidelity digital folios.
            </p>
          </div>

          {/* Curated Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-surface-container rounded-full self-start md:self-auto shadow-xs overflow-x-auto max-w-full">
            <button 
              onClick={() => { setActiveTab('all'); setCurrentPage(1); }}
              className={`px-3 sm:px-4 py-1.5 rounded-full font-label-md text-xs sm:text-label-md transition-all cursor-pointer whitespace-nowrap min-h-[36px] ${
                activeTab === 'all'
                  ? 'bg-primary text-on-primary shadow-xs font-semibold'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
              type="button"
            >
              All Volumes
            </button>
            <button 
              onClick={() => { setActiveTab('staff'); setCurrentPage(1); }}
              className={`px-3 sm:px-4 py-1.5 rounded-full font-label-md text-xs sm:text-label-md transition-all cursor-pointer whitespace-nowrap min-h-[36px] ${
                activeTab === 'staff'
                  ? 'bg-primary text-on-primary shadow-xs font-semibold'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
              type="button"
            >
              Recommendations
            </button>
            <button 
              onClick={() => { setActiveTab('awards'); setCurrentPage(1); }}
              className={`px-3 sm:px-4 py-1.5 rounded-full font-label-md text-xs sm:text-label-md transition-all cursor-pointer whitespace-nowrap min-h-[36px] ${
                activeTab === 'awards'
                  ? 'bg-primary text-on-primary shadow-xs font-semibold'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
              type="button"
            >
              Award Winners
            </button>
            <button 
              onClick={() => { setActiveTab('classics'); setCurrentPage(1); }}
              className={`px-3 sm:px-4 py-1.5 rounded-full font-label-md text-xs sm:text-label-md transition-all cursor-pointer whitespace-nowrap min-h-[36px] ${
                activeTab === 'classics'
                  ? 'bg-primary text-on-primary shadow-xs font-semibold'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
              type="button"
            >
              Public Domain
            </button>
          </div>
        </div>

        {/* Mobile Filter Toggle Button */}
        <div className="lg:hidden mb-4">
          <button 
            type="button"
            onClick={() => setIsMobileFilterOpen(prev => !prev)}
            className="w-full py-3 px-4 rounded-xl bg-surface-container-low border border-surface-variant/40 flex items-center justify-between text-primary font-label-lg text-sm shadow-xs min-h-[44px]"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">tune</span>
              <span>{isMobileFilterOpen ? 'Hide Catalog Filters' : 'Show Catalog Filters & Genres'}</span>
            </div>
            <span className="material-symbols-outlined text-lg">
              {isMobileFilterOpen ? 'expand_less' : 'expand_more'}
            </span>
          </button>
          {isMobileFilterOpen && (
            <div className="mt-3 animate-fade-in">
              {filtersContent}
            </div>
          )}
        </div>

        {/* 2-Column Catalog Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:flex lg:col-span-4 xl:col-span-3 flex-col gap-6 lg:sticky lg:top-28">
            {filtersContent}
          </aside>

          {/* Main Catalog View */}
          <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6 w-full min-w-0">
            
            {/* Active Filters & Controls Strip */}
            <div className="bg-surface-container-low rounded-xl p-3.5 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shadow-xs border border-surface-variant/40">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-label-md text-xs sm:text-label-md text-on-surface font-semibold mr-1">Active:</span>
                {selectedGenres.map(g => (
                  <div key={g} className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-surface-container-high text-primary font-label-md text-xs sm:text-label-md">
                    <span>{g}</span>
                    <button 
                      type="button" 
                      onClick={() => handleGenreToggle(g)}
                      className="hover:text-error transition-colors flex items-center cursor-pointer"
                      aria-label={`Remove filter ${g}`}
                    >
                      <span className="material-symbols-outlined text-xs">close</span>
                    </button>
                  </div>
                ))}
                {maxPages < 950 && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-surface-container-high text-primary font-label-md text-xs sm:text-label-md">
                    <span>Under {maxPages} pages</span>
                    <button 
                      type="button" 
                      onClick={() => setMaxPages(950)}
                      className="hover:text-error transition-colors flex items-center cursor-pointer"
                      aria-label="Remove page limit"
                    >
                      <span className="material-symbols-outlined text-xs">close</span>
                    </button>
                  </div>
                )}
                {searchQuery && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-surface-container-high text-primary font-label-md text-xs sm:text-label-md">
                    <span className="truncate max-w-[150px]">"{searchQuery}"</span>
                    <button 
                      type="button" 
                      onClick={() => setSearchQuery('')}
                      className="hover:text-error transition-colors flex items-center cursor-pointer"
                      aria-label="Clear search query"
                    >
                      <span className="material-symbols-outlined text-xs">close</span>
                    </button>
                  </div>
                )}
                <span className="text-on-surface-variant text-xs sm:text-body-sm font-body-sm ml-auto sm:ml-2">
                  Showing <strong>{filteredBooks.length}</strong> titles
                </span>
              </div>

              {/* View Toggle & Sort */}
              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-surface-variant/40">
                <div className="flex items-center gap-1 bg-surface rounded p-1 border border-surface-variant/50">
                  <button 
                    aria-label="Grid View" 
                    type="button"
                    onClick={() => setLayoutMode('grid')}
                    className={`p-1.5 rounded transition-all cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center ${
                      layoutMode === 'grid' 
                        ? 'bg-primary text-on-primary shadow-xs' 
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`} 
                  >
                    <span className="material-symbols-outlined text-sm">grid_view</span>
                  </button>
                  <button 
                    aria-label="Editorial List View" 
                    type="button"
                    onClick={() => setLayoutMode('list')}
                    className={`p-1.5 rounded transition-all cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center ${
                      layoutMode === 'list' 
                        ? 'bg-primary text-on-primary shadow-xs' 
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`} 
                  >
                    <span className="material-symbols-outlined text-sm">view_agenda</span>
                  </button>
                </div>

                <div className="relative">
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-surface rounded pl-3 pr-8 py-1.5 text-on-surface font-label-md text-xs sm:text-label-md appearance-none focus:outline-none focus:bg-surface-container-lowest cursor-pointer shadow-xs border border-surface-variant/50 min-h-[36px]" 
                  >
                    <option value="curator">Curator's Pick</option>
                    <option value="newest">Recently Registered</option>
                    <option value="rating">Highest Rated</option>
                    <option value="title">Title (A – Z)</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2 top-2.5 text-outline text-base pointer-events-none">
                    arrow_drop_down
                  </span>
                </div>
              </div>
            </div>

            {/* Catalog Grid / List */}
            {filteredBooks.length === 0 ? (
              <div className="py-16 sm:py-20 text-center flex flex-col items-center gap-3 bg-surface-container-low rounded-xl border border-surface-variant/40 px-4">
                <span className="material-symbols-outlined text-5xl text-outline">menu_book</span>
                <h3 className="font-headline-sm text-primary font-bold">No Volumes Match Filters</h3>
                <p className="font-body-md text-sm sm:text-base text-on-surface-variant max-w-md">
                  No catalog items found matching your current filters. Try relaxing genre parameters or search keywords.
                </p>
                <button 
                  onClick={handleResetFilters}
                  className="mt-3 px-5 py-2.5 bg-primary text-on-primary rounded-lg font-label-md text-sm hover:bg-primary-container transition-colors min-h-[44px]"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className={layoutMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6" : "grid grid-cols-1 gap-4"}>
                {paginatedBooks.map((book) => (
                  <BookCard key={book.id} book={book} layout={layoutMode} />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {filteredBooks.length > 0 && (
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-5 bg-surface-container-low rounded-xl shadow-xs border border-surface-variant/40">
                <div className="font-body-sm text-xs sm:text-body-sm text-on-surface-variant">
                  Page <span className="font-semibold text-primary">{currentPage}</span> of {totalPages} • {filteredBooks.length} volumes listed
                </div>
                <div className="flex items-center gap-1.5">
                  <button 
                    aria-label="Previous page" 
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className="w-8 h-8 rounded flex items-center justify-center bg-surface-container text-outline hover:text-on-surface transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer" 
                  >
                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                  </button>
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    return (
                      <button 
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded flex items-center justify-center font-label-md text-xs sm:text-label-md transition-colors cursor-pointer ${
                          currentPage === pageNum 
                            ? 'bg-primary text-on-primary font-bold shadow-xs' 
                            : 'bg-surface hover:bg-surface-container text-on-surface'
                        }`} 
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button 
                    aria-label="Next page" 
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className="w-8 h-8 rounded flex items-center justify-center bg-surface hover:bg-surface-container text-on-surface transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer" 
                  >
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                </div>
                <button 
                  type="button"
                  onClick={() => showToast(`Loaded complete catalog archives (${filteredBooks.length} volumes ready).`)}
                  className="px-4 py-2 bg-surface text-primary hover:bg-primary hover:text-on-primary font-label-md text-xs sm:text-label-md rounded-lg shadow-xs transition-all duration-200 flex items-center gap-2 cursor-pointer border border-surface-variant/40 min-h-[38px]" 
                >
                  <span className="material-symbols-outlined text-sm">unfold_more</span>
                  <span>Load More Volumes</span>
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
