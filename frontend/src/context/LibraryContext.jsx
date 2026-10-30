import React, { createContext, useContext, useState, useEffect } from 'react';
import { BOOKS as STATIC_BOOKS, INITIAL_NOTIFICATIONS } from '../data/booksData';
import { api } from '../services/api';

const LibraryContext = createContext();

export function LibraryProvider({ children }) {
  // Books state: initial static books, updated asynchronously from backend API
  const [books, setBooks] = useState(STATIC_BOOKS);

  const fetchBooks = async () => {
    try {
      const res = await api.getBooks({ limit: 100 });
      if (res && res.books && res.books.length > 0) {
        // Merge with static data to preserve rich attributes (spreads, cover images)
        const merged = res.books.map(apiBook => {
          const staticMatch = STATIC_BOOKS.find(sb => sb.id === apiBook.slug || sb.id === apiBook.id);
          return {
            ...(staticMatch || {}),
            ...apiBook,
            id: apiBook.slug || apiBook.id || apiBook._id
          };
        });
        setBooks(merged);
      }
    } catch (err) {
      console.warn('Using static catalogue fallback:', err.message);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // 1. Bookmarks
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      const saved = localStorage.getItem('novelshelf_bookmarks') || localStorage.getItem('bookverse_bookmarks');
      return saved ? JSON.parse(saved) : ['shadow-of-the-wind', 'piranesi'];
    } catch {
      return ['shadow-of-the-wind', 'piranesi'];
    }
  });

  // 2. Reading state
  const [readingState, setReadingState] = useState(() => {
    try {
      const saved = localStorage.getItem('novelshelf_reading') || localStorage.getItem('bookverse_reading');
      return saved ? JSON.parse(saved) : {
        currentBookId: 'shadow-of-the-wind',
        currentPage: 42,
        totalPages: 512,
        chapter: 'Chapter IV: The Cemetery of Forgotten Books',
        spreadIndex: 0,
        isDogEared: false,
      };
    } catch {
      return {
        currentBookId: 'shadow-of-the-wind',
        currentPage: 42,
        totalPages: 512,
        chapter: 'Chapter IV: The Cemetery of Forgotten Books',
        spreadIndex: 0,
        isDogEared: false,
      };
    }
  });

  // 3. Reader appearance preferences
  const [readerSettings, setReaderSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('novelshelf_reader_settings') || localStorage.getItem('bookverse_reader_settings');
      return saved ? JSON.parse(saved) : {
        theme: 'parchment', // parchment | sepia | forest
        fontClass: 'font-reader-playfair',
        fontSize: 'md', // sm | md | lg | xl
        leading: 'relaxed', // compact | relaxed | loose
        spreadWidth: 'reader-width-standard', // reader-width-narrow | reader-width-standard | reader-width-expansive
        ambientSound: true,
        ambientVolume: 45,
      };
    } catch {
      return {
        theme: 'parchment',
        fontClass: 'font-reader-playfair',
        fontSize: 'md',
        leading: 'relaxed',
        spreadWidth: 'reader-width-standard',
        ambientSound: true,
        ambientVolume: 45,
      };
    }
  });

  // 4. Digital User contributions
  const [contributions, setContributions] = useState(() => {
    try {
      const saved = localStorage.getItem('novelshelf_contributions') || localStorage.getItem('bookverse_contributions');
      return saved ? JSON.parse(saved) : [
        {
          id: 'contrib-1',
          title: 'The Aleph and Other Stories',
          author: 'Jorge Luis Borges',
          genre: 'Fiction',
          year: 1949,
          pages: 210,
          type: 'Digital Archive PDF',
          date: '2026-10-25',
          status: 'Under Review',
          edition: 'Emecé Editores 1952 (High-Res Folio Scan)',
          license: 'Public Domain (Universal)',
          pdfName: 'Borges_The_Aleph_1952_Archive.pdf',
          pdfSize: '14.8 MB',
          synopsis: 'A canonical Argentine masterwork exploring infinity, labyrinths, and literary enigmas.'
        }
      ];
    } catch {
      return [];
    }
  });

  // 5. Notifications
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('novelshelf_notifications') || localStorage.getItem('bookverse_notifications');
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  // 6. Toast notification
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  // Persistence effects
  useEffect(() => {
    try {
      localStorage.setItem('novelshelf_bookmarks', JSON.stringify(bookmarks));
    } catch {}
  }, [bookmarks]);

  useEffect(() => {
    try {
      localStorage.setItem('novelshelf_reading', JSON.stringify(readingState));
    } catch {}
  }, [readingState]);

  useEffect(() => {
    try {
      localStorage.setItem('novelshelf_reader_settings', JSON.stringify(readerSettings));
    } catch {}
  }, [readerSettings]);

  useEffect(() => {
    try {
      localStorage.setItem('novelshelf_contributions', JSON.stringify(contributions));
    } catch {}
  }, [contributions]);

  useEffect(() => {
    try {
      localStorage.setItem('novelshelf_notifications', JSON.stringify(notifications));
    } catch {}
  }, [notifications]);

  // Toast trigger
  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3200);
  };

  // Actions
  const toggleBookmark = (bookId) => {
    const isSaved = bookmarks.includes(bookId);
    let updated;
    const book = books.find(b => b.id === bookId);
    const title = book ? book.title : 'Volume';

    if (isSaved) {
      updated = bookmarks.filter(id => id !== bookId);
      showToast(`Removed "${title}" from Archival Bookmarks.`);
      // Sync removal to backend if logged in
      api.removeBookmark(bookId).catch(() => {});
    } else {
      updated = [...bookmarks, bookId];
      showToast(`Saved "${title}" with archival silk ribbon.`);
      // Sync to backend if logged in
      api.addBookmark({ bookId, page: 1 }).catch(() => {});
    }
    setBookmarks(updated);
  };

  const isBookmarked = (bookId) => bookmarks.includes(bookId);

  const updateReaderSettings = (newSettings) => {
    setReaderSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetReaderSettings = () => {
    const defaults = {
      theme: 'parchment',
      fontClass: 'font-reader-playfair',
      fontSize: 'md',
      leading: 'relaxed',
      spreadWidth: 'reader-width-standard',
      ambientSound: true,
      ambientVolume: 45,
    };
    setReaderSettings(defaults);
  };

  const addContribution = (contribution) => {
    const newContrib = {
      id: `contrib-${Date.now()}`,
      ...contribution,
      date: new Date().toISOString().split('T')[0],
      status: 'Under Review'
    };
    setContributions(prev => [newContrib, ...prev]);
    showToast(`"${contribution.title}" submitted to quarantine for curator verification!`, 'success');
  };

  const markNotificationRead = (notifId) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, unread: false } : n));
  };

  const clearAllNotifications = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    showToast('All notifications marked as read.');
  };

  return (
    <LibraryContext.Provider
      value={{
        books,
        refreshBooks: fetchBooks,
        bookmarks,
        toggleBookmark,
        isBookmarked,
        readingState,
        setReadingState,
        readerSettings,
        updateReaderSettings,
        resetReaderSettings,
        contributions,
        setContributions,
        addContribution,
        notifications,
        markNotificationRead,
        clearAllNotifications,
        toast,
        showToast
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
}
