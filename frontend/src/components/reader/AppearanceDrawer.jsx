import React, { useEffect } from 'react';
import { useLibrary } from '../../context/LibraryContext';

export default function AppearanceDrawer({ isOpen, onClose }) {
  const { readerSettings, updateReaderSettings, resetReaderSettings, showToast } = useLibrary();

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const themes = [
    { id: 'parchment', name: 'Parchment', dotBg: '#EDE6D8', cardBg: 'bg-[#F8F5EF]', textCol: 'text-[#191D19]' },
    { id: 'sepia', name: 'Candlelight', dotBg: '#E5D7BA', cardBg: 'bg-[#F4ECD8]', textCol: 'text-[#4A3B22]' },
    { id: 'forest', name: 'Midnight', dotBg: '#002920', cardBg: 'bg-[#173F35]', textCol: 'text-[#F7FAF4]' },
  ];

  const fonts = [
    { id: 'playfair', name: 'Playfair', fontClass: 'font-reader-playfair' },
    { id: 'garamond', name: 'Garamond', fontClass: 'font-reader-garamond' },
    { id: 'modern', name: 'Modern', fontClass: 'font-reader-modern' },
  ];

  const fontSizes = [
    { id: 'sm', label: 'A-', title: 'Small (14px)' },
    { id: 'md', label: 'Def', title: 'Standard (16px)' },
    { id: 'lg', label: 'A+', title: 'Large (19px)' },
    { id: 'xl', label: 'Edit', title: 'Editorial (23px)' },
  ];

  const leadings = [
    { id: 'compact', label: 'Compact', value: '1.45' },
    { id: 'relaxed', label: 'Standard', value: '1.85' },
    { id: 'loose', label: 'Expansive', value: '2.3' },
  ];

  const widths = [
    { id: 'narrow', name: 'Narrow', widthClass: 'reader-width-narrow', label: '960px' },
    { id: 'standard', name: 'Standard', widthClass: 'reader-width-standard', label: '1180px' },
    { id: 'expansive', name: 'Expansive', widthClass: 'reader-width-expansive', label: '1360px' },
  ];

  if (!isOpen) return null;

  // Normalizers to handle legacy or different key formats in readerSettings
  const currentFont = readerSettings.fontClass?.includes('garamond') 
    ? 'garamond' 
    : readerSettings.fontClass?.includes('modern') || readerSettings.fontClass?.includes('label')
    ? 'modern' 
    : 'playfair';

  const currentLeading = readerSettings.leading?.includes('snug') || readerSettings.leading === 'compact'
    ? 'compact'
    : readerSettings.leading?.includes('loose') || readerSettings.leading === 'loose'
    ? 'loose'
    : 'relaxed';

  const currentWidth = readerSettings.spreadWidth?.includes('960') || readerSettings.spreadWidth === 'narrow'
    ? 'narrow'
    : readerSettings.spreadWidth?.includes('1320') || readerSettings.spreadWidth?.includes('1360') || readerSettings.spreadWidth === 'expansive'
    ? 'expansive'
    : 'standard';

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 transition-opacity animate-fade-in"
        aria-hidden="true"
      />

      {/* 
        Responsive Drawer:
        Mobile (<sm): Bottom Sheet sliding up from bottom
        Desktop (>=sm): Side Drawer sliding from right
      */}
      <div 
        role="dialog"
        aria-modal="true"
        aria-label="Reading Room Appearance Options"
        className="fixed z-50 bg-surface-container-lowest shadow-2xl transition-all duration-300 overflow-y-auto flex flex-col justify-between
          bottom-0 left-0 right-0 max-h-[85vh] rounded-t-2xl p-5 border-t border-surface-variant
          sm:bottom-0 sm:top-20 sm:left-auto sm:right-0 sm:w-96 sm:max-h-none sm:rounded-none sm:p-6 sm:border-l sm:border-t-0 animate-fade-in"
      >
        <div>
          {/* Mobile Sheet Handle */}
          <div className="w-12 h-1.5 bg-outline-variant/60 rounded-full mx-auto mb-3 sm:hidden" />

          {/* Header */}
          <div className="flex items-center justify-between pb-4 sm:pb-6 border-b border-surface-variant">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">auto_stories</span>
              <h3 className="font-headline-sm text-lg sm:text-headline-sm text-primary font-bold">Reading Options</h3>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
              aria-label="Close options"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          {/* 1. Atmospheric Theme */}
          <div className="space-y-3 py-4 sm:py-6 border-b border-surface-variant">
            <div className="flex items-center justify-between">
              <label className="font-label-md text-xs sm:text-label-md text-on-surface-variant uppercase tracking-wider block font-semibold">
                Atmospheric Theme
              </label>
              <span className="text-xs font-label-archival text-secondary font-bold uppercase">
                {themes.find(t => t.id === readerSettings.theme)?.name}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {themes.map(t => {
                const isActive = readerSettings.theme === t.id;
                return (
                  <button 
                    key={t.id}
                    type="button"
                    onClick={() => {
                      updateReaderSettings({ theme: t.id });
                      showToast(`${t.name} reading canvas activated.`);
                    }}
                    className={`p-3 rounded-lg flex flex-col items-center gap-1.5 shadow-xs transition-all min-h-[52px] cursor-pointer border ${t.cardBg} ${t.textCol} ${
                      isActive 
                        ? 'ring-2 ring-primary ring-offset-2 border-primary font-bold shadow-md' 
                        : 'border-surface-variant/40 hover:scale-102 opacity-85'
                    }`}
                  >
                    <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full shadow-inner flex items-center justify-center" style={{ backgroundColor: t.dotBg }}>
                      {isActive && <span className="material-symbols-outlined text-[10px] text-primary">check</span>}
                    </span>
                    <span className="font-label-md text-xs sm:text-label-md">{t.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Typeface Style */}
          <div className="space-y-3 py-4 sm:py-6 border-b border-surface-variant">
            <div className="flex items-center justify-between">
              <label className="font-label-md text-xs sm:text-label-md text-on-surface-variant uppercase tracking-wider block font-semibold">
                Typeface Style
              </label>
              <span className="text-xs font-label-archival text-secondary font-bold uppercase">
                {fonts.find(f => f.id === currentFont)?.name}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {fonts.map(f => {
                const isActive = currentFont === f.id;
                return (
                  <button 
                    key={f.id}
                    type="button"
                    onClick={() => {
                      updateReaderSettings({ fontClass: f.fontClass });
                      showToast(`Typeface switched to ${f.name}.`);
                    }}
                    className={`p-2.5 rounded-lg text-center transition-all min-h-[44px] cursor-pointer border ${f.fontClass} ${
                      isActive
                        ? 'bg-primary text-on-primary font-bold shadow-sm border-primary ring-1 ring-primary'
                        : 'bg-surface-container hover:bg-surface-container-high text-primary border-surface-variant/40'
                    }`}
                  >
                    <span className="text-sm sm:text-base block leading-none">{f.name}</span>
                    <span className={`text-[10px] block mt-1 opacity-70 ${isActive ? 'text-primary-fixed' : 'text-outline'}`}>
                      {f.id === 'playfair' ? 'Display Serif' : f.id === 'garamond' ? 'Classic Book' : 'Sans'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Scale Size (Font Size) */}
          <div className="space-y-3 py-4 sm:py-6 border-b border-surface-variant">
            <div className="flex items-center justify-between">
              <label className="font-label-md text-xs sm:text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">
                Text Scale
              </label>
              <span className="font-label-md text-xs sm:text-label-md text-secondary font-medium">
                {fontSizes.find(s => s.id === readerSettings.fontSize)?.title || 'Standard'}
              </span>
            </div>
            <div className="flex items-center justify-between gap-1.5 bg-surface-container rounded-lg p-1.5 border border-surface-variant/40">
              {fontSizes.map(s => {
                const isActive = readerSettings.fontSize === s.id;
                return (
                  <button 
                    key={s.id}
                    type="button"
                    onClick={() => {
                      updateReaderSettings({ fontSize: s.id });
                      showToast(`Text scale set to ${s.title}.`);
                    }}
                    className={`flex-1 py-2 rounded-md text-center font-label-md text-xs sm:text-label-md transition-all min-h-[40px] cursor-pointer ${
                      isActive
                        ? 'bg-primary text-on-primary font-bold shadow-xs'
                        : 'text-on-surface hover:bg-surface-container-lowest/50'
                    }`}
                  >
                    <span className="block font-semibold">{s.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Line Spacing (Leading) */}
          <div className="space-y-3 py-4 sm:py-6 border-b border-surface-variant">
            <div className="flex items-center justify-between">
              <label className="font-label-md text-xs sm:text-label-md text-on-surface-variant uppercase tracking-wider block font-semibold">
                Line Spacing
              </label>
              <span className="text-xs font-label-archival text-secondary font-bold uppercase">
                {leadings.find(l => l.id === currentLeading)?.label}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {leadings.map(l => {
                const isActive = currentLeading === l.id;
                return (
                  <button 
                    key={l.id}
                    type="button"
                    onClick={() => {
                      updateReaderSettings({ leading: l.id });
                      showToast(`Line height adjusted to ${l.label}.`);
                    }}
                    className={`p-2.5 rounded-lg text-center font-label-md text-xs sm:text-label-md transition-all min-h-[44px] cursor-pointer border ${
                      isActive
                        ? 'bg-primary text-on-primary font-bold shadow-xs border-primary'
                        : 'bg-surface-container hover:bg-surface-container-high text-on-surface border-surface-variant/40'
                    }`}
                  >
                    <span className="block font-medium">{l.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Book Spread Width (Desktop only) */}
          <div className="space-y-3 py-4 sm:py-6 hidden sm:block">
            <div className="flex items-center justify-between">
              <label className="font-label-md text-xs sm:text-label-md text-on-surface-variant uppercase tracking-wider block font-semibold">
                Desktop Spread Width
              </label>
              <span className="text-xs font-label-archival text-secondary font-bold uppercase">
                {widths.find(w => w.id === currentWidth)?.label}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {widths.map(w => {
                const isActive = currentWidth === w.id;
                return (
                  <button 
                    key={w.id}
                    type="button"
                    onClick={() => {
                      updateReaderSettings({ spreadWidth: w.widthClass });
                      showToast(`Spread width adjusted to ${w.name} (${w.label}).`);
                    }}
                    className={`p-2.5 rounded-lg text-center font-label-md text-xs sm:text-label-md transition-all min-h-[44px] cursor-pointer border ${
                      isActive
                        ? 'bg-primary text-on-primary font-bold shadow-xs border-primary'
                        : 'bg-surface-container hover:bg-surface-container-high text-on-surface border-surface-variant/40'
                    }`}
                  >
                    <span className="block font-medium">{w.name}</span>
                    <span className={`text-[10px] block opacity-70 ${isActive ? 'text-primary-fixed' : 'text-outline'}`}>
                      {w.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 sm:pt-6 border-t border-surface-variant mt-4">
          <button 
            type="button"
            onClick={() => {
              resetReaderSettings();
              showToast('Restored library default typography and parchment theme.');
            }}
            className="w-full py-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-primary font-label-md text-xs sm:text-label-md transition-colors text-center min-h-[44px] cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">restart_alt</span>
            <span>Reset to Library Default</span>
          </button>
        </div>
      </div>
    </>
  );
}
