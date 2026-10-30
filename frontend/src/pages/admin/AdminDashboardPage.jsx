import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useLibrary } from '../../context/LibraryContext';

export default function AdminDashboardPage() {
  const { showToast } = useLibrary();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.admin.getDashboardStats();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load dashboard metrics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading && !data) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-3" />
        <p className="text-xs font-label-archival text-outline uppercase tracking-wider">
          Querying Archival Metrics...
        </p>
      </div>
    );
  }

  const { stats, recentLogs } = data || {
    stats: {
      users: { total: 0, active: 0, suspended: 0, admins: 0 },
      books: { total: 0, published: 0, drafts: 0 },
      contributions: { pending: 0, total: 0 },
      categoriesCount: 0
    },
    recentLogs: []
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-secondary" />
            <span className="font-label-archival text-xs text-secondary uppercase tracking-widest font-bold">
              Console Overview
            </span>
          </div>
          <h1 className="font-title-editorial text-2xl sm:text-3xl text-primary font-normal">
            Archival Sanctuary Metrics
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1 font-body-sm">
            Live overview of library assets, quarantined patron contributions, and platform operations.
          </p>
        </div>

        <button
          onClick={fetchStats}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-container-lowest border border-surface-variant hover:border-primary/40 text-xs font-semibold text-primary shadow-xs transition-all self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-base">refresh</span>
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Pending Contributions Banner Alert if any */}
      {stats.contributions.pending > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl">rate_review</span>
            </div>
            <div>
              <p className="text-sm font-bold text-amber-950 font-serif">
                {stats.contributions.pending} Manuscript{stats.contributions.pending > 1 ? 's' : ''} Awaiting Quarantine Review
              </p>
              <p className="text-xs text-amber-800/90 font-body-sm">
                Patrons have submitted new digital folios requiring verification and copyright assessment.
              </p>
            </div>
          </div>
          <Link
            to="/admin/contributions"
            className="px-4 py-2 bg-amber-800 text-white rounded-xl text-xs font-semibold shadow-xs hover:bg-amber-900 transition-colors shrink-0"
          >
            Review Queue &rarr;
          </Link>
        </div>
      )}

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Books Card */}
        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-variant/50 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-label-archival text-outline uppercase tracking-wider font-semibold">
              Canonical Books
            </span>
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">auto_stories</span>
            </div>
          </div>
          <div>
            <span className="text-3xl font-serif text-primary font-bold">
              {stats.books.total}
            </span>
            <span className="text-xs text-on-surface-variant ml-2 font-medium">
              ({stats.books.published} published)
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-surface-variant/40 flex justify-between items-center text-[11px]">
            <Link to="/admin/books" className="text-secondary hover:underline font-semibold flex items-center gap-1">
              <span>Manage catalog</span>
              <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </Link>
            <span className="text-outline">{stats.books.drafts} drafts</span>
          </div>
        </div>

        {/* Users Card */}
        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-variant/50 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-label-archival text-outline uppercase tracking-wider font-semibold">
              Patrons &amp; Readers
            </span>
            <div className="w-9 h-9 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">group</span>
            </div>
          </div>
          <div>
            <span className="text-3xl font-serif text-primary font-bold">
              {stats.users.total}
            </span>
            <span className="text-xs text-on-surface-variant ml-2 font-medium">
              ({stats.users.active} active)
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-surface-variant/40 flex justify-between items-center text-[11px]">
            <Link to="/admin/users" className="text-secondary hover:underline font-semibold flex items-center gap-1">
              <span>View patrons</span>
              <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </Link>
            <span className="text-outline">{stats.users.admins} archivists</span>
          </div>
        </div>

        {/* Contributions Card */}
        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-variant/50 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-label-archival text-outline uppercase tracking-wider font-semibold">
              Quarantined Folios
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">folder_zip</span>
            </div>
          </div>
          <div>
            <span className="text-3xl font-serif text-primary font-bold">
              {stats.contributions.pending}
            </span>
            <span className="text-xs text-amber-700 font-semibold ml-2">
              under review
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-surface-variant/40 flex justify-between items-center text-[11px]">
            <Link to="/admin/contributions" className="text-secondary hover:underline font-semibold flex items-center gap-1">
              <span>Review submissions</span>
              <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </Link>
            <span className="text-outline">{stats.contributions.total} total</span>
          </div>
        </div>

        {/* Categories Card */}
        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-variant/50 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-label-archival text-outline uppercase tracking-wider font-semibold">
              Alcove Categories
            </span>
            <div className="w-9 h-9 rounded-xl bg-teal-600/15 text-teal-800 flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">category</span>
            </div>
          </div>
          <div>
            <span className="text-3xl font-serif text-primary font-bold">
              {stats.categoriesCount}
            </span>
            <span className="text-xs text-on-surface-variant ml-2 font-medium">
              curated genres
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-surface-variant/40 flex justify-between items-center text-[11px]">
            <Link to="/admin/categories" className="text-secondary hover:underline font-semibold flex items-center gap-1">
              <span>Organize alcoves</span>
              <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </Link>
            <span className="text-outline">Active</span>
          </div>
        </div>

      </div>

      {/* Quick Action Hub */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/admin/books?action=new"
          className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-variant/60 hover:border-primary/50 transition-all group flex items-start gap-4 shadow-xs"
        >
          <div className="w-11 h-11 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-2xl">add_box</span>
          </div>
          <div>
            <h2 className="text-sm font-bold text-primary font-serif">Catalog New Volume</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">Upload a PDF manuscript and add cover metadata to the library.</p>
          </div>
        </Link>

        <Link
          to="/admin/contributions"
          className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-variant/60 hover:border-secondary/50 transition-all group flex items-start gap-4 shadow-xs"
        >
          <div className="w-11 h-11 rounded-xl bg-secondary text-on-secondary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-2xl">fact_check</span>
          </div>
          <div>
            <h2 className="text-sm font-bold text-primary font-serif">Examine Quarantined PDFs</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">Inspect user-uploaded files, approve canonical editions, or reject.</p>
          </div>
        </Link>

        <Link
          to="/admin/logs"
          className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-variant/60 hover:border-outline transition-all group flex items-start gap-4 shadow-xs"
        >
          <div className="w-11 h-11 rounded-xl bg-surface-container-highest text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-2xl">manage_history</span>
          </div>
          <div>
            <h2 className="text-sm font-bold text-primary font-serif">Inspect Archival Audit Trail</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">Review security events, logins, publication records, and deletions.</p>
          </div>
        </Link>
      </div>

      {/* Recent Activity Log Stream */}
      <div className="bg-surface-container-lowest rounded-2xl border border-surface-variant/50 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-variant/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lg text-primary">history</span>
            <h2 className="font-title-editorial text-base text-primary font-bold">Recent Platform Activity</h2>
          </div>
          <Link to="/admin/logs" className="text-xs text-secondary hover:underline font-semibold flex items-center gap-1">
            <span>View Full Trail</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>

        <div className="divide-y divide-surface-variant/30">
          {recentLogs.length === 0 ? (
            <div className="p-8 text-center text-xs text-outline font-body-sm">
              No recent administrative activities recorded in ledger.
            </div>
          ) : (
            recentLogs.map((log) => {
              const dateStr = new Date(log.createdAt).toLocaleString();
              let badgeColor = 'bg-primary/10 text-primary';
              if (log.action.includes('APPROVED')) badgeColor = 'bg-emerald-100 text-emerald-800';
              if (log.action.includes('REJECTED')) badgeColor = 'bg-rose-100 text-rose-800';
              if (log.action.includes('DELETED')) badgeColor = 'bg-rose-100 text-rose-800';
              if (log.action.includes('LOGIN')) badgeColor = 'bg-secondary/15 text-secondary';

              return (
                <div key={log._id || log.id} className="p-4 sm:px-6 flex items-start justify-between gap-4 hover:bg-surface-container/30 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-base text-primary">
                        {log.entityType === 'book' ? 'book' : log.entityType === 'contribution' ? 'upload_file' : 'person'}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-label-archival ${badgeColor}`}>
                          {log.action.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs font-semibold text-primary">
                          {log.entityTitle || log.entityId}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-1">
                        By <span className="font-medium text-on-surface">{log.actorName || 'System'}</span> ({log.actorEmail || 'platform'})
                        {log.details?.reason && <span className="italic ml-1"> — "{log.details.reason}"</span>}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] text-outline font-label-archival shrink-0 whitespace-nowrap">
                    {dateStr}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}

