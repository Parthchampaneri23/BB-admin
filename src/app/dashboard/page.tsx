'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Layers,
  TrendingUp,
  PlusCircle,
  Database,
  ArrowUpRight,
  Clock,
  Eye,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [recentNews, setRecentNews] = useState<any[]>([]);
  const [categoryStats, setCategoryStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dashboard/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setRecentNews(data.recentNews || []);
        setCategoryStats(data.categoryStats || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard stats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSeedData = async () => {
    try {
      setSeeding(true);
      setSeedMessage('Downloading assets and synchronizing MongoDB database...');
      const res = await fetch('/api/seed?force=true', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSeedMessage(`Database successfully populated: ${data.totalCategories} categories, ${data.totalNews} articles.`);
        fetchStats();
      } else {
        setSeedMessage(`Error: ${data.error}`);
      }
    } catch (err: any) {
      setSeedMessage(`Error seeding data: ${err.message}`);
    } finally {
      setSeeding(false);
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-8 h-8 text-[#0069f7] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-[#01142e] via-[#042452] to-[#073674] rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-xs font-medium text-blue-200 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Editorial Control Panel
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              BusinessBulletin Editorial Overview
            </h1>
            <p className="text-sm text-blue-100/80 mt-1 max-w-2xl leading-relaxed">
              Manage dynamic categories, sub-categories, market reports, and daily financial news articles. All media assets are stored locally in the secure uploads pipeline.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard/news/create"
              className="inline-flex items-center gap-2 bg-[#0069f7] hover:bg-[#0058d0] text-white px-4 py-2.5 rounded-xl font-semibold text-xs tracking-wider uppercase transition shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              Write New Article
            </Link>

            <button
              onClick={handleSeedData}
              disabled={seeding}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2.5 rounded-xl font-semibold text-xs tracking-wider uppercase transition cursor-pointer disabled:opacity-50"
              title="Populate database with live data from BB-website"
            >
              <Database className="w-4 h-4 text-cyan-300" />
              {seeding ? 'Syncing...' : 'Sync / Seed Live Data'}
            </button>
          </div>
        </div>
      </div>

      {seedMessage && (
        <div className="bg-blue-50 border border-blue-200 text-blue-900 px-4 py-3 rounded-xl text-xs flex items-center justify-between animate-in fade-in">
          <span>{seedMessage}</span>
          <button onClick={() => setSeedMessage('')} className="text-blue-500 font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Total Articles</p>
            <h3 className="text-2xl font-black text-[#01142e] mt-1">{stats?.totalNews || 0}</h3>
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-0.5 mt-0.5">
              <CheckCircle2 className="w-3 h-3" /> In database
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0069f7] flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Categories & Sub</p>
            <h3 className="text-2xl font-black text-[#01142e] mt-1">{stats?.totalCategories || 0}</h3>
            <span className="text-[11px] text-[#0069f7] font-semibold flex items-center gap-0.5 mt-0.5">
              Multi-level Dynamic
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Published</p>
            <h3 className="text-2xl font-black text-[#01142e] mt-1">{stats?.publishedNews || 0}</h3>
            <span className="text-[11px] text-gray-500 font-medium mt-0.5">Live on website</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Drafts / In Review</p>
            <h3 className="text-2xl font-black text-[#01142e] mt-1">{stats?.draftNews || 0}</h3>
            <span className="text-[11px] text-amber-600 font-semibold mt-0.5">Pending release</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Articles & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Articles Table (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#01142e]">Latest Editorial Dispatches</h2>
              <p className="text-xs text-gray-500">Recently published financial and market news</p>
            </div>
            <Link
              href="/dashboard/news"
              className="text-xs font-semibold text-[#0069f7] hover:underline flex items-center gap-1"
            >
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#fafcff] text-gray-500 uppercase tracking-wider font-bold border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3">Article Title</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentNews.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-gray-400">
                      No articles in database yet. Click &ldquo;Sync / Seed Live Data&rdquo; above!
                    </td>
                  </tr>
                ) : (
                  recentNews.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50/70 transition">
                      <td className="px-5 py-3.5 font-medium text-gray-900 max-w-sm truncate">
                        {item.title}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#0069f7] font-semibold text-[10px]">
                          {item.categoryLabel || item.category}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            item.status === 'published'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Link
                          href={`/dashboard/news/edit/${item._id}`}
                          className="text-[#0069f7] hover:text-[#01142e] font-semibold"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Category Breakdown (1 col) */}
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs p-5">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-base font-bold text-[#01142e]">Section Coverage</h2>
              <p className="text-xs text-gray-500">Distribution across news desks</p>
            </div>
            <Link href="/dashboard/categories" className="text-xs text-[#0069f7] font-semibold hover:underline">
              Manage
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {categoryStats.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">Sync data to view distribution</p>
            ) : (
              categoryStats.map((cat) => (
                <div key={cat._id} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50">
                  <span className="text-xs font-semibold text-gray-800">{cat._id || 'Unassigned'}</span>
                  <span className="text-xs font-bold px-2 py-0.5 bg-white rounded border border-gray-200 text-gray-700">
                    {cat.count} articles
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
