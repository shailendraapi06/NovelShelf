import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { useLibrary } from '../../context/LibraryContext';

export default function AdminBooksPage() {
  const { refreshBooks, showToast } = useLibrary();
  const [searchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null); // null for new, book object for edit
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formAuthor, setFormAuthor] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formGenre, setFormGenre] = useState('');
  const [formYear, setFormYear] = useState('2024');
  const [formPages, setFormPages] = useState('250');
  const [formSynopsis, setFormSynopsis] = useState('');
  const [formQuote, setFormQuote] = useState('');
  const [formQuoteAuthor, setFormQuoteAuthor] = useState('');
  const [formStatus, setFormStatus] = useState('published');
  const [formCoverUrl, setFormCoverUrl] = useState('');
  const [formPdfFile, setFormPdfFile] = useState(null);
  const [formCoverFile, setFormCoverFile] = useState(null);

  const fetchBooksAndCategories = async () => {
    try {
      setLoading(true);
      const [booksRes, catsRes] = await Promise.all([
        api.admin.getBooks({ status: statusFilter !== 'all' ? statusFilter : undefined, search: search.trim() || undefined }),
        api.getCategories()
      ]);
      if (booksRes.success) setBooks(booksRes.books || []);
      if (catsRes.success) setCategories(catsRes.categories || []);
    } catch (err) {
      showToast(err.message || 'Error loading catalogue', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooksAndCategories();
  }, [statusFilter]);

  // Open modal if URL has ?action=new
  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      handleOpenCreate();
    }
  }, [searchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBooksAndCategories();
  };

  const handleOpenCreate = () => {
    setEditingBook(null);
    setFormTitle('');
    setFormSubtitle('');
    setFormAuthor('');
    setFormCategory(categories[0]?.name || 'Fiction');
    setFormGenre('Fiction');
    setFormYear(new Date().getFullYear().toString());
    setFormPages('250');
    setFormSynopsis('');
    setFormQuote('');
    setFormQuoteAuthor('');
    setFormStatus('published');
    setFormCoverUrl('https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800');
    setFormPdfFile(null);
    setFormCoverFile(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (book) => {
    setEditingBook(book);
    setFormTitle(book.title || '');
    setFormSubtitle(book.subtitle || '');
    setFormAuthor(book.author || '');
    setFormCategory(book.category || categories[0]?.name || 'Fiction');
    setFormGenre(book.genre || 'Fiction');
    setFormYear(book.year ? book.year.toString() : '2024');
    setFormPages(book.pages ? book.pages.toString() : '250');
    setFormSynopsis(book.synopsis || '');
    setFormQuote(book.quote || '');
    setFormQuoteAuthor(book.quoteAuthor || '');
    setFormStatus(book.status || 'published');
    setFormCoverUrl(book.coverImage || '');
    setFormPdfFile(null);
    setFormCoverFile(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formTitle.trim() || !formAuthor.trim() || !formSynopsis.trim()) {
      showToast('Title, author, and synopsis are required.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('title', formTitle.trim());
      formData.append('subtitle', formSubtitle.trim());
      formData.append('author', formAuthor.trim());
      formData.append('category', formCategory);
      formData.append('genre', formGenre || formCategory);
      formData.append('year', formYear);
      formData.append('pages', formPages);
      formData.append('synopsis', formSynopsis.trim());
      formData.append('quote', formQuote.trim());
      formData.append('quoteAuthor', formQuoteAuthor.trim());
      formData.append('status', formStatus);
      formData.append('coverUrl', formCoverUrl);

      if (formPdfFile) {
        formData.append('pdf', formPdfFile);
      }
      if (formCoverFile) {
        formData.append('cover', formCoverFile);
      }

      if (editingBook) {
        await api.admin.updateBook(editingBook._id || editingBook.id || editingBook.slug, formData);
        showToast(`"${formTitle}" successfully updated!`, 'success');
      } else {
        await api.admin.createBook(formData);
        showToast(`"${formTitle}" added to canonical library!`, 'success');
      }

      setIsModalOpen(false);
      fetchBooksAndCategories();
      refreshBooks();
    } catch (err) {
      showToast(err.message || 'Error saving book volume.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (book) => {
    const confirmed = window.confirm(`Permanently decommission "${book.title}" from the library? This cannot be undone.`);
    if (!confirmed) return;

    try {
      await api.admin.deleteBook(book._id || book.id || book.slug);
      showToast(`"${book.title}" decommissioned.`, 'info');
      fetchBooksAndCategories();
      refreshBooks();
    } catch (err) {
      showToast(err.message || 'Error deleting book.', 'error');
    }
  };

  const handleToggleStatus = async (book) => {
    const newStatus = book.status === 'published' ? 'draft' : 'published';
    try {
      const formData = new FormData();
      formData.append('status', newStatus);
      await api.admin.updateBook(book._id || book.id || book.slug, formData);
      showToast(`Book status set to ${newStatus}.`, 'success');
      fetchBooksAndCategories();
      refreshBooks();
    } catch (err) {
      showToast(err.message || 'Failed to update status.', 'error');
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
              Catalog Master
            </span>
          </div>
          <h1 className="font-title-editorial text-2xl sm:text-3xl text-primary font-normal">
            Canonical Book Management
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1 font-body-sm">
            Catalog new volumes, update metadata, manage PDF attachments, and control shelf visibility.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-semibold shadow-md hover:bg-primary/95 transition-all self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          <span>Catalog New Book</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-surface-container-lowest rounded-2xl border border-surface-variant/50 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">
            search
          </span>
          <input
            type="text"
            placeholder="Search by title, author, genre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-surface-container-high/40 rounded-xl text-xs font-body-sm border border-surface-variant/60 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </form>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {['all', 'published', 'draft'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                statusFilter === s
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Book Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-surface-variant/50 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-container-high/40 border-b border-surface-variant text-[11px] font-label-archival text-outline uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Folio Volume</th>
                <th className="py-3.5 px-4">Author</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Year / Pages</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-variant/40">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-outline">
                    <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading volumes...</span>
                  </td>
                </tr>
              ) : books.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-outline font-body-sm">
                    No books matched the filter criteria.
                  </td>
                </tr>
              ) : (
                books.map((book) => {
                  const isPub = book.status === 'published';
                  return (
                    <tr key={book._id || book.id || book.slug} className="hover:bg-surface-container/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={book.coverImage || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=120'}
                            alt={book.title}
                            className="w-9 h-13 object-cover rounded shadow-xs shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="font-serif font-bold text-primary block truncate max-w-[200px] sm:max-w-xs">
                              {book.title}
                            </span>
                            <span className="text-[10px] text-outline block truncate">
                              {book.subtitle || book.slug}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-on-surface truncate max-w-[140px]">
                        {book.author}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[11px] font-medium">
                          {book.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-on-surface-variant">
                        {book.year} • {book.pages}p
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleStatus(book)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider font-label-archival transition-all ${
                            isPub
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          }`}
                        >
                          {book.status}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(book)}
                            title="Edit metadata"
                            className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          >
                            <span className="material-symbols-outlined text-base">edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(book)}
                            title="Decommission volume"
                            className="p-1.5 text-error hover:bg-error/10 rounded-lg transition-colors"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
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

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-variant overflow-hidden max-h-[90vh] flex flex-col animate-fadeIn">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-surface-variant/60 flex items-center justify-between bg-surface-container-high/30">
              <div>
                <h3 className="font-title-editorial text-lg text-primary font-bold">
                  {editingBook ? 'Edit Book Folio' : 'Catalog New Book Volume'}
                </h3>
                <p className="text-xs text-on-surface-variant">
                  {editingBook ? `Updating ${editingBook.title}` : 'Add a canonical title to the NovelShelf public library.'}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-on-surface-variant hover:text-on-surface rounded-lg"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-label-archival text-on-surface uppercase tracking-wider mb-1 font-semibold">
                    Volume Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. The Aleph and Other Stories"
                    className="w-full px-3 py-2 bg-surface-container-high/30 rounded-xl border border-surface-variant focus:outline-none focus:ring-1 focus:ring-primary text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-label-archival text-on-surface uppercase tracking-wider mb-1 font-semibold">
                    Author *
                  </label>
                  <input
                    type="text"
                    required
                    value={formAuthor}
                    onChange={(e) => setFormAuthor(e.target.value)}
                    placeholder="e.g. Jorge Luis Borges"
                    className="w-full px-3 py-2 bg-surface-container-high/30 rounded-xl border border-surface-variant focus:outline-none focus:ring-1 focus:ring-primary text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-label-archival text-on-surface uppercase tracking-wider mb-1 font-semibold">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={formSubtitle}
                  onChange={(e) => setFormSubtitle(e.target.value)}
                  placeholder="e.g. Reflections on Infinity and Labyrinths"
                  className="w-full px-3 py-2 bg-surface-container-high/30 rounded-xl border border-surface-variant focus:outline-none focus:ring-1 focus:ring-primary text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-label-archival text-on-surface uppercase tracking-wider mb-1 font-semibold">
                    Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-high/30 rounded-xl border border-surface-variant focus:outline-none focus:ring-1 focus:ring-primary text-xs"
                  >
                    {categories.map((c) => (
                      <option key={c._id || c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-label-archival text-on-surface uppercase tracking-wider mb-1 font-semibold">
                    Publication Year
                  </label>
                  <input
                    type="number"
                    value={formYear}
                    onChange={(e) => setFormYear(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-high/30 rounded-xl border border-surface-variant focus:outline-none focus:ring-1 focus:ring-primary text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-label-archival text-on-surface uppercase tracking-wider mb-1 font-semibold">
                    Total Pages
                  </label>
                  <input
                    type="number"
                    value={formPages}
                    onChange={(e) => setFormPages(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-high/30 rounded-xl border border-surface-variant focus:outline-none focus:ring-1 focus:ring-primary text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-label-archival text-on-surface uppercase tracking-wider mb-1 font-semibold">
                  Synopsis / Archival Annotation *
                </label>
                <textarea
                  rows="3"
                  required
                  value={formSynopsis}
                  onChange={(e) => setFormSynopsis(e.target.value)}
                  placeholder="Summary of narrative, philosophical depth, and provenance."
                  className="w-full px-3 py-2 bg-surface-container-high/30 rounded-xl border border-surface-variant focus:outline-none focus:ring-1 focus:ring-primary text-xs"
                />
              </div>

              {/* Cover URL & File Upload */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-label-archival text-on-surface uppercase tracking-wider mb-1 font-semibold">
                    Cover Image URL
                  </label>
                  <input
                    type="text"
                    value={formCoverUrl}
                    onChange={(e) => setFormCoverUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-surface-container-high/30 rounded-xl border border-surface-variant focus:outline-none focus:ring-1 focus:ring-primary text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-label-archival text-on-surface uppercase tracking-wider mb-1 font-semibold">
                    Attach Digital PDF Manuscript
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setFormPdfFile(e.target.files ? e.target.files[0] : null)}
                    className="w-full text-xs text-outline file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-[11px] font-label-archival text-on-surface uppercase tracking-wider mb-1 font-semibold">
                  Shelf Visibility Status
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-high/30 rounded-xl border border-surface-variant focus:outline-none focus:ring-1 focus:ring-primary text-xs"
                >
                  <option value="published">Published (Visible in Public Catalogue)</option>
                  <option value="draft">Draft (Restricted / In Archival Preparation)</option>
                </select>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-surface-variant/60 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-on-surface-variant hover:bg-surface-container text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold shadow-md hover:bg-primary/95 disabled:opacity-60 flex items-center gap-2"
                >
                  {submitting && <div className="w-3.5 h-3.5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />}
                  <span>{editingBook ? 'Update Volume' : 'Catalog Volume'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

