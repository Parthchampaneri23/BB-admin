'use client';

import React, { useEffect, useState, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  Save,
  ArrowLeft,
  Upload,
  Link as LinkIcon,
  CheckCircle,
  AlertCircle,
  Globe,
  Code2,
  Sparkles,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';

interface SubCategory {
  _id?: string;
  name: string;
  slug: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  subCategories: SubCategory[];
}

export default function EditNewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [summary, setSummary] = useState('');
  const [fullText, setFullText] = useState('');
  const [category, setCategory] = useState('');
  const [categoryLabel, setCategoryLabel] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [subCategoryLabel, setSubCategoryLabel] = useState('');
  const [url, setUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [author, setAuthor] = useState('');
  const [readTime, setReadTime] = useState('');
  const [status, setStatus] = useState<'published' | 'draft' | 'archived'>('published');
  const [isTrending, setIsTrending] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);

  // SEO Fields
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [schemaMarkup, setSchemaMarkup] = useState('');

  // Categories & SubCategories
  const [categories, setCategories] = useState<Category[]>([]);
  const [availableSubCats, setAvailableSubCats] = useState<SubCategory[]>([]);

  // State
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'download'>('upload');
  const [remoteImageUrl, setRemoteImageUrl] = useState('');
  const [downloadingImage, setDownloadingImage] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Auto generate SEO and Schema
  const handleAutoGenerateSEO = () => {
    if (!title.trim()) {
      setError('Article title cannot be empty.');
      return;
    }
    const cleanSlug = slug || title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
    const generatedMetaTitle = `${title.trim()} | BusinessBulletin`;
    const generatedMetaDesc = summary ? summary.slice(0, 155) : title.slice(0, 155);
    const generatedCanonical = `https://businessbulletin.com/article/${cleanSlug}`;

    const keywordsList = [
      categoryLabel || 'business news',
      subCategoryLabel || '',
      'stock market',
      'economy',
      'india financial news',
      title.split(' ').slice(0, 4).join(' '),
    ].filter(Boolean).join(', ');

    const sampleSchema = {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      'headline': title.trim(),
      'description': summary.trim(),
      'image': [imageUrl || 'https://businessbulletin.com/updatedlogo.svg'],
      'datePublished': new Date().toISOString(),
      'author': [
        {
          '@type': 'Person',
          'name': author || 'BusinessBulletin Desk',
        },
      ],
      'publisher': {
        '@type': 'Organization',
        'name': 'BusinessBulletin',
        'logo': {
          '@type': 'ImageObject',
          'url': 'https://businessbulletin.com/updatedlogo.svg',
        },
      },
      'mainEntityOfPage': {
        '@type': 'WebPage',
        '@id': generatedCanonical,
      },
      'articleSection': categoryLabel || 'Markets',
    };

    setMetaTitle(generatedMetaTitle);
    setMetaDescription(generatedMetaDesc);
    setMetaKeywords(keywordsList);
    setCanonicalUrl(generatedCanonical);
    setSchemaMarkup(JSON.stringify(sampleSchema, null, 2));
    setSuccess('SEO Meta tags and JSON-LD Schema markup updated!');
  };

  // 1. Fetch Categories & Article
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [catRes, newsRes] = await Promise.all([
          fetch('/api/categories'),
          fetch(`/api/news/${id}`),
        ]);

        const catData = await catRes.json();
        const newsData = await newsRes.json();

        if (catData.success) {
          setCategories(catData.categories);
        }

        if (newsData.success && newsData.article) {
          const a = newsData.article;
          setTitle(a.title || '');
          setSlug(a.slug || '');
          setSummary(a.summary || '');
          setFullText(a.fullText || '');
          setCategory(a.category || '');
          setCategoryLabel(a.categoryLabel || '');
          setSubCategory(a.subCategory || '');
          setSubCategoryLabel(a.subCategoryLabel || '');
          setUrl(a.url || '');
          setImageUrl(a.imageUrl || '');
          setAuthor(a.author || '');
          setReadTime(a.readTime || '');
          setStatus(a.status || 'published');
          setIsTrending(Boolean(a.isTrending));
          setIsFeatured(Boolean(a.isFeatured));

          // SEO Fields
          setMetaTitle(a.metaTitle || `${a.title} | BusinessBulletin`);
          setMetaDescription(a.metaDescription || (a.summary ? a.summary.slice(0, 155) : ''));
          setMetaKeywords(a.metaKeywords || '');
          setCanonicalUrl(a.canonicalUrl || `https://businessbulletin.com/article/${a.slug}`);
          setSchemaMarkup(a.schemaMarkup || '');

          const matchedCat = catData.categories?.find((c: any) => c.slug === a.category);
          if (matchedCat) {
            setAvailableSubCats(matchedCat.subCategories || []);
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load article');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  const handleCategoryChange = (catSlug: string) => {
    setCategory(catSlug);
    const selected = categories.find((c) => c.slug === catSlug);
    if (selected) {
      setCategoryLabel(selected.name);
      setAvailableSubCats(selected.subCategories || []);
      setSubCategory('');
      setSubCategoryLabel('');
    }
  };

  const handleSubCategoryChange = (subSlug: string) => {
    setSubCategory(subSlug);
    const selected = availableSubCats.find((s) => s.slug === subSlug);
    if (selected) {
      setSubCategoryLabel(selected.name);
    } else {
      setSubCategoryLabel('');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setImageUrl(data.url);
      setSuccess('Image uploaded and saved to /uploads!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDownloadImage = async () => {
    if (!remoteImageUrl.trim()) {
      setError('Please provide an image URL to download');
      return;
    }

    setDownloadingImage(true);
    setError('');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: remoteImageUrl.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Image download failed');

      setImageUrl(data.url);
      setSuccess('Image successfully downloaded into /uploads!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDownloadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title.trim()) {
      setError('Article Title cannot be empty.');
      return;
    }
    if (!summary.trim()) {
      setError('Article Summary cannot be empty.');
      return;
    }
    if (!fullText.trim()) {
      setError('Long  Descriptioncannot be empty.');
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(`/api/news/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          summary,
          fullText,
          category,
          categoryLabel,
          subCategory,
          subCategoryLabel,
          url,
          imageUrl,
          author,
          readTime,
          status,
          isTrending,
          isFeatured,
          // SEO
          metaTitle,
          metaDescription,
          metaKeywords,
          canonicalUrl,
          schemaMarkup,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');

      setSuccess('Article updated successfully!');
      setTimeout(() => {
        router.push('/dashboard/news');
      }, 1000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-16 text-gray-400 text-xs">Loading article details...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/news"
            className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#01142e] tracking-tight">
              Edit Article & SEO Settings
            </h1>
            <p className="text-xs text-gray-500">
              Update article content, taxonomy, search metadata, and schema.org markup.
            </p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-[#0069f7] hover:bg-[#0058d0] text-white px-5 py-2.5 rounded-xl font-semibold text-xs tracking-wider uppercase transition shadow-md cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving Changes...' : 'Save Changes'}
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2.5">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {/* Form Grid */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-5 rounded-xl border border-gray-200/90 shadow-xs space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
              Headline <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-[#0069f7] focus:outline-none"
            />
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200/90 shadow-xs space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
              Summary / Lead <span className="text-red-500">*</span>
            </label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              required
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-[#0069f7] focus:outline-none"
            />
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200/90 shadow-xs space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
              Full Body Content <span className="text-red-500">*</span>
            </label>
            <textarea
              value={fullText}
              onChange={(e) => setFullText(e.target.value)}
              required
              rows={12}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm leading-relaxed text-gray-800 focus:ring-2 focus:ring-[#0069f7] focus:outline-none font-sans"
            />
          </div>

          {/* SEO & Structured Data Module */}
          <div className="bg-white p-6 rounded-xl border border-[#0069f7]/20 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#0069f7]" />
                <div>
                  <h3 className="text-sm font-bold text-[#01142e]">
                    SEO Meta & Structured Schema Markup
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Search engine rankings, OpenGraph previews & Schema.org JSON-LD
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAutoGenerateSEO}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#0069f7] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Auto Generate SEO
              </button>
            </div>

            {/* SEO Meta Title */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                  SEO Meta Title
                </label>
                <span className="text-[10px] text-gray-400">
                  {metaTitle.length} / 60 characters
                </span>
              </div>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="Custom title tag for Google and search engines"
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-xs text-gray-900 focus:ring-2 focus:ring-[#0069f7] focus:outline-none"
              />
            </div>

            {/* SEO Meta Description */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                  SEO Meta Description
                </label>
                <span className="text-[10px] text-gray-400">
                  {metaDescription.length} / 160 characters
                </span>
              </div>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                rows={2}
                placeholder="High-converting search snippet preview for SERPs"
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-xs text-gray-900 focus:ring-2 focus:ring-[#0069f7] focus:outline-none"
              />
            </div>

            {/* SEO Meta Keywords & Canonical */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Meta Keywords
                </label>
                <input
                  type="text"
                  value={metaKeywords}
                  onChange={(e) => setMetaKeywords(e.target.value)}
                  placeholder="stocks, economy, nifty, q2 results"
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-xs text-gray-900 focus:ring-2 focus:ring-[#0069f7] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Canonical Link
                </label>
                <input
                  type="url"
                  value={canonicalUrl}
                  onChange={(e) => setCanonicalUrl(e.target.value)}
                  placeholder="https://businessbulletin.com/article/..."
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-xs text-gray-900 focus:ring-2 focus:ring-[#0069f7] focus:outline-none"
                />
              </div>
            </div>

            {/* JSON-LD Schema Markup */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-700">
                  <Code2 className="w-3.5 h-3.5 text-[#0069f7]" />
                  Schema.org NewsArticle JSON-LD
                </label>
                <span className="text-[10px] text-gray-400 font-mono">Structured Data</span>
              </div>
              <textarea
                value={schemaMarkup}
                onChange={(e) => setSchemaMarkup(e.target.value)}
                rows={6}
                placeholder="JSON-LD structured schema object"
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-xs font-mono bg-gray-50 text-gray-800 focus:bg-white focus:ring-2 focus:ring-[#0069f7] focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-white p-5 rounded-xl border border-gray-200/90 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-100 pb-2">
              Taxonomy & Categorization
            </h3>

            <div>
              <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                Primary Category
              </label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#0069f7] focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c._id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                Sub-Category (Dynamic)
              </label>
              <select
                value={subCategory}
                onChange={(e) => handleSubCategoryChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-[#0069f7] focus:outline-none"
              >
                <option value="">-- No Sub-Category --</option>
                {availableSubCats.map((sub, i) => (
                  <option key={sub.slug || i} value={sub.slug}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200/90 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-100 pb-2">
              Media Asset
            </h3>

            <div className="flex border border-gray-200 rounded-lg overflow-hidden text-xs">
              <button
                type="button"
                onClick={() => setImageInputMode('upload')}
                className={`flex-1 py-1.5 font-semibold transition ${imageInputMode === 'upload'
                    ? 'bg-[#01142e] text-white'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setImageInputMode('download')}
                className={`flex-1 py-1.5 font-semibold transition ${imageInputMode === 'download'
                    ? 'bg-[#01142e] text-white'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
              >
                Download From URL
              </button>
            </div>

            {imageInputMode === 'upload' ? (
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="w-full py-4 border-2 border-dashed border-gray-300 hover:border-[#0069f7] rounded-xl text-center text-xs text-gray-600 hover:text-[#0069f7] transition flex flex-col items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-5 h-5 text-gray-400" />
                  <span>{uploadingImage ? 'Uploading...' : 'Replace image in uploads/'}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="url"
                  value={remoteImageUrl}
                  onChange={(e) => setRemoteImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#0069f7] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleDownloadImage}
                  disabled={downloadingImage}
                  className="w-full py-2 bg-[#0069f7] hover:bg-[#0058d0] text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition cursor-pointer"
                >
                  {downloadingImage ? 'Downloading & Saving...' : 'Download to Uploads Folder'}
                </button>
              </div>
            )}

            {imageUrl && (
              <div className="mt-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-[10px] font-mono text-gray-500 truncate mb-1.5">
                  Saved: {imageUrl}
                </p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full h-36 object-cover rounded-md bg-white border border-gray-200"
                />
              </div>
            )}
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200/90 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-100 pb-2">
              Metadata & Attributes
            </h3>

            <div>
              <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                Author
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#0069f7] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                Read Time
              </label>
              <input
                type="text"
                value={readTime}
                onChange={(e) => setReadTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#0069f7] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                Publication Status
              </label>
              <select
                value={status}
                onChange={(e: any) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#0069f7] focus:outline-none"
              >
                <option value="published">Published</option>
                <option value="draft">Draft (Private)</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-700 flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isTrending}
                  onChange={(e) => setIsTrending(e.target.checked)}
                  className="rounded text-[#0069f7] focus:ring-[#0069f7]"
                />
                Mark as Trending
              </label>

              <label className="text-xs font-semibold text-gray-700 flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded text-[#0069f7] focus:ring-[#0069f7]"
                />
                Mark as Featured
              </label>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
