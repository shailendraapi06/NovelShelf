import React from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { Link } from 'react-router-dom';

export default function NotificationsModal({ isOpen, onClose }) {
  const { notifications, markNotificationRead, clearAllNotifications } = useLibrary();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 sm:p-6 lg:p-8 pt-20">
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-sm rounded-2xl bg-surface-container-lowest p-6 shadow-2xl ring-1 ring-outline-variant/50 z-10 animate-fade-in flex flex-col gap-4 max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-surface-variant">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">notifications</span>
            <h3 className="font-title-editorial text-title-editorial text-primary font-semibold">Notifications</h3>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={clearAllNotifications}
              className="text-xs font-label-archival uppercase text-secondary hover:text-primary transition-colors"
            >
              Mark all read
            </button>
            <button 
              onClick={onClose}
              className="p-1 rounded-full text-on-surface-variant hover:text-primary transition-colors"
              aria-label="Close notifications"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </div>

        <div className="overflow-y-auto space-y-3 pr-1">
          {notifications.length === 0 ? (
            <p className="py-8 text-center text-body-sm text-outline">No notifications yet.</p>
          ) : (
            notifications.map((item) => (
              <div 
                key={item.id} 
                onClick={() => markNotificationRead(item.id)}
                className={`p-3.5 rounded-xl cursor-pointer transition-colors border ${
                  item.unread 
                    ? 'bg-surface-container-low border-secondary/30' 
                    : 'bg-surface border-surface-container-high'
                } hover:bg-surface-container`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-label-md text-label-md font-semibold text-primary">
                    {item.title}
                  </span>
                  {item.unread && (
                    <span className="w-2 h-2 rounded-full bg-secondary shrink-0 mt-1" />
                  )}
                </div>
                <p className="font-body-sm text-xs text-on-surface-variant mt-1 leading-relaxed">
                  {item.message}
                </p>
                <div className="flex items-center justify-between mt-2 pt-1">
                  <span className="font-label-archival text-[10px] text-outline uppercase tracking-wider">
                    {item.time}
                  </span>
                  {item.link ? (
                    <Link 
                      to={item.link} 
                      onClick={onClose}
                      className="text-[11px] font-label-md text-secondary font-semibold hover:underline"
                    >
                      View Details →
                    </Link>
                  ) : (
                    <Link 
                      to="/my-library" 
                      onClick={onClose}
                      className="text-[11px] font-label-md text-secondary font-semibold hover:underline"
                    >
                      My Library →
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
