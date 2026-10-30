import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SHELF_VOLUMES } from '../../data/booksData';
import { useLibrary } from '../../context/LibraryContext';

export default function Bookshelf3D() {
  const { showToast } = useLibrary();
  const [shelfItems, setShelfItems] = useState(SHELF_VOLUMES);

  const rearrangeShelf = () => {
    const shuffled = [...shelfItems];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setShelfItems(shuffled);
    showToast("Mahogany shelf volumes rearranged by archival catalog.");
  };

  return (
    <section className="w-full bg-surface-container-low py-24 mt-16">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <span className="font-label-archival text-label-archival text-secondary uppercase tracking-widest font-bold block mb-1">
              Archival Reserve Shelf
            </span>
            <h2 className="font-headline-lg text-headline-lg text-primary font-bold">
              Curated Archival Volumes
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Hover any spine to examine edition details or open in the reader.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-label-md text-label-md text-on-surface-variant">Tier I: Mahogany Hall</span>
            <button 
              onClick={rearrangeShelf}
              className="inline-flex items-center gap-1.5 rounded bg-surface-container-high px-3 py-1.5 font-label-md text-label-md text-on-surface hover:bg-surface-container-highest transition-colors cursor-pointer shadow-xs active:scale-95" 
              type="button"
            >
              <span className="material-symbols-outlined text-sm">shuffle</span>
              <span>Rearrange Shelf</span>
            </button>
          </div>
        </div>

        {/* Mahogany Shelf Wrapper */}
        <div className="relative w-full rounded-t-lg bg-[#271900] pt-14 px-4 sm:px-10 pb-6 shadow-2xl overflow-hidden">
          {/* Shelf Ambient Shadow Lighting */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/40" />
          <div className="pointer-events-none absolute left-0 right-0 top-0 h-4 bg-black/40" />

          {/* Shelf Books Row (Spine View & Card Elevation) */}
          <div 
            className="relative z-10 flex items-end justify-between gap-2 sm:gap-4 overflow-x-auto pb-2 scrollbar-none [perspective:1000px]"
          >
            {shelfItems.map((vol) => (
              <div 
                key={vol.id}
                className="group relative flex flex-col items-center shrink-0 cursor-pointer transition-all duration-300 hover:-translate-y-5"
              >
                {/* Popover on Hover */}
                <div className="pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100 absolute -top-28 left-1/2 -translate-x-1/2 z-30 w-44 rounded-lg bg-surface-container-lowest p-3 shadow-xl transition-all duration-300 flex flex-col gap-1.5 border border-surface-variant">
                  <span className="font-label-archival text-[8px] text-secondary font-bold uppercase tracking-wider">
                    {vol.badge}
                  </span>
                  <p className="font-title-editorial text-xs text-primary font-semibold line-clamp-1">
                    {vol.title}
                  </p>
                  <div className="flex items-center gap-1 pt-1">
                    <Link 
                      to={`/reader/shadow-of-the-wind`}
                      className="w-full text-center rounded bg-primary py-1 font-label-archival text-[9px] text-on-primary hover:bg-primary-container transition-colors"
                    >
                      Start Reading
                    </Link>
                  </div>
                </div>

                {/* Spine Object */}
                <div 
                  className={`${vol.heightClass} ${vol.widthClass} rounded-t-sm bg-gradient-to-r ${vol.gradient} shadow-md flex flex-col justify-between items-center py-4 ${vol.textColor} select-none transition-transform duration-300`}
                >
                  <span className="font-label-archival text-[8px] tracking-widest uppercase font-bold">
                    {vol.author}
                  </span>
                  <span className="[writing-mode:vertical-rl] font-headline-sm text-xs tracking-wider font-semibold">
                    {vol.spineText}
                  </span>
                  <div className="h-4 w-4 rounded-full bg-secondary-fixed/20 flex items-center justify-center text-[8px]">
                    {vol.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Solid Wooden Shelf Ledge */}
          <div className="relative z-20 h-6 w-full rounded bg-gradient-to-b from-[#e5c188] via-[#755a2a] to-[#271900] shadow-2xl">
            <div className="h-1 w-full bg-secondary-fixed/30" />
          </div>
        </div>
      </div>
    </section>
  );
}
