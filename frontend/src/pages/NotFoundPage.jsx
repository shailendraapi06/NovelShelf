import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center py-20">
      <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-secondary mb-6">
        <span className="material-symbols-outlined text-4xl">menu_book</span>
      </div>
      <span className="font-label-archival text-label-archival text-secondary uppercase tracking-widest font-bold">
        Folio Not Located in Archives
      </span>
      <h1 className="mt-3 font-display-hero text-4xl sm:text-5xl text-primary font-bold font-serif">
        Lost in the Labyrinth
      </h1>
      <p className="mt-4 max-w-md font-body-md text-body-md text-on-surface-variant leading-relaxed">
        Like Daniel wandering through the secret subterranean arches of the Cemetery of Forgotten Books, the page you seek has either moved or dissolved into mist.
      </p>
      <div className="mt-8 flex items-center gap-4">
        <Link 
          to="/" 
          className="px-6 py-3 bg-primary text-on-primary hover:bg-primary-container rounded-lg font-label-md text-label-md font-semibold transition-colors shadow-sm"
        >
          Return to Sanctuary Home
        </Link>
        <Link 
          to="/explore" 
          className="px-6 py-3 bg-surface-container hover:bg-surface-container-high text-primary rounded-lg font-label-md text-label-md font-semibold transition-colors"
        >
          Explore Catalog
        </Link>
      </div>
    </div>
  );
}
