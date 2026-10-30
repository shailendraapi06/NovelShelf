import React, { useState } from 'react';
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLibrary } from '../../context/LibraryContext';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { showToast } = useLibrary();
  const navigate = useNavigate();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    showToast('Signed out of administrative console.');
    navigate('/');
  };

  const navItems = [
    { path: '/admin', label: 'Dashboard Overview', icon: 'dashboard', end: true },
    { path: '/admin/books', label: 'Book Catalogue', icon: 'auto_stories' },
    { path: '/admin/categories', label: 'Categories & Alcoves', icon: 'category' },
    { path: '/admin/contributions', label: 'Manuscript Reviews', icon: 'rate_review' },
    { path: '/admin/users', label: 'Patrons & Users', icon: 'group' },
    { path: '/admin/logs', label: 'Archival Audit Logs', icon: 'history' },
  ];

  return (
    <div className="min-h-screen bg-[#f3f6f0] text-on-surface flex flex-col antialiased">
      
      {/* Top Admin Navigation Bar */}
      <header className="h-16 bg-surface-container-lowest border-b border-surface-variant/50 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="lg:hidden p-2 text-primary hover:bg-surface-container rounded-lg"
            aria-label="Toggle sidebar"
          >
            <span className="material-symbols-outlined text-2xl">
              {isMobileMobileOpen => isMobileMobileOpen ? 'close' : 'menu'}
              menu
            </span>
          </button>
          
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold font-serif shadow-xs">
              N
            </div>
            <div className="flex flex-col">
              <span className="font-title-editorial text-lg text-primary tracking-tight font-semibold leading-tight">
                NovelShelf
              </span>
              <span className="font-label-archival text-[9px] text-secondary tracking-widest uppercase -mt-0.5 font-bold">
                Archival Console
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            to="/"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
          >
            <span className="material-symbols-outlined text-base">visibility</span>
            <span>View Public Sanctuary</span>
          </Link>

          <div className="h-5 w-px bg-surface-variant/70 hidden sm:block" />

          {/* User Badge */}
          <div className="flex items-center gap-2">
            <img
              src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256"}
              alt={user?.name || "Admin"}
              className="w-8 h-8 rounded-full object-cover ring-1 ring-secondary/50"
            />
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-primary truncate max-w-[120px]">{user?.name}</span>
              <span className="text-[10px] text-secondary font-label-archival uppercase tracking-wider font-semibold">Master Archivist</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
          </button>
        </div>
      </header>

      {/* Main Layout Body */}
      <div className="flex flex-1 relative">
        
        {/* Sidebar for Desktop */}
        <aside className="w-64 bg-surface-container-lowest border-r border-surface-variant/50 hidden lg:flex flex-col justify-between p-4 sticky top-16 h-[calc(100vh-4rem)]">
          <div className="space-y-1">
            <div className="px-3 py-2 text-[10px] font-label-archival text-outline uppercase tracking-widest font-bold">
              Administration
            </div>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-primary text-on-primary shadow-xs font-bold'
                      : 'text-on-surface-variant hover:text-primary hover:bg-surface-container'
                  }`
                }
              >
                <span className="material-symbols-outlined text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-surface-container border border-surface-variant/40">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-label-archival text-primary font-bold uppercase tracking-wider">
                Sanctuary Active
              </span>
            </div>
            <p className="text-[11px] text-on-surface-variant leading-tight">
              MERN Archival Storage &amp; Quarantine Security running.
            </p>
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <div className="relative w-64 bg-surface-container-lowest h-full shadow-2xl p-4 flex flex-col justify-between z-10 animate-fade-in">
              <div className="space-y-1">
                <div className="flex items-center justify-between pb-3 mb-2 border-b border-surface-variant">
                  <span className="font-title-editorial text-base text-primary font-bold">Admin Navigation</span>
                  <button onClick={() => setIsMobileSidebarOpen(false)} className="text-on-surface-variant p-1">
                    <span className="material-symbols-outlined text-xl">close</span>
                  </button>
                </div>
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.end}
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-primary text-on-primary shadow-xs font-bold'
                          : 'text-on-surface-variant hover:text-primary hover:bg-surface-container'
                      }`
                    }
                  >
                    <span className="material-symbols-outlined text-lg">{item.icon}</span>
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>

              <div className="pt-4 border-t border-surface-variant">
                <Link
                  to="/"
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="flex items-center gap-2 text-xs font-semibold text-primary py-2"
                >
                  <span className="material-symbols-outlined text-base">visibility</span>
                  <span>Public Sanctuary</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

    </div>
  );
}

