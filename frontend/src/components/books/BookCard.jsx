import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLibrary } from '../../context/LibraryContext';

export default function BookCard({ book, layout = 'grid' }) {
  const { isBookmarked, toggleBookmark } = useLibrary();
  const navigate = useNavigate();
  const bookmarked = isBookmarked(book.id);

  if (layout === 'list') {
    return (
      <article className="book-card group relative bg-surface-container-lowest rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between border border-surface-variant/40">
        <div className="flex items-center gap-4 min-w-0">
          <Link to={`/books/${book.id}`} className="relative w-20 sm:w-24 aspect-[3/4] rounded-lg overflow-hidden bg-surface-container-high shadow-md shrink-0 group-hover:scale-102 transition-transform">
            <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
            <div className="absolute inset-y-0 left-0 w-2.5 bg-gradient-to-r from-black/40 to-transparent pointer-events-none" />
          </Link>
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-surface-container rounded font-label-archival text-label-archival uppercase text-secondary">
                {book.genre}
              </span>
              <span className="font-label-archival text-label-archival text-outline">
                {book.year} • {book.pages}p
              </span>
            </div>
            <Link to={`/books/${book.id}`}>
              <h4 className="font-headline-sm text-headline-sm text-primary tracking-tight truncate group-hover:text-secondary transition-colors font-semibold">
                {book.title}
              </h4>
            </Link>
            <p className="font-body-sm text-body-sm text-on-surface-variant -mt-0.5">{book.author}</p>
            <p className="font-body-sm text-xs text-on-surface/80 line-clamp-1 italic mt-1">
              "{book.quote}"
            </p>
          </div>
        </div>

        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-surface-variant/60">
          <div className="flex items-center gap-1 text-secondary">
            <span className="material-symbols-outlined text-sm fill-1">star</span>
            <span className="font-label-md text-label-md font-bold text-on-surface">{book.rating}</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); toggleBookmark(book.id); }}
              className={`p-2 rounded-full transition-colors ${
                bookmarked 
                  ? 'bg-secondary text-on-secondary' 
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
              }`}
              title={bookmarked ? "Remove Bookmark" : "Bookmark Volume"}
            >
              <span className={`material-symbols-outlined text-base ${bookmarked ? 'fill-1' : ''}`}>
                {bookmarked ? 'bookmark' : 'bookmark_border'}
              </span>
            </button>
            <Link 
              to={`/reader/${book.id}`}
              className="px-3.5 py-1.5 bg-primary text-on-primary hover:bg-primary-container rounded font-label-md text-label-md transition-colors"
            >
              Read
            </Link>
            <Link 
              to={`/books/${book.id}`}
              className="px-3.5 py-1.5 bg-surface-container text-primary hover:bg-surface-container-high rounded font-label-md text-label-md transition-colors"
            >
              Details
            </Link>
          </div>
        </div>
      </article>
    );
  }

  // Grid layout matching Google Stitch
  return (
    <article className="book-card group relative bg-surface-container-lowest rounded-xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
      {/* Cover Image Container */}
      <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden bg-surface-container-high shadow-md">
        <img 
          src={book.coverImage} 
          alt={book.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        />
        {/* Book Spine Crease Simulation */}
        <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/40 via-black/10 to-transparent pointer-events-none" />

        {/* Top-Right Bookmark Button */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-10">
          <button 
            type="button"
            aria-label="Save Volume"
            onClick={(e) => { e.stopPropagation(); toggleBookmark(book.id); }}
            className={`p-1.5 rounded-full backdrop-blur-md shadow-sm transition-colors ${
              bookmarked 
                ? 'bg-secondary text-surface' 
                : 'bg-surface/85 text-on-surface hover:text-secondary'
            }`}
          >
            <span className={`material-symbols-outlined text-base ${bookmarked ? 'fill-1' : ''}`}>
              {bookmarked ? 'bookmark' : 'bookmark_border'}
            </span>
          </button>
        </div>

        {/* Hover Overlay with Quote and CTAs */}
        <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3 p-6 text-center backdrop-blur-xs z-10">
          <p className="text-surface font-body-sm text-body-sm line-clamp-3 italic">
            "{book.quote}"
          </p>
          <div className="flex items-center gap-2 pt-2">
            <Link 
              to={`/reader/${book.id}`}
              className="px-3.5 py-1.5 bg-surface text-primary font-label-md text-label-md rounded hover:bg-secondary-fixed transition-colors font-semibold"
            >
              Read Now
            </Link>
            <Link 
              to={`/books/${book.id}`}
              className="px-3 py-1.5 bg-surface/20 text-surface font-label-md text-label-md rounded hover:bg-surface/30 transition-colors"
            >
              Details
            </Link>
          </div>
        </div>
      </div>

      {/* Book Metadata Dossier */}
      <div className="pt-4 flex flex-col gap-2 flex-grow">
        <div className="flex items-center justify-between gap-2">
          <span className="px-2 py-0.5 bg-surface-container rounded font-label-archival text-label-archival uppercase text-secondary">
            {book.genre}
          </span>
          <div className="flex items-center gap-1 text-secondary">
            <span className="material-symbols-outlined text-sm fill-1">star</span>
            <span className="font-label-md text-label-md font-bold text-on-surface">{book.rating}</span>
          </div>
        </div>

        <Link to={`/books/${book.id}`}>
          <h4 className="font-headline-sm text-headline-sm text-primary tracking-tight line-clamp-1 group-hover:text-secondary transition-colors font-semibold">
            {book.title}
          </h4>
        </Link>
        <p className="font-body-sm text-body-sm text-on-surface-variant -mt-1">{book.author}</p>

        <div className="pt-2 mt-auto flex items-center justify-between border-t-0">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-fixed/40 text-primary font-label-archival text-label-archival uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            {book.badge || 'Instant Digital Access'}
          </span>
          <span className="font-label-archival text-label-archival text-outline">
            {book.year} • {book.pages}p
          </span>
        </div>
      </div>
    </article>
  );
}
