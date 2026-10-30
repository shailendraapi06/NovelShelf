import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useLibrary } from '../../context/LibraryContext';

export default function AdminLogsPage() {
  const { showToast } = useLibrary();
  const [logs, setLogs] = useState([]);
  const [actionFilter, setActionFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.admin.getLogs({
        action: actionFilter !== 'all' ? actionFilter : undefined,
        limit: 100
      });
      if (res.success) {
        setLogs(res.logs || []);
      }
    } catch (err) {
      showToast(err.message || 'Error fetching activity logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter]);

  const actions = [
    { id: 'all', label: 'All Activities' },
    { id: 'USER_LOGIN', label: 'Logins' },
    { id: 'USER_REGISTER', label: 'Registrations' },
    { id: 'BOOK_CREATED', label: 'Books Cataloged' },
    { id: 'BOOK_UPDATED', label: 'Books Edited' },
    { id: 'BOOK_DELETED', label: 'Books Removed' },
    { id: 'CONTRIBUTION_SUBMITTED', label: 'Submissions' },
    { id: 'CONTRIBUTION_APPROVED', label: 'Approvals' },
    { id: 'CONTRIBUTION_REJECTED', label: 'Rejections' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-secondary" />
            <span className="font-label-archival text-xs text-secondary uppercase tracking-widest font-bold">
              Archival Ledger
            </span>
          </div>
          <h1 className="font-title-editorial text-2xl sm:text-3xl text-primary font-normal">
            Platform Activity &amp; Audit Log
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1 font-body-sm">
            Immutable audit record of all curatorial actions, patron contributions, security events, and catalog changes.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-container-lowest border border-surface-variant hover:border-primary/40 text-xs font-semibold text-primary shadow-xs transition-all self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-base">refresh</span>
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="p-2 bg-surface-container-lowest rounded-2xl border border-surface-variant/50 shadow-xs flex items-center gap-1.5 overflow-x-auto">
        {actions.map((act) => (
          <button
            key={act.id}
            onClick={() => setActionFilter(act.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              actionFilter === act.id
                ? 'bg-primary text-on-primary shadow-xs'
                : 'text-on-surface-variant hover:text-primary hover:bg-surface-container'
            }`}
          >
            {act.label}
          </button>
        ))}
      </div>

      {/* Audit Log Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-surface-variant/50 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-container-high/40 border-b border-surface-variant text-[11px] font-label-archival text-outline uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Event Type</th>
                <th className="py-3.5 px-4">Actor</th>
                <th className="py-3.5 px-4">Entity Affected</th>
                <th className="py-3.5 px-4">Event Details &amp; Payload</th>
                <th className="py-3.5 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-variant/40">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-outline">
                    <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading audit records...</span>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-outline font-body-sm">
                    No activity logs recorded for this category.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  let badge = 'bg-primary/10 text-primary';
                  if (log.action.includes('APPROVED')) badge = 'bg-emerald-100 text-emerald-800';
                  if (log.action.includes('REJECTED') || log.action.includes('DELETED')) badge = 'bg-rose-100 text-rose-800';
                  if (log.action.includes('LOGIN')) badge = 'bg-secondary/15 text-secondary';
                  const dateStr = new Date(log.createdAt).toLocaleString();

                  return (
                    <tr key={log._id || log.id} className="hover:bg-surface-container/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider font-label-archival ${badge}`}>
                          {log.action.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-primary block">{log.actorName || 'System'}</span>
                        <span className="text-[10px] text-outline">{log.actorEmail || log.actorRole}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-on-surface block max-w-xs truncate">{log.entityTitle || log.entityId}</span>
                        <span className="text-[10px] text-outline uppercase font-label-archival">{log.entityType}</span>
                      </td>
                      <td className="py-3.5 px-4 text-on-surface-variant max-w-sm">
                        {log.details ? (
                          <span className="font-mono text-[11px] truncate block">
                            {JSON.stringify(log.details)}
                          </span>
                        ) : (
                          <span className="text-outline italic">No extra metadata</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-outline font-label-archival text-[11px] whitespace-nowrap">
                        {dateStr}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

