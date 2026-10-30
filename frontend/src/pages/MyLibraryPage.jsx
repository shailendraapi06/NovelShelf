import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext';
import BookCard from '../components/books/BookCard';

export default function MyLibraryPage() {
  const { 
    books, 
    bookmarks, 
    readingState, 
    contributions, 
    showToast 
  } = useLibrary();

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'bookmarks';

  const setTab = (tabName) => {
    setSearchParams({ tab: tabName });
  };

  const bookmarkedBooks = books.filter(b => bookmarks.includes(b.id));

  // Current reading book
  const currentBook = books.find(b => b.id === readingState.currentBookId) || books[0];

  return (
    <div className="flex flex-col w-full">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-10 w-full">
        
        {/* Profile Dossier Header Card */}
        <section className="bg-surface-container-low rounded-2xl p-5 sm:p-8 md:p-10 mb-8 sm:mb-10 shadow-xs border border-surface-variant/40 flex flex-col md:flex-row items-center md:items-start justify-between gap-6 sm:gap-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDp08OgYNgPYSHRfe4XIgZYM-VeeI8dr83nCgVAI1dvpYyK0Yu_J3k2KMAfjD0toyHoywkmTzXVd8R5Uh4zqVwrafPBSUpHorEiTtvYaRH_YBn7hRvuhI3tcKD0fRZD9qJyhn8_bSFtBhzaxvMoTc1L9NLXBNO1c0IgS0sha5CpirnhczhD3s30M9XH6-FrUX6G1AgEtlcCnOZPFTPPgwnJiYTjILjPjUhoRvJWLxU"
              alt="Helena Vance"
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-4 ring-secondary/40 shadow-md shrink-0"
            />
            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <span className="font-label-archival text-[10px] sm:text-xs text-secondary uppercase font-bold tracking-widest">
                  Archival Custodian #412
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                <span className="font-label-archival text-[10px] sm:text-xs text-on-surface-variant uppercase">
                  Digital Sanctuary Guild
                </span>
              </div>
              <h1 className="font-headline-md text-2xl sm:text-headline-md text-primary font-bold font-serif">
                Helena Vance
              </h1>
              <p className="font-body-md text-xs sm:text-sm text-on-surface-variant max-w-lg mt-1 leading-relaxed">
                Avid reader of gothic literature, 20th-century speculative fiction, and rare public domain illuminated manuscripts.
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center justify-around sm:justify-center gap-4 sm:gap-8 bg-surface-container-lowest p-3.5 sm:p-6 rounded-xl shadow-xs border border-surface-variant/50 w-full sm:w-auto shrink-0">
            <div className="text-center">
              <span className="font-headline-sm text-xl sm:text-headline-sm text-primary font-bold font-serif">
                {bookmarks.length}
              </span>
              <span className="font-label-archival text-[9px] sm:text-[10px] text-on-surface-variant uppercase block mt-0.5">
                Bookmarks
              </span>
            </div>
            <div className="h-7 sm:h-8 w-px bg-surface-variant" />
            <div className="text-center">
              <span className="font-headline-sm text-xl sm:text-headline-sm text-secondary font-bold font-serif">
                14
              </span>
              <span className="font-label-archival text-[9px] sm:text-[10px] text-on-surface-variant uppercase block mt-0.5">
                Completed
              </span>
            </div>
            <div className="h-7 sm:h-8 w-px bg-surface-variant" />
            <div className="text-center">
              <span className="font-headline-sm text-xl sm:text-headline-sm text-primary font-bold font-serif">
                42h
              </span>
              <span className="font-label-archival text-[9px] sm:text-[10px] text-on-surface-variant uppercase block mt-0.5">
                In Reader
              </span>
            </div>
          </div>
        </section>

        {/* Dashboard Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-surface-variant mb-6 sm:mb-8 overflow-x-auto pb-px">
          {[
            { id: 'bookmarks', label: 'Archival Bookmarks', icon: 'bookmark', count: bookmarks.length },
            { id: 'reading', label: 'Currently Reading', icon: 'auto_stories' },
            { id: 'contributions', label: 'My Contributions', icon: 'history_edu', count: contributions.length },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setTab(tab.id)}
              className={`flex items-center gap-2 px-4 sm:px-5 py-3 font-label-md text-xs sm:text-sm border-b-2 font-semibold transition-all cursor-pointer whitespace-nowrap min-h-[44px] ${
                activeTab === tab.id
                  ? 'border-primary text-primary bg-surface-container-high/40 rounded-t-lg'
                  : 'border-transparent text-on-surface-variant hover:text-primary hover:border-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-base sm:text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-label-archival ${
                  activeTab === tab.id ? 'bg-primary text-on-primary' : 'bg-surface-container text-outline'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab 1: Bookmarks */}
        {activeTab === 'bookmarks' && (
          <div>
            {bookmarkedBooks.length === 0 ? (
              <div className="py-16 sm:py-20 text-center flex flex-col items-center gap-3 bg-surface-container-low rounded-2xl border border-surface-variant/40 px-4">
                <span className="material-symbols-outlined text-5xl text-outline">bookmark_border</span>
                <h3 className="font-headline-sm text-primary font-bold font-serif">No Bookmarks Placed Yet</h3>
                <p className="font-body-md text-sm sm:text-base text-on-surface-variant max-w-sm">
                  Explore our curated collections and click the ribbon bookmark to save titles to your private reading shelf.
                </p>
                <Link to="/explore" className="mt-3 px-6 py-2.5 bg-primary text-on-primary rounded-lg font-label-md text-sm font-semibold min-h-[44px] flex items-center justify-center">
                  Browse Catalog
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {bookmarkedBooks.map(book => (
                  <BookCard key={book.id} book={book} layout="grid" />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Currently Reading */}
        {activeTab === 'reading' && (
          <div className="flex flex-col gap-6 sm:gap-8">
            <div className="bg-surface-container-low rounded-2xl p-5 sm:p-8 border border-surface-variant/40 shadow-xs flex flex-col md:flex-row items-center gap-6 sm:gap-8 justify-between">
              <div className="flex items-center gap-4 sm:gap-6 w-full md:w-auto">
                <img 
                  src={currentBook.coverImage} 
                  alt={currentBook.title}
                  className="w-20 sm:w-28 aspect-[3/4] object-cover rounded-lg shadow-md shrink-0" 
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded bg-primary-fixed text-primary font-label-archival text-[9px] sm:text-[10px] uppercase font-bold">
                      In Sanctuary Session
                    </span>
                    <span className="font-label-archival text-[10px] sm:text-xs text-outline">
                      Page 42 of 512
                    </span>
                  </div>
                  <h2 className="font-headline-md text-lg sm:text-2xl text-primary font-serif font-bold truncate">
                    {currentBook.title}
                  </h2>
                  <p className="font-body-sm text-xs sm:text-sm text-on-surface-variant truncate">
                    {currentBook.author} • Chapter IV: The Cemetery of Forgotten Books
                  </p>

                  <div className="mt-3 sm:mt-4 w-full sm:w-72">
                    <div className="flex items-center justify-between text-xs font-label-archival mb-1 text-on-surface-variant">
                      <span>Progress</span>
                      <span className="font-bold text-secondary">8.4% completed</span>
                    </div>
                    <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{ width: '8.4%' }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full md:w-auto">
                <Link 
                  to={`/reader/${currentBook.id}`}
                  className="w-full sm:w-auto px-6 py-3.5 bg-primary text-on-primary hover:bg-primary-container rounded-lg font-label-md text-sm font-semibold text-center shadow-md flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <span className="material-symbols-outlined text-base">chrome_reader_mode</span>
                  <span>Continue Reading</span>
                </Link>
                <Link 
                  to={`/books/${currentBook.id}`}
                  className="w-full sm:w-auto px-5 py-3.5 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg font-label-md text-sm font-semibold text-center min-h-[44px] flex items-center justify-center"
                >
                  Volume Dossier
                </Link>
              </div>
            </div>

            {/* Reading Goals & Stats Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-surface-container-lowest p-5 rounded-xl border border-surface-variant/40 shadow-xs flex items-center gap-4">
                <span className="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-xl shrink-0">
                  <span className="material-symbols-outlined">schedule</span>
                </span>
                <div>
                  <p className="font-label-archival text-[10px] text-outline uppercase font-bold">Daily Reading Time</p>
                  <h4 className="font-headline-sm text-lg font-bold text-primary">38 Mins</h4>
                  <p className="font-body-sm text-xs text-on-surface-variant">Goal: 45 mins / day</p>
                </div>
              </div>

              <div className="bg-surface-container-lowest p-5 rounded-xl border border-surface-variant/40 shadow-xs flex items-center gap-4">
                <span className="w-12 h-12 rounded-full bg-primary-container text-on-primary flex items-center justify-center text-xl shrink-0">
                  <span className="material-symbols-outlined">menu_book</span>
                </span>
                <div>
                  <p className="font-label-archival text-[10px] text-outline uppercase font-bold">Pages Completed</p>
                  <h4 className="font-headline-sm text-lg font-bold text-primary">1,248 Pages</h4>
                  <p className="font-body-sm text-xs text-on-surface-variant">Across 6 volumes this month</p>
                </div>
              </div>

              <div className="bg-surface-container-lowest p-5 rounded-xl border border-surface-variant/40 shadow-xs flex items-center gap-4">
                <span className="w-12 h-12 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center text-xl shrink-0">
                  <span className="material-symbols-outlined">emoji_events</span>
                </span>
                <div>
                  <p className="font-label-archival text-[10px] text-outline uppercase font-bold">Curator Rank</p>
                  <h4 className="font-headline-sm text-lg font-bold text-primary">Tier II Archivist</h4>
                  <p className="font-body-sm text-xs text-on-surface-variant">Verified by Sanctuary Guild</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Contributions */}
        {activeTab === 'contributions' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <h2 className="font-headline-sm text-xl text-primary font-serif font-bold">
                My Digital Contributions &amp; Archives
              </h2>
              <Link 
                to="/contribute"
                className="px-4 py-2 bg-primary text-on-primary rounded-lg font-label-md text-xs sm:text-sm font-semibold hover:bg-primary-container transition-colors min-h-[40px] flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">add_circle</span>
                <span>Contribute Another Folio</span>
              </Link>
            </div>

            {contributions.length === 0 ? (
              <div className="py-16 sm:py-20 text-center flex flex-col items-center gap-3 bg-surface-container-low rounded-2xl border border-surface-variant/40 px-4">
                <span className="material-symbols-outlined text-5xl text-outline">history_edu</span>
                <h3 className="font-headline-sm text-primary font-bold font-serif">No Volumes Contributed Yet</h3>
                <p className="font-body-md text-sm sm:text-base text-on-surface-variant max-w-sm">
                  Share rare public domain literature, transcripts, and forgotten manuscripts with the NovelShelf community.
                </p>
                <Link to="/contribute" className="mt-3 px-6 py-2.5 bg-primary text-on-primary rounded-lg font-label-md text-sm font-semibold min-h-[44px] flex items-center justify-center">
                  Contribute Folio
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {contributions.map((c) => (
                  <div 
                    key={c.id} 
                    className="p-5 sm:p-6 bg-surface-container-low rounded-xl border border-surface-variant/40 shadow-xs flex flex-col justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-archival text-[10px] font-bold uppercase">
                          {c.type || 'Digital Archive Edition'}
                        </span>
                        <span className="font-label-archival text-[10px] text-outline">
                          {c.date}
                        </span>
                      </div>
                      <h3 className="font-title-editorial text-base sm:text-lg text-primary font-bold font-serif">
                        {c.title}
                      </h3>
                      <p className="font-body-sm text-xs sm:text-sm text-on-surface-variant">
                        {c.author} • {c.edition || 'Archive Scan'}
                      </p>

                      {/* PDF Document Attachment Badge */}
                      {c.pdfName && (
                        <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-surface-container/80 border border-surface-variant/40 mt-3">
                          <span className="material-symbols-outlined text-red-600 text-xl shrink-0">picture_as_pdf</span>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-label-md text-primary font-semibold truncate">{c.pdfName}</p>
                            <p className="text-[10px] font-label-archival text-outline">{c.pdfSize || 'Digital Folio'} • PDF Scan Verified</p>
                          </div>
                          {c.pdfUrl ? (
                            <a 
                              href={c.pdfUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              className="px-2.5 py-1 bg-surface rounded text-primary hover:bg-primary hover:text-on-primary font-label-md text-[11px] font-semibold transition-colors shrink-0"
                            >
                              Open PDF
                            </a>
                          ) : (
                            <button 
                              type="button"
                              onClick={() => showToast(`Opening archival PDF reader for "${c.title}"...`)}
                              className="px-2.5 py-1 bg-surface rounded text-primary hover:bg-primary hover:text-on-primary font-label-md text-[11px] font-semibold transition-colors shrink-0"
                            >
                              Open PDF
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-surface-variant/40 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-xs text-primary font-label-md font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {c.status || 'Archived in Registry'}
                      </span>
                      <button 
                        type="button" 
                        onClick={() => showToast(`Archival record for "${c.title}" verified in registry.`)}
                        className="text-xs font-label-md text-secondary hover:text-primary font-semibold cursor-pointer"
                      >
                        Inspect Record
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
