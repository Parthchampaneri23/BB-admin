'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  ExternalLink,
  CheckCircle,
  Clock,
  Archive,
  AlertCircle,
  Eye,
} from 'lucide-react';

interface NewsItem {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  category: string;
  categoryLabel: string;
  subCategory?: string;
  subCategoryLabel?: string;
  imageUrl: string;
  author: string;
  readTime: string;
  status: 'published' | 'draft' | 'archived';
  isTrending: boolean;
  isFeatured?: boolean;
  isBreaking?: boolean;
  pubDate: string;
  createdAt: string;
}

export default function NewsListPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [categories, setCategories] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchNews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '15',
        search,
        category: selectedCategory,
        status: selectedStatus,
      });

      const res = await fetch(`/api/news?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setNews(data.news);
        setTotalPages(data.pagination.pages);
        setTotalCount(data.pagination.total);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch news');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch categories for filtering dropdown
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCategories(data.categories);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetchNews();
  }, [page, selectedCategory, selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchNews();
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete article:\n"${title}"?`)) return;

    try {
      const res = await fetch(`/api/news/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess('Article deleted successfully');
      fetchNews();
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
            News & Editorial Articles
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Displaying {totalCount} total dispatches across all news desks.
          </p>
        </div>

        <Link
          href="/dashboard/news/create"
          className="inline-flex items-center gap-2 bg-[#0069f7] hover:bg-[#0058d0] text-white px-4 py-2.5 rounded-xl font-semibold text-xs tracking-wider uppercase transition shadow-md"
        >
          <Plus className="w-4 h-4" />
          Create New Article
        </Link>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="font-bold hover:underline">
            ✕
          </button>
        </div>
      )}

      {success && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess('')} className="font-bold hover:underline">
            ✕
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200/90 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search headline, summary or author..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0069f7]"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0069f7]"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0069f7]"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-white rounded-xl border border-gray-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#fafcff] text-gray-500 uppercase tracking-wider font-bold border-b border-gray-100">
              <tr>
                <th className="px-5 py-3.5">Image & Headline</th>
                <th className="px-4 py-3.5">Category & Sub</th>
                <th className="px-4 py-3.5">Author</th>
                <th className="px-4 py-3.5">Date</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-gray-400">
                    Loading articles...
                  </td>
                </tr>
              ) : news.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-gray-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    No articles match your criteria.
                  </td>
                </tr>
              ) : (
                news.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50/70 transition">
                    <td className="px-5 py-3 flex items-center gap-3 min-w-[280px]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.imageUrl}
                        alt=""
                        className="w-12 h-10 rounded-md object-cover bg-gray-100 border border-gray-200 shrink-0"
                        onError={(e: any) => {
                          e.target.src = '/bb-logo.png';
                        }}
                      />
                      <div>
                        <Link
                          href={`/dashboard/news/edit/${item._id}`}
                          className="font-semibold text-gray-900 hover:text-[#0069f7] line-clamp-2 leading-snug"
                        >
                          {item.title}
                        </Link>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-gray-400">{item.readTime}</span>
                          {item.isBreaking && (
                            <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border border-red-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                              Breaking
                            </span>
                          )}
                          {item.isFeatured && (
                            <span className="bg-blue-100 text-[#0069f7] text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border border-blue-200">
                              Featured
                            </span>
                          )}
                          {item.isTrending && (
                            <span className="bg-amber-100 text-amber-800 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border border-amber-200">
                              Trending
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-semibold text-[#0069f7] bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                        {item.categoryLabel || item.category}
                      </span>
                      {item.subCategoryLabel && (
                        <span className="block text-[10px] text-gray-500 mt-0.5">
                          ↳ {item.subCategoryLabel}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-gray-600 font-medium">
                      {item.author}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-gray-400 text-[11px]">
                      {new Date(item.pubDate || item.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          item.status === 'published'
                            ? 'bg-emerald-50 text-emerald-700'
                            : item.status === 'draft'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-right space-x-2">
                      <Link
                        href={`/dashboard/news/edit/${item._id}`}
                        className="p-1.5 text-gray-500 hover:text-[#0069f7] hover:bg-gray-100 rounded-lg inline-block transition"
                        title="Edit Article"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        onClick={() => handleDelete(item._id, item.title)}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg inline-block transition cursor-pointer"
                        title="Delete Article"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 bg-[#fafcff] border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="text-gray-500">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg font-semibold hover:bg-white disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg font-semibold hover:bg-white disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
