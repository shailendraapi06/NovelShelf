import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useLibrary } from '../../context/LibraryContext';
import { useAuth } from '../../context/AuthContext';
import NotificationsModal from './NotificationsModal';

export default function Header() {
  const { books, bookmarks, notifications, showToast } = useLibrary();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchTray, setShowSearchTray] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const profileRef = useRef(null);

  const unreadCount = notifications.filter(n => n.unread).length;
  const bookmarkCount = bookmarks?.length || 0;

  const searchResults = searchQuery.trim() 
    ? books.filter(b => 
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.genre.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchTray(false);
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(event.target)) {
        setShowMobileSearch(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchTray(false);
      setShowMobileSearch(false);
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
    setIsMobileMenuOpen(false);
    showToast('Signed out of NovelShelf sanctuary.');
    navigate('/');
  };

  const navLinkClass = ({ isActive }) =>
    isActive
      ? "px-3 py-1.5 transition-colors bg-primary-container text-on-primary font-label-lg rounded text-sm whitespace-nowrap"
      : "px-3 py-1.5 text-on-surface-variant hover:text-on-surface transition-colors font-label-lg text-sm whitespace-nowrap";

  return (
    <>
      <header className="fixed top-0 left-0 right-0 w-full z-50 bg-surface/95 backdrop-blur-xl border-b border-surface-variant/40 shadow-[0_1px_8px_rgba(23,63,55,0.06)]">
        <div className="h-16 sm:h-20 max-w-[1360px] mx-auto px-3 sm:px-6 lg:px-10 flex items-center justify-between gap-2 sm:gap-4 w-full">
          
          {/* Left: Logo & Brand */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 shrink-0">
            <Link to="/" className="flex items-center gap-2 sm:gap-3 group shrink-0">
              <img 
                alt="NovelShelf Logo" 
                className="h-7 sm:h-8 w-auto object-contain" 
                src="https://lh3.googleusercontent.com/aida/AEtjO1XSG8w1QlhIUBtGm-XjL-3wwSnRShu5-y4H1Obl4qB0Ie4R2DNAiuGGCLWepWTxsGcRrQXxeQmjG4cgpMmCNVjkfrtzmI2n-Ktx-RKQZE4tpdEEYn1mIwChldm_pCVOv8zqgiGjlik4wyjDYPNTWaEQFH5N4vY1ysfLjLWycmoqgI4nWmTntpRr-5QDIO2oBDd2YBGKUITcuzEjk6E184CpBexmm0nA5eXUwbcB6Ks"
              />
              <div className="flex flex-col min-w-0">
                <span className="font-title-editorial text-lg sm:text-title-editorial text-primary tracking-tight group-hover:text-secondary transition-colors truncate leading-tight">
                  NovelShelf
                </span>
                <span className="font-label-archival text-[9px] sm:text-[10px] text-secondary tracking-widest uppercase -mt-0.5 hidden xs:block">
                  Digital Sanctuary
                </span>
              </div>
            </Link>

            {/* Desktop Quick Header Search (visible on lg+) */}
            <div ref={searchRef} className="relative hidden lg:flex items-center w-52 xl:w-64 ml-2">
              <span className="material-symbols-outlined absolute left-3 text-outline text-lg pointer-events-none">
                search
              </span>
              <form onSubmit={handleSearchSubmit} className="w-full">
                <input 
                  className="w-full pl-9 pr-3 py-1.5 bg-surface-container-high/70 rounded-full text-on-surface placeholder:text-outline text-body-sm font-body-sm focus:outline-none focus:ring-1 focus:ring-primary focus:bg-surface-container-lowest transition-all text-xs" 
                  placeholder="Search folios, authors..." 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchTray(true);
                  }}
                  onFocus={() => setShowSearchTray(true)}
                />
              </form>

              {/* Instant Search Results Tray */}
              {showSearchTray && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-surface-container-lowest rounded-xl shadow-xl border border-surface-variant p-2 z-50 animate-fade-in">
                  <div className="text-[10px] uppercase font-label-archival text-outline px-2 py-1 tracking-wider">
                    Quick Suggestions
                  </div>
                  {searchResults.map(b => (
                    <button
                      key={b.id}
                      onClick={() => {
                        setShowSearchTray(false);
                        navigate(`/books/${b.id}`);
                      }}
                      className="w-full text-left px-2.5 py-1.5 hover:bg-surface-container rounded-lg flex items-center justify-between text-xs transition-colors"
                    >
                      <div className="truncate">
                        <span className="font-medium text-primary block truncate">{b.title}</span>
                        <span className="text-[11px] text-outline truncate">{b.author}</span>
                      </div>
                      <span className="material-symbols-outlined text-outline text-sm shrink-0 ml-2">
                        north_east
                      </span>
                    </button>
                  ))}
                  <button
                    onClick={handleSearchSubmit}
                    className="w-full text-center py-1.5 mt-1 border-t border-surface-variant text-[11px] font-semibold text-secondary hover:underline"
                  >
                    View all matching folios &rarr;
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Center Navigation Links (visible on md+) */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <NavLink to="/" end className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/explore" className={navLinkClass}>
              Explore Catalog
            </NavLink>
            <NavLink to="/reader/shadow-of-the-wind" className={navLinkClass}>
              Reading Room
            </NavLink>
            <NavLink to="/contribute" className={navLinkClass}>
              Contribute
            </NavLink>
            {isAdmin && (
              <NavLink 
                to="/admin" 
                className={({ isActive }) =>
                  isActive
                    ? "px-3 py-1.5 bg-secondary text-on-secondary font-label-lg rounded text-sm whitespace-nowrap flex items-center gap-1 shadow-sm font-semibold"
                    : "px-3 py-1.5 text-secondary hover:bg-secondary/10 font-label-lg text-sm whitespace-nowrap flex items-center gap-1 border border-secondary/30 rounded font-semibold"
                }
              >
                <span className="material-symbols-outlined text-base">admin_panel_settings</span>
                <span>Admin</span>
              </NavLink>
            )}
          </nav>

          {/* Right: Actions, Notifications, My Library & Profile/Auth */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Mobile Search Toggle (visible on < lg) */}
            <button 
              aria-label="Search" 
              onClick={() => setShowMobileSearch(prev => !prev)}
              className="lg:hidden p-2 text-on-surface-variant hover:text-on-surface rounded-full transition-colors flex items-center justify-center" 
              type="button"
            >
              <span className="material-symbols-outlined text-xl">search</span>
            </button>

            {/* Notification Bell */}
            <button 
              aria-label="Notifications" 
              onClick={() => setShowNotifications(true)}
              className="relative p-2 text-on-surface-variant hover:text-on-surface rounded-full transition-colors flex items-center justify-center" 
              type="button"
            >
              <span className="material-symbols-outlined text-xl">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-secondary rounded-full ring-2 ring-surface" />
              )}
            </button>

            {/* MY LIBRARY BUTTON */}
            <Link 
              to="/my-library"
              aria-label="My Library & Archival Bookmarks"
              title="My Library & Bookmarks"
              className="inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-primary text-on-primary hover:bg-primary-container active:scale-95 font-label-lg text-xs sm:text-sm rounded-lg transition-all shadow-[0_2px_8px_rgba(23,63,55,0.2)] shrink-0 min-h-[36px] sm:min-h-[40px]"
            >
              <span className="material-symbols-outlined text-lg sm:text-base leading-none">auto_stories</span>
              <span className="hidden sm:inline font-medium tracking-tight">My Library</span>
              {bookmarkCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold bg-secondary text-on-secondary rounded-full leading-none">
                  {bookmarkCount}
                </span>
              )}
            </Link>

            <div className="h-5 sm:h-6 w-px bg-outline-variant/60 hidden xs:block" />

            {/* Auth Buttons or Profile Avatar */}
            {isAuthenticated ? (
              <div ref={profileRef} className="relative shrink-0">
                <button 
                  onClick={() => setShowProfileMenu(prev => !prev)}
                  className="flex items-center gap-1.5 rounded-full focus:outline-none focus:ring-2 focus:ring-secondary p-0.5 hover:ring-1 hover:ring-primary/40 transition-all"
                  aria-label="User Profile"
                >
                  <img 
                    alt={user.name} 
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-1 ring-outline-variant hover:scale-105 transition-transform" 
                    src={user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256"}
                  />
                  <span className="hidden xl:inline text-xs font-semibold text-primary max-w-[100px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                  <span className="material-symbols-outlined text-sm text-outline hidden xl:inline">
                    expand_more
                  </span>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-3 w-64 rounded-xl bg-surface-container-lowest p-2 shadow-2xl ring-1 ring-outline-variant/50 z-50 animate-fade-in border border-surface-variant/40">
                    <div className="px-3 py-2.5 border-b border-surface-variant/60 bg-surface-container-high/20 rounded-t-lg">
                      <div className="flex items-center justify-between">
                        <p className="font-label-lg text-sm text-primary font-bold truncate">{user.name}</p>
                        {isAdmin ? (
                          <span className="text-[9px] px-1.5 py-0.5 bg-secondary text-on-secondary rounded-full font-bold uppercase tracking-wider">
                            Archivist
                          </span>
                        ) : (
                          <span className="text-[9px] px-1.5 py-0.5 bg-surface-container-highest text-on-surface-variant rounded-full font-medium">
                            Patron
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-outline truncate mt-0.5">{user.email}</p>
                    </div>

                    <div className="py-1">
                      {isAdmin && (
                        <Link 
                          to="/admin" 
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-body-sm text-secondary font-semibold hover:bg-secondary/10 transition-colors"
                        >
                          <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
                          <span>Admin Dashboard</span>
                        </Link>
                      )}
                      <Link 
                        to="/my-library" 
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-body-sm text-on-surface hover:bg-surface-container transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg text-primary">auto_stories</span>
                        <span>My Library &amp; Bookmarks</span>
                      </Link>
                      <Link 
                        to="/reader/shadow-of-the-wind" 
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-body-sm text-on-surface hover:bg-surface-container transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg text-secondary">menu_book</span>
                        <span>Resume Reading</span>
                      </Link>
                      <Link 
                        to="/contribute" 
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-body-sm text-on-surface hover:bg-surface-container transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg text-primary">post_add</span>
                        <span>Contribute Digital Folio</span>
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-surface-variant/60">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-body-sm text-error hover:bg-error/10 transition-colors text-left font-medium"
                      >
                        <span className="material-symbols-outlined text-lg">logout</span>
                        <span>Sign Out of Sanctuary</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link
                  to="/login"
                  className="px-2.5 sm:px-3.5 py-1.5 text-xs sm:text-sm font-label-lg font-medium text-primary hover:text-secondary hover:bg-primary/5 rounded-lg transition-colors whitespace-nowrap"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-2.5 sm:px-3.5 py-1.5 text-xs sm:text-sm font-label-lg font-semibold bg-secondary text-on-secondary hover:bg-secondary/90 rounded-lg shadow-sm transition-all whitespace-nowrap"
                >
                  Join
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Toggle (visible on < md) */}
            <button 
              onClick={() => setIsMobileMenuOpen(prev => !prev)}
              className="p-1.5 md:hidden text-primary hover:text-secondary transition-colors rounded-lg flex items-center justify-center shrink-0"
              aria-label="Toggle Navigation Menu"
            >
              <span className="material-symbols-outlined text-2xl">
                {isMobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Search Overlay Bar */}
        {showMobileSearch && (
          <div ref={mobileSearchRef} className="lg:hidden border-t border-surface-variant bg-surface px-4 py-2.5 shadow-md animate-fade-in">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-outline text-lg pointer-events-none">
                search
              </span>
              <input 
                className="w-full pl-9 pr-8 py-2 bg-surface-container-high rounded-lg text-on-surface placeholder:text-outline text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Search folios, authors, rare manuscripts..."
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  type="button" 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 text-outline hover:text-on-surface p-1"
                >
                  <span className="material-symbols-outlined text-sm">clear</span>
                </button>
              )}
            </form>
          </div>
        )}

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-surface-variant bg-surface px-5 py-4 shadow-xl animate-fade-in flex flex-col gap-2">
            <NavLink 
              to="/" 
              end
              onClick={() => setIsMobileMenuOpen(false)}
              className={navLinkClass}
            >
              Home
            </NavLink>
            <NavLink 
              to="/explore" 
              onClick={() => setIsMobileMenuOpen(false)}
              className={navLinkClass}
            >
              Explore Catalog
            </NavLink>
            <NavLink 
              to="/reader/shadow-of-the-wind" 
              onClick={() => setIsMobileMenuOpen(false)}
              className={navLinkClass}
            >
              Reading Room
            </NavLink>
            <NavLink 
              to="/contribute" 
              onClick={() => setIsMobileMenuOpen(false)}
              className={navLinkClass}
            >
              Contribute Digital Folio
            </NavLink>
            <NavLink 
              to="/my-library" 
              onClick={() => setIsMobileMenuOpen(false)}
              className={navLinkClass}
            >
              My Library &amp; Bookmarks ({bookmarkCount})
            </NavLink>
            {isAdmin && (
              <NavLink 
                to="/admin" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-1.5 bg-secondary text-on-secondary font-label-lg rounded text-sm flex items-center gap-1.5 font-semibold"
              >
                <span className="material-symbols-outlined text-base">admin_panel_settings</span>
                <span>Admin Dashboard</span>
              </NavLink>
            )}
            
            <div className="pt-2 mt-2 border-t border-surface-variant flex flex-col gap-2">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-sm text-error font-medium hover:bg-error/10 rounded-lg flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">logout</span>
                  <span>Sign Out ({user.name})</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 pt-1">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex-1 py-2 text-center text-sm font-semibold text-primary border border-primary/30 rounded-lg"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex-1 py-2 text-center text-sm font-semibold bg-secondary text-on-secondary rounded-lg"
                  >
                    Join
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Notifications Modal */}
      <NotificationsModal 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
    </>
  );
}
