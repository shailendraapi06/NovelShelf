import React from 'react';
import { useLibrary } from '../../context/LibraryContext';

export default function Toast() {
  const { toast } = useLibrary();

  if (!toast.show) return null;

  return (
    <div 
      className="fixed top-24 left-1/2 -translate-x-1/2 bg-primary text-on-primary px-6 py-3 rounded-xl shadow-2xl z-50 transition-all duration-300 flex items-center gap-3 border border-secondary/30 animate-fade-in"
      role="alert"
    >
      <span className="material-symbols-outlined text-secondary-fixed text-xl">
        {toast.type === 'success' ? 'check_circle' : 'auto_stories'}
      </span>
      <span className="font-body-sm text-body-sm font-medium">{toast.message}</span>
    </div>
  );
}
