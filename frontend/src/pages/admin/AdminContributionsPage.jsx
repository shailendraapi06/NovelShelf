import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useLibrary } from '../../context/LibraryContext';

export default function AdminContributionsPage() {
  const { refreshBooks, showToast } = useLibrary();
  const [contributions, setContributions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Inspection & Review Modal
  const [selectedContrib, setSelectedContrib] = useState(null);
  const [actionType, setActionType] = useState('approve'); // approve | reject
  const [reviewNotes, setReviewNotes] = useState('');
  const [assignedCategory, setAssignedCategory] = useState('Fiction');
  const [submitting, setSubmitting] = useState(false);

  const fetchContributions = async () => {
    try {
      setLoading(true);
      const [contribRes, catRes] = await Promise.all([
        api.admin.getContributions({ status: statusFilter !== 'all' ? statusFilter : undefined }),
        api.getCategories()
      ]);
      if (contribRes.success) setContributions(contribRes.contributions || []);
      if (catRes.success) setCategories(catRes.categories || []);
    } catch (err) {
      showToast(err.message || 'Error loading contributions', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContributions();
  }, [statusFilter]);

  const handleOpenReview = (contrib, action) => {
    setSelectedContrib(contrib);
    setActionType(action);
    setReviewNotes(action === 'approve' ? 'Approved for canonical library catalogue.' : 'Does not meet archival criteria.');
    setAssignedCategory(contrib.genre || categories[0]?.name || 'Fiction');
  };

  const handleProcessReview = async (e) => {
    e.preventDefault();
    if (!selectedContrib) return;

    try {
      setSubmitting(true);
      const res = await api.admin.reviewContribution(selectedContrib._id || selectedContrib.id, {
        action: actionType,
        reviewNotes: reviewNotes.trim(),
        category: assignedCategory,
        title: selectedContrib.title,
        author: selectedContrib.author
      });

      showToast(res.message || `Manuscript ${actionType === 'approve' ? 'approved & published' : 'rejected'}.`, 'success');
      setSelectedContrib(null);
      fetchContributions();
      refreshBooks();
    } catch (err) {
      showToast(err.message || 'Error processing review', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="font-label-archival text-xs text-amber-700 uppercase tracking-widest font-bold">
              Quarantine Chamber
            </span>
          </div>
          <h1 className="font-title-editorial text-2xl sm:text-3xl text-primary font-normal">
            Manuscript Contribution Review
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1 font-body-sm">
            Examine user-uploaded PDFs, verify copyright declarations, and publish accepted works into the public library.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-surface-container rounded-xl self-start sm:self-auto">
          {['all', 'under_review', 'approved', 'rejected'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === s
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              {s === 'under_review' ? 'Under Review' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Contributions Table / Cards */}
      <div className="bg-surface-container-lowest rounded-2xl border border-surface-variant/50 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-container-high/40 border-b border-surface-variant text-[11px] font-label-archival text-outline uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Manuscript &amp; Author</th>
                <th className="py-3.5 px-4">Patron Contributor</th>
                <th className="py-3.5 px-4">License / Rights</th>
                <th className="py-3.5 px-4">PDF Document</th>
                <th className="py-3.5 px-4">Review Status</th>
                <th className="py-3.5 px-4 text-right">Archivist Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-variant/40">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-outline">
                    <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading submissions...</span>
                  </td>
                </tr>
              ) : contributions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-outline font-body-sm">
                    No contributions in this filter category.
                  </td>
                </tr>
              ) : (
                contributions.map((contrib) => {
                  const status = contrib.status;
                  let badge = 'bg-amber-100 text-amber-800';
                  if (status === 'approved') badge = 'bg-emerald-100 text-emerald-800';
                  if (status === 'rejected') badge = 'bg-rose-100 text-rose-800';

                  return (
                    <tr key={contrib._id || contrib.id} className="hover:bg-surface-container/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-serif font-bold text-primary max-w-xs truncate">
                          {contrib.title}
                        </div>
                        <div className="text-[11px] text-outline">
                          by {contrib.author} ({contrib.year || 'N/A'})
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-on-surface">
                          {contrib.contributorName || 'Patron'}
                        </div>
                        <div className="text-[10px] text-outline">
                          {contrib.contributorEmail}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 max-w-[140px] truncate text-on-surface-variant">
                        {contrib.license || 'Public Domain'}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-primary font-medium">
                          <span className="material-symbols-outlined text-base text-rose-600">picture_as_pdf</span>
                          <span className="truncate max-w-[120px]">{contrib.pdfFile?.originalName || 'document.pdf'}</span>
                        </div>
                        <span className="text-[10px] text-outline">
                          {contrib.pdfFile?.fileSize ? (contrib.pdfFile.fileSize / (1024 * 1024)).toFixed(1) + ' MB' : 'Quarantined'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider font-label-archival ${badge}`}>
                          {status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {status === 'under_review' ? (
                            <>
                              <button
                                onClick={() => handleOpenReview(contrib, 'approve')}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-semibold hover:bg-emerald-700 transition-colors shadow-2xs"
                              >
                                Approve &amp; Publish
                              </button>
                              <button
                                onClick={() => handleOpenReview(contrib, 'reject')}
                                className="px-2.5 py-1 rounded-lg bg-surface-container text-rose-700 hover:bg-rose-50 border border-rose-200 text-[11px] font-semibold transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleOpenReview(contrib, status === 'approved' ? 'reject' : 'approve')}
                              className="px-2.5 py-1 rounded-lg bg-surface-container text-on-surface text-[11px] font-medium hover:bg-surface-container-high transition-colors"
                            >
                              Re-examine
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {selectedContrib && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-variant p-6 animate-fadeIn">
            
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-surface-variant">
              <div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-label-archival ${
                  actionType === 'approve' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {actionType === 'approve' ? 'Approve & Catalog' : 'Reject Manuscript'}
                </span>
                <h3 className="font-title-editorial text-lg text-primary font-bold mt-1">
                  {selectedContrib.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedContrib(null)}
                className="p-1 text-on-surface-variant hover:text-on-surface rounded-lg"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <div className="mb-4 p-3 bg-surface-container rounded-xl text-xs space-y-1.5">
              <p><strong className="text-primary font-serif">Author:</strong> {selectedContrib.author}</p>
              <p><strong className="text-primary font-serif">Contributor:</strong> {selectedContrib.contributorName} ({selectedContrib.contributorEmail})</p>
              <p><strong className="text-primary font-serif">License Claim:</strong> {selectedContrib.license}</p>
              <p><strong className="text-primary font-serif">Synopsis:</strong> {selectedContrib.synopsis}</p>
            </div>

            <form onSubmit={handleProcessReview} className="space-y-4 text-xs">
              {actionType === 'approve' && (
                <div>
                  <label className="block text-[11px] font-label-archival text-on-surface uppercase tracking-wider mb-1 font-semibold">
                    Assign Final Canonical Alcove Category *
                  </label>
                  <select
                    value={assignedCategory}
                    onChange={(e) => setAssignedCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-high/30 rounded-xl border border-surface-variant focus:outline-none focus:ring-1 focus:ring-primary text-xs"
                  >
                    {categories.map((c) => (
                      <option key={c._id || c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                  <p className="text-[11px] text-outline mt-1">
                    Approving automatically moves the PDF out of quarantine and creates a published book in the public library catalogue.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-label-archival text-on-surface uppercase tracking-wider mb-1 font-semibold">
                  Curator Review Feedback / Archival Notes
                </label>
                <textarea
                  rows="3"
                  required
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Notes recorded in platform audit log..."
                  className="w-full px-3 py-2 bg-surface-container-high/30 rounded-xl border border-surface-variant focus:outline-none focus:ring-1 focus:ring-primary text-xs"
                />
              </div>

              <div className="pt-3 border-t border-surface-variant flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedContrib(null)}
                  className="px-4 py-2 rounded-xl text-on-surface-variant hover:bg-surface-container font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-5 py-2 rounded-xl text-white font-semibold shadow-md disabled:opacity-60 flex items-center gap-2 ${
                    actionType === 'approve' ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-rose-700 hover:bg-rose-800'
                  }`}
                >
                  {submitting && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  <span>{actionType === 'approve' ? 'Publish to Public Shelves' : 'Confirm Rejection'}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}

