import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLibrary } from '../../context/LibraryContext';

export default function AdminUsersPage() {
  const { user: currentAdmin } = useAuth();
  const { showToast } = useLibrary();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.admin.getUsers({
        role: roleFilter !== 'all' ? roleFilter : undefined,
        search: search.trim() || undefined
      });
      if (res.success) {
        setUsers(res.users || []);
      }
    } catch (err) {
      showToast(err.message || 'Failed to fetch users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleRole = async (targetUser) => {
    if (targetUser._id === currentAdmin?._id) {
      showToast("Cannot change your own administrative role.", 'error');
      return;
    }

    const newRole = targetUser.role === 'admin' ? 'user' : 'admin';
    const confirm = window.confirm(`Change ${targetUser.name}'s role to ${newRole.toUpperCase()}?`);
    if (!confirm) return;

    try {
      await api.admin.updateUserRole(targetUser._id || targetUser.id, newRole);
      showToast(`User role updated to ${newRole}.`, 'success');
      fetchUsers();
    } catch (err) {
      showToast(err.message || 'Error updating user role', 'error');
    }
  };

  const handleToggleStatus = async (targetUser) => {
    if (targetUser._id === currentAdmin?._id) {
      showToast("Cannot suspend your own account.", 'error');
      return;
    }

    const newStatus = targetUser.status === 'active' ? 'suspended' : 'active';
    const confirm = window.confirm(
      newStatus === 'suspended'
        ? `Suspend patron account "${targetUser.name}"? They will not be able to log in.`
        : `Reactivate patron account "${targetUser.name}"?`
    );
    if (!confirm) return;

    try {
      await api.admin.toggleUserStatus(targetUser._id || targetUser.id, newStatus);
      showToast(`Patron account status set to ${newStatus}.`, 'success');
      fetchUsers();
    } catch (err) {
      showToast(err.message || 'Error updating account status', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-secondary" />
            <span className="font-label-archival text-xs text-secondary uppercase tracking-widest font-bold">
              Archival Registry
            </span>
          </div>
          <h1 className="font-title-editorial text-2xl sm:text-3xl text-primary font-normal">
            Patron &amp; User Administration
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1 font-body-sm">
            Manage library patrons, assign archival curatorship privileges, and maintain account security.
          </p>
        </div>

        {/* Role Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-surface-container rounded-xl self-start sm:self-auto">
          {['all', 'user', 'admin'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                roleFilter === r
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              {r === 'all' ? 'All Patrons' : r === 'admin' ? 'Archivists (Admin)' : 'Readers'}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 bg-surface-container-lowest rounded-2xl border border-surface-variant/50 shadow-xs flex items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-sm">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">
            search
          </span>
          <input
            type="text"
            placeholder="Search by patron name or email address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-surface-container-high/40 rounded-xl text-xs font-body-sm border border-surface-variant/60 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </form>
        <span className="text-xs text-outline hidden sm:inline">
          {users.length} Registered Patron{users.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Users Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-surface-variant/50 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-container-high/40 border-b border-surface-variant text-[11px] font-label-archival text-outline uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Patron Details</th>
                <th className="py-3.5 px-4">Email Address</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Registration Date</th>
                <th className="py-3.5 px-4 text-right">Access Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-variant/40">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-outline">
                    <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading patron ledger...</span>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-outline font-body-sm">
                    No patrons matched the search query.
                  </td>
                </tr>
              ) : (
                users.map((targetUser) => {
                  const isAdmin = targetUser.role === 'admin';
                  const isActive = targetUser.status === 'active';
                  const isSelf = targetUser._id === currentAdmin?._id;
                  const dateStr = new Date(targetUser.createdAt).toLocaleDateString();

                  return (
                    <tr key={targetUser._id || targetUser.id} className="hover:bg-surface-container/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={targetUser.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256"}
                            alt={targetUser.name}
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-surface-variant"
                          />
                          <div>
                            <span className="font-semibold text-primary block">
                              {targetUser.name}
                              {isSelf && <span className="ml-1 text-[10px] text-secondary font-bold">(You)</span>}
                            </span>
                            <span className="text-[10px] text-outline">
                              {targetUser.bio || 'Patron of the Library'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-on-surface-variant">
                        {targetUser.email}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-label-archival ${
                          isAdmin ? 'bg-secondary text-on-secondary' : 'bg-surface-container-highest text-on-surface'
                        }`}>
                          {targetUser.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-label-archival ${
                          isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {targetUser.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-on-surface-variant">
                        {dateStr}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {!isSelf ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleToggleRole(targetUser)}
                              className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary text-[11px] font-medium transition-colors border border-surface-variant/60"
                              title={isAdmin ? "Demote to Patron" : "Promote to Archivist Admin"}
                            >
                              {isAdmin ? 'Demote' : 'Make Admin'}
                            </button>
                            <button
                              onClick={() => handleToggleStatus(targetUser)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                                isActive 
                                  ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200' 
                                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                              }`}
                            >
                              {isActive ? 'Suspend' : 'Reactivate'}
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-outline italic">Master Curator</span>
                        )}
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

