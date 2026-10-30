import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useLibrary } from '../../context/LibraryContext';

export default function AdminCategoriesPage() {
  const { showToast } = useLibrary();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('auto_stories');
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.getCategories();
      if (res.success) {
        setCategories(res.categories || []);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setIcon('auto_stories');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setIcon(cat.icon || 'auto_stories');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Category name is required.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      if (editingCategory) {
        await api.admin.updateCategory(editingCategory._id || editingCategory.id || editingCategory.slug, {
          name: name.trim(),
          description: description.trim(),
          icon
        });
        showToast(`Category "${name}" updated.`, 'success');
      } else {
        await api.admin.createCategory({
          name: name.trim(),
          description: description.trim(),
          icon
        });
        showToast(`Category "${name}" created.`, 'success');
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      showToast(err.message || 'Error saving category', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (cat) => {
    if (cat.bookCount > 0) {
      const confirm = window.confirm(`Category "${cat.name}" contains ${cat.bookCount} books. Are you sure you wish to remove this category?`);
      if (!confirm) return;
    } else {
      const confirm = window.confirm(`Delete category "${cat.name}"?`);
      if (!confirm) return;
    }

    try {
      await api.admin.deleteCategory(cat._id || cat.id || cat.slug);
      showToast(`Category "${cat.name}" removed.`, 'info');
      fetchCategories();
    } catch (err) {
      showToast(err.message || 'Error deleting category', 'error');
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
              Archival Alcoves
            </span>
          </div>
          <h1 className="font-title-editorial text-2xl sm:text-3xl text-primary font-normal">
            Category &amp; Alcove Organization
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1 font-body-sm">
            Structure the sanctuary shelves into literary genres, periods, and curated disciplines.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-semibold shadow-md hover:bg-primary/95 transition-all self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          <span>New Category</span>
        </button>
      </div>

      {/* Grid of Categories */}
      {loading ? (
        <div className="p-12 text-center text-outline">
          <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-2" />
          <span className="text-xs">Loading alcoves...</span>
        </div>
      ) : categories.length === 0 ? (
        <div className="p-12 text-center text-outline bg-surface-container-lowest rounded-2xl border border-surface-variant">
          No categories found. Click "New Category" to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div
              key={cat._id || cat.slug || cat.name}
              className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-variant/50 shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-2xl">
                      {cat.icon || 'auto_stories'}
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-primary text-[11px] font-bold">
                    {cat.bookCount || 0} folios
                  </span>
                </div>
                <h3 className="font-serif text-base font-bold text-primary">{cat.name}</h3>
                <p className="text-xs text-on-surface-variant mt-1 line-clamp-2 leading-relaxed">
                  {cat.description || 'Curated canonical shelf.'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-surface-variant/40 flex items-center justify-between text-xs">
                <span className="text-[10px] text-outline font-label-archival uppercase">
                  Slug: {cat.slug || cat.name.toLowerCase()}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    title="Edit category"
                  >
                    <span className="material-symbols-outlined text-base">edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(cat)}
                    className="p-1.5 text-error hover:bg-error/10 rounded-lg transition-colors"
                    title="Delete category"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-variant p-6 animate-fadeIn">
            <h3 className="font-title-editorial text-lg text-primary font-bold mb-4">
              {editingCategory ? 'Edit Category' : 'Create Library Category'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-label-archival text-on-surface uppercase tracking-wider mb-1 font-semibold">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Classic Literature"
                  className="w-full px-3 py-2 bg-surface-container-high/30 rounded-xl border border-surface-variant focus:outline-none focus:ring-1 focus:ring-primary text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-label-archival text-on-surface uppercase tracking-wider mb-1 font-semibold">
                  Material Icon Name
                </label>
                <input
                  type="text"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder="e.g. auto_stories, castle, rocket_launch"
                  className="w-full px-3 py-2 bg-surface-container-high/30 rounded-xl border border-surface-variant focus:outline-none focus:ring-1 focus:ring-primary text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-label-archival text-on-surface uppercase tracking-wider mb-1 font-semibold">
                  Alcove Description
                </label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description of genres and literary movements..."
                  className="w-full px-3 py-2 bg-surface-container-high/30 rounded-xl border border-surface-variant focus:outline-none focus:ring-1 focus:ring-primary text-xs"
                />
              </div>

              <div className="pt-3 border-t border-surface-variant flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-on-surface-variant hover:bg-surface-container font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-primary text-on-primary font-semibold shadow-md hover:bg-primary/95 disabled:opacity-60"
                >
                  {submitting ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Alcove'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

