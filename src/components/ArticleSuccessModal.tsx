'use client';

import React from 'react';
import Link from 'next/link';
import { Check, ExternalLink, ArrowLeft, Newspaper, Sparkles, X } from 'lucide-react';

interface ArticleSuccessModalProps {
  isOpen: boolean;
  onClose?: () => void;
  mode: 'create' | 'edit';
  article: {
    id: string;
    title: string;
    category?: string;
    categoryLabel?: string;
    slug?: string;
  } | null;
}

export default function ArticleSuccessModal({
  isOpen,
  onClose,
  mode,
  article,
}: ArticleSuccessModalProps) {
  if (!isOpen || !article) return null;

  // Compute public live article URL
  // The public website runs on port 3000 (or uses the public host)
  const getPublicArticleUrl = () => {
    const articleIdentifier = article.slug || article.id;
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      // In local dev, admin is typically on 4036/3001, website is on 3000
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return `http://${hostname}:3000/article/${articleIdentifier}`;
      }
      // In production / same host, or subdomains:
      // If admin is admin.businessbullet.com, public site is businessbullet.com
      const domain = hostname.replace(/^admin\./, '');
      const protocol = window.location.protocol;
      return `${protocol}//${domain}/article/${articleIdentifier}`;
    }
    return `/article/${article.slug || article.id}`;
  };

  const isCreate = mode === 'create';
  const headline = isCreate
    ? 'News Successfully Uploaded!'
    : 'Article Updated Successfully!';
  const subtext = isCreate
    ? 'Your article has been saved to the database and is now live across the platform.'
    : 'All changes and revisions have been successfully saved and updated live.';

  const publicUrl = getPublicArticleUrl();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Darkened backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modern Card Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 md:p-8 overflow-hidden z-10 animate-in zoom-in-95 fade-in duration-200">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-emerald-100/60 blur-3xl -z-10 rounded-full pointer-events-none" />

        {/* Close button */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition cursor-pointer"
            title="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Icon & Heading */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs">
            <Check className="w-8 h-8 stroke-[2.5]" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl md:text-2xl font-bold text-[#01142e] tracking-tight">
              {headline}
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
              {subtext}
            </p>
          </div>
        </div>

        {/* Article Summary Box */}
        <div className="mt-6 bg-[#f8fbff] border border-blue-100 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#0069f7] uppercase tracking-wider bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/60">
              <Newspaper className="w-3 h-3" />
              <span>{article.categoryLabel || article.category || 'News'}</span>
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Published
            </span>
          </div>

          <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug pt-1">
            {article.title}
          </h4>
        </div>

        {/* Actions */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#0069f7] hover:bg-[#0058d0] active:bg-[#004bb3] text-white rounded-xl text-xs font-bold tracking-wide uppercase shadow-md hover:shadow-lg transition cursor-pointer"
          >
            <span>View Live Article</span>
            <ExternalLink className="w-4 h-4" />
          </a>

          <Link
            href="/dashboard/news"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-800 rounded-xl text-xs font-bold tracking-wide uppercase transition cursor-pointer border border-gray-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Articles</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
