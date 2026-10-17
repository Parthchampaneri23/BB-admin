'use client';

import React, { useEffect, useState } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  XCircle,
  FolderPlus,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  Save,
  X,
} from 'lucide-react';

interface SubCategory {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  order?: number;
  status: 'active' | 'inactive';
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  order: number;
  status: 'active' | 'inactive';
  subCategories: SubCategory[];
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});

  // Category Modal Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formOrder, setFormOrder] = useState('0');
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');

  // SubCategory Add Form State
  const [activeCatForSub, setActiveCatForSub] = useState<Category | null>(null);
  const [subName, setSubName] = useState('');
  const [subSlug, setSubSlug] = useState('');
  const [subDesc, setSubDesc] = useState('');

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories);
        // Expand first 3 by default
        const initExpanded: Record<string, boolean> = {};
        data.categories.forEach((c: Category, i: number) => {
          if (i < 3) initExpanded[c._id] = true;
        });
        setExpandedCats(initExpanded);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedCats((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const openAddCategory = () => {
    setEditingCatId(null);
    setFormName('');
    setFormSlug('');
    setFormDesc('');
    setFormOrder('0');
    setFormStatus('active');
    setIsModalOpen(true);
  };

  const openEditCategory = (cat: Category) => {
    setEditingCatId(cat._id);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setFormDesc(cat.description || '');
    setFormOrder(cat.order.toString());
    setFormStatus(cat.status);
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formName.trim()) {
      setError('Category Name is required');
      return;
    }

    try {
      if (editingCatId) {
        // Update
        const res = await fetch(`/api/categories/${editingCatId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formName,
            slug: formSlug || formName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            description: formDesc,
            order: Number(formOrder),
            status: formStatus,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setSuccess('Category updated successfully');
      } else {
        // Create
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formName,
            slug: formSlug || formName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            description: formDesc,
            order: Number(formOrder),
            status: formStatus,
            subCategories: [],
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setSuccess('Category created successfully');
      }

      setIsModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete category "${name}" and all its subcategories?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess('Category deleted successfully');
      fetchCategories();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // SubCategory Handlers
  const handleAddSubCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCatForSub || !subName.trim()) return;

    try {
      const updatedSubCategories = [
        ...activeCatForSub.subCategories,
        {
          name: subName.trim(),
          slug: subSlug || subName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-'),
          description: subDesc.trim(),
          order: activeCatForSub.subCategories.length + 1,
          status: 'active' as const,
        },
      ];

      const res = await fetch(`/api/categories/${activeCatForSub._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subCategories: updatedSubCategories,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSubName('');
      setSubSlug('');
      setSubDesc('');
      setActiveCatForSub(null);
      setSuccess('Subcategory added successfully');
      fetchCategories();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteSubCategory = async (cat: Category, subIndex: number) => {
    if (!confirm('Remove this subcategory?')) return;
    try {
      const updatedSubCategories = cat.subCategories.filter((_, idx) => idx !== subIndex);
      const res = await fetch(`/api/categories/${cat._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subCategories: updatedSubCategories,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess('Subcategory removed');
      fetchCategories();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-[#01142e] tracking-tight">
            Dynamic Category & Sub-Category Module
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Configure primary news desks, nested topics, navigation slugs, and status.
          </p>
        </div>
        <button
          onClick={openAddCategory}
          className="inline-flex items-center gap-2 bg-[#01142e] hover:bg-[#0069f7] text-white px-4 py-2.5 rounded-xl font-semibold text-xs tracking-wider uppercase transition shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Primary Category
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center justify-between p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="font-bold hover:underline">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="flex items-center justify-between p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess('')} className="font-bold hover:underline">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Categories Tree / List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-gray-400 text-xs">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="bg-white rounded-xl p-8 border border-gray-200 text-center">
            <Layers className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-700">No categories found</p>
            <p className="text-xs text-gray-400 mt-1">
              Create your first category or click sync from dashboard.
            </p>
          </div>
        ) : (
          categories.map((cat) => {
            const isExpanded = !!expandedCats[cat._id];
            return (
              <div
                key={cat._id}
                className="bg-white rounded-xl border border-gray-200/90 shadow-xs overflow-hidden transition"
              >
                {/* Category Bar */}
                <div className="p-4 flex items-center justify-between gap-4 bg-[#fafcff] border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleExpand(cat._id)}
                      className="p-1 rounded hover:bg-gray-200 text-gray-500 transition cursor-pointer"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-sm text-[#01142e]">{cat.name}</span>
                        <span className="text-[11px] font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                          /{cat.slug}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            cat.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {cat.status}
                        </span>
                      </div>
                      {cat.description && (
                        <p className="text-xs text-gray-500 mt-0.5">{cat.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveCatForSub(cat)}
                      className="px-2.5 py-1 text-xs font-semibold text-[#0069f7] bg-blue-50 hover:bg-blue-100 rounded-lg transition flex items-center gap-1 cursor-pointer"
                      title="Add Sub-Category"
                    >
                      <FolderPlus className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Add Sub</span>
                    </button>

                    <button
                      onClick={() => openEditCategory(cat)}
                      className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                      title="Edit Category"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteCategory(cat._id, cat.name)}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition cursor-pointer"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* SubCategories Drawer */}
                {isExpanded && (
                  <div className="p-4 bg-white space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                      Sub-Categories ({cat.subCategories?.length || 0})
                    </div>

                    {!cat.subCategories || cat.subCategories.length === 0 ? (
                      <p className="text-xs text-gray-400 italic pl-6">
                        No nested subcategories configured yet.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pl-4">
                        {cat.subCategories.map((sub, idx) => (
                          <div
                            key={sub.slug || idx}
                            className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 bg-[#fbfcfd] hover:border-blue-200 transition"
                          >
                            <div>
                              <p className="text-xs font-bold text-gray-800">{sub.name}</p>
                              <p className="text-[10px] font-mono text-gray-400">/{sub.slug}</p>
                            </div>
                            <button
                              onClick={() => handleDeleteSubCategory(cat, idx)}
                              className="text-gray-400 hover:text-red-500 p-1 transition cursor-pointer"
                              title="Delete subcategory"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-[#01142e]">
                {editingCatId ? 'Edit Category' : 'Create Primary Category'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    if (!editingCatId) {
                      setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                    }
                  }}
                  required
                  placeholder="e.g. Markets"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0069f7] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  URL Slug *
                </label>
                <input
                  type="text"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  required
                  placeholder="e.g. markets"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#0069f7] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  rows={2}
                  placeholder="Brief desk synopsis"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0069f7] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formOrder}
                    onChange={(e) => setFormOrder(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0069f7] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e: any) => setFormStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0069f7] focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#01142e] hover:bg-[#0069f7] text-white rounded-lg text-xs font-semibold tracking-wider uppercase transition"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add SubCategory Modal */}
      {activeCatForSub && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#0069f7] tracking-wider">
                  Parent: {activeCatForSub.name}
                </span>
                <h3 className="text-base font-bold text-[#01142e]">Add Sub-Category</h3>
              </div>
              <button
                onClick={() => setActiveCatForSub(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubCategory} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Sub-Category Name *
                </label>
                <input
                  type="text"
                  value={subName}
                  onChange={(e) => {
                    setSubName(e.target.value);
                    setSubSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                  }}
                  required
                  placeholder="e.g. Mutual Funds"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0069f7] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Sub-Category Slug *
                </label>
                <input
                  type="text"
                  value={subSlug}
                  onChange={(e) => setSubSlug(e.target.value)}
                  required
                  placeholder="e.g. mutual-funds"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#0069f7] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={subDesc}
                  onChange={(e) => setSubDesc(e.target.value)}
                  placeholder="Optional details"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0069f7] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setActiveCatForSub(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0069f7] hover:bg-[#0058d0] text-white rounded-lg text-xs font-semibold tracking-wider uppercase transition"
                >
                  Add Sub-Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
