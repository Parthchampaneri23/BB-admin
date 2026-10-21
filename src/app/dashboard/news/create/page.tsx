'use client';

import React, { useEffect, useState, useRef } from 'react';
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
  Newspaper,
  RefreshCw,
  Download,
  ExternalLink,
  ChevronDown,
  Check,
  Loader2,
  Eye,
  Layers,
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

export default function CreateNewsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form fields matching detail page requirements
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [fullText, setFullText] = useState('');
  const [category, setCategory] = useState('');
  const [categoryLabel, setCategoryLabel] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [subCategoryLabel, setSubCategoryLabel] = useState('');
  const [url, setUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [author, setAuthor] = useState('BusinessBulletin Desk');
  const [readTime, setReadTime] = useState('3 min read');
  const [status, setStatus] = useState<'published' | 'draft' | 'archived'>('published');
  const [isTrending, setIsTrending] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBreaking, setIsBreaking] = useState(false);

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
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [downloadingImage, setDownloadingImage] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Business Standard Live Article Fetcher States
  const [bsFeedCategory, setBsFeedCategory] = useState('latest');
  const [bsArticles, setBsArticles] = useState<any[]>([]);
  const [loadingBsArticles, setLoadingBsArticles] = useState(false);
  const [fetchingBsUrl, setFetchingBsUrl] = useState<string | null>(null);
  const [bsModalOpen, setBsModalOpen] = useState(false);
  const [modalSearch, setModalSearch] = useState('');
  const [modalCategory, setModalCategory] = useState('latest');
  const [modalArticles, setModalArticles] = useState<any[]>([]);
  const [loadingModalArticles, setLoadingModalArticles] = useState(false);
  const [customFetchUrl, setCustomFetchUrl] = useState('');
  const [customFetching, setCustomFetching] = useState(false);

  // Fetch top 5 Business Standard articles on component mount or category switch
  const fetchBsTopArticles = async (categoryKey = 'latest') => {
    try {
      setLoadingBsArticles(true);
      const res = await fetch(`/api/business-standard/feed?category=${categoryKey}&limit=5`);
      const data = await res.json();
      if (data.success && Array.isArray(data.articles)) {
        setBsArticles(data.articles);
      }
    } catch (err) {
      console.error('Error fetching BS articles:', err);
    } finally {
      setLoadingBsArticles(false);
    }
  };

  // Fetch articles for "Show More" full dialog
  const fetchBsModalArticles = async (categoryKey = 'latest') => {
    try {
      setLoadingModalArticles(true);
      const res = await fetch(`/api/business-standard/feed?category=${categoryKey}&limit=100`);
      const data = await res.json();
      if (data.success && Array.isArray(data.articles)) {
        setModalArticles(data.articles);
      }
    } catch (err) {
      console.error('Error fetching modal articles:', err);
    } finally {
      setLoadingModalArticles(false);
    }
  };

  useEffect(() => {
    fetchBsTopArticles(bsFeedCategory);
  }, [bsFeedCategory]);

  // Import / Auto-fetch selected Business Standard article into the form
  const handleAutoFetchArticle = async (articleUrl: string, fallbackMeta?: any) => {
    if (!articleUrl) return;
    setFetchingBsUrl(articleUrl);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/business-standard/article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: articleUrl }),
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to auto-fetch article details');
      }

      const item = resData.data;

      // Fill in Form Fields
      const finalTitle = item.headline || fallbackMeta?.title || '';
      const finalSummary = item.description || fallbackMeta?.description || '';
      const finalFullText = item.fullText || item.description || fallbackMeta?.description || '';
      // Author is always strictly BusinessBulletin Desk for any fetching
      const finalAuthor = 'BusinessBulletin Desk';
      const finalUrl = articleUrl;
      const finalImg = item.imageUrl || fallbackMeta?.imageUrl || '';

      setTitle(finalTitle);
      setSummary(finalSummary);
      setFullText(finalFullText);
      setAuthor(finalAuthor);
      setUrl(finalUrl);

      // Match category from BS or categories list
      const suggestedSlug = fallbackMeta?.categorySlug || 'markets';
      const matchedCat = categories.find((c) => c.slug === suggestedSlug) || categories[0];
      if (matchedCat) {
        setCategory(matchedCat.slug);
        setCategoryLabel(matchedCat.name);
        setAvailableSubCats(matchedCat.subCategories || []);
        if (matchedCat.subCategories && matchedCat.subCategories.length > 0) {
          setSubCategory(matchedCat.subCategories[0].slug);
          setSubCategoryLabel(matchedCat.subCategories[0].name);
        } else {
          setSubCategory('');
          setSubCategoryLabel('');
        }
      }

      // Automatically download remote image into local /uploads folder for seamless asset management
      if (finalImg) {
        setRemoteImageUrl(finalImg);
        try {
          const imgRes = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageUrl: finalImg }),
          });
          const imgData = await imgRes.json();
          if (imgRes.ok && imgData.url) {
            setImageUrl(imgData.url);
          } else {
            setImageUrl(finalImg);
          }
        } catch {
          setImageUrl(finalImg);
        }
      }

      // Auto generate SEO & Schema
      const cleanSlug = finalTitle
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const genMetaTitle = `${finalTitle.trim()} | BusinessBulletin`;
      const genMetaDesc = finalSummary ? finalSummary.slice(0, 155) : finalTitle.slice(0, 155);
      const genCanonical = `https://businessbulletin.com/article/${cleanSlug}`;
      const keywordsList = [
        item.keywords || '',
        matchedCat?.name || 'Business News',
        'Market News',
        'Financial News India',
        'BusinessBulletin',
      ]
        .filter(Boolean)
        .join(', ');

      const genSchema = {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: finalTitle.trim(),
        description: finalSummary.trim(),
        image: [finalImg || 'https://businessbulletin.com/updatedlogo.svg'],
        datePublished: item.pubDate || new Date().toISOString(),
        author: [{ '@type': 'Person', name: finalAuthor }],
        publisher: {
          '@type': 'Organization',
          name: 'BusinessBulletin',
          logo: { '@type': 'ImageObject', url: 'https://businessbulletin.com/updatedlogo.svg' },
        },
        mainEntityOfPage: { '@type': 'WebPage', '@id': genCanonical },
        articleSection: matchedCat?.name || 'Markets',
      };

      setMetaTitle(genMetaTitle);
      setMetaDescription(genMetaDesc);
      setMetaKeywords(keywordsList);
      setCanonicalUrl(genCanonical);
      setSchemaMarkup(JSON.stringify(genSchema, null, 2));

      setSuccess(`Successfully imported article: "${finalTitle.slice(0, 50)}..."! Fields & Image auto-populated.`);
      if (bsModalOpen) setBsModalOpen(false);

      // Scroll smoothly to form
      window.scrollTo({ top: 380, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.message || 'Failed to auto-fetch article.');
    } finally {
      setFetchingBsUrl(null);
    }
  };

  // Direct fetch by pasting any Business Standard URL
  const handleCustomUrlFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFetchUrl.trim()) {
      setError('Please enter a Business Standard article URL.');
      return;
    }
    setCustomFetching(true);
    await handleAutoFetchArticle(customFetchUrl.trim());
    setCustomFetching(false);
  };

  // Auto generate SEO and Schema when Title / Summary changes
  const handleAutoGenerateSEO = () => {
    if (!title.trim()) {
      setError('Please provide an article title first.');
      return;
    }
    const cleanSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

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
    setSuccess('SEO Meta tags and JSON-LD Schema markup auto-generated!');
  };

  // Load Categories
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.categories.length > 0) {
          setCategories(data.categories);
          const firstCat = data.categories[0];
          setCategory(firstCat.slug);
          setCategoryLabel(firstCat.name);
          setAvailableSubCats(firstCat.subCategories || []);
        }
      })
      .catch(console.error);
  }, []);

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

    // 1. Immediately create Object URL for real-time local preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    setUploadingImage(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      // 2. Upload via API to get saved server URL
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setImageUrl(data.url);
      setSuccess('Image uploaded and stored in uploads folder!');
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
      setSuccess('Image successfully downloaded and saved in /uploads!');
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
      setError('Article Title is required.');
      return;
    }
    if (!summary.trim()) {
      setError('Article Summary / Lead paragraph is required.');
      return;
    }
    if (!fullText.trim()) {
      setError('Long  Descriptioncontent is required.');
      return;
    }
    if (!category.trim()) {
      setError('Please select a primary category.');
      return;
    }
    if (!imageUrl.trim()) {
      setError('Please provide an article image (Upload or Download into uploads folder).');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/news', {
        method: 'POST',
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
          isBreaking,
          // SEO
          metaTitle,
          metaDescription,
          metaKeywords,
          canonicalUrl,
          schemaMarkup,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create article');

      setSuccess('Article created successfully!');
      setTimeout(() => {
        router.push('/dashboard/news');
      }, 1000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
              Create SEO-Optimized Article
            </h1>
            <p className="text-xs text-gray-500">
              Manage complete editorial details, dynamic taxonomy, SEO metadata and schema markup.
            </p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="inline-flex items-center gap-2 bg-[#0069f7] hover:bg-[#0058d0] text-white px-5 py-2.5 rounded-xl font-semibold text-xs tracking-wider uppercase transition shadow-md cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Publishing...' : 'Publish Article'}
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

      {/* Live Editorial Wire & Smart Content Pipeline */}
      <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0069f7]/10 border border-[#0069f7]/20 flex items-center justify-center text-[#0069f7]">
              <Newspaper className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold tracking-tight text-[#01142e]">
                  Live Editorial Wire & Feed Pipeline
                </h2>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5" />
                  Live Sync
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fetchBsTopArticles(bsFeedCategory)}
              disabled={loadingBsArticles}
              className="px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
              title="Refresh Top 5"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-gray-500 ${loadingBsArticles ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setBsModalOpen(true);
                fetchBsModalArticles(modalCategory);
              }}
              className="px-3.5 py-1.5 bg-[#0069f7] hover:bg-[#0058d0] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Show More Articles</span>
            </button>
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider shrink-0 mr-1">Feeds:</span>
          {[
            { id: 'latest', name: 'Latest News' },
            { id: 'home', name: 'Top Stories' },
            { id: 'markets', name: 'Markets' },
            { id: 'economy', name: 'Economy' },
            { id: 'companies', name: 'Companies' },
            { id: 'technology', name: 'Technology' },
            { id: 'pf', name: 'Personal Finance' },
            { id: 'cricket', name: 'Sports' },
            { id: 'opinion', name: 'Opinion' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setBsFeedCategory(cat.id)}
              className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition cursor-pointer text-xs ${bsFeedCategory === cat.id
                  ? 'bg-[#0069f7] text-white shadow-xs'
                  : 'bg-gray-50 border border-gray-200/80 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Top 5 Articles Cards */}
        {loadingBsArticles ? (
          <div className="py-8 flex flex-col items-center justify-center gap-2 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin text-[#0069f7]" />
            <span className="text-xs font-medium">Fetching real-time news dispatches...</span>
          </div>
        ) : bsArticles.length === 0 ? (
          <div className="py-6 text-center text-xs text-gray-500">
            No live articles returned for this category. Click refresh or try another category.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-1">
            {bsArticles.slice(0, 5).map((item, idx) => {
              const isCurrentFetching = fetchingBsUrl === item.link;
              return (
                <div
                  key={item.link || idx}
                  className="group relative bg-[#f8fafc] hover:bg-white border border-gray-200/90 hover:border-[#0069f7]/50 rounded-xl p-3 flex flex-col justify-between transition-all duration-200 shadow-xs hover:shadow-md"
                >
                  <div className="space-y-2">
                    <div className="relative w-full h-24 rounded-lg overflow-hidden bg-gray-100 border border-gray-200/70">
                      {item.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Newspaper className="w-6 h-6 opacity-40" />
                        </div>
                      )}
                      <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-[#01142e]/85 backdrop-blur-xs text-[10px] font-mono font-semibold text-white">
                        #{idx + 1}
                      </span>
                    </div>

                    <h4
                      className="text-xs font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-[#0069f7] transition"
                      title={item.title}
                    >
                      {item.title}
                    </h4>

                    {item.description && (
                      <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 mt-2 border-t border-gray-200/70 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-[10px] text-gray-500 font-semibold">
                      <span className="truncate max-w-[90px] uppercase text-[#0069f7]">{item.category || 'News'}</span>
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-gray-900 p-0.5 rounded"
                        title="View Source Link"
                      >
                        <ExternalLink className="w-3 h-3 text-gray-400 hover:text-gray-700" />
                      </a>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAutoFetchArticle(item.link, item)}
                      disabled={isCurrentFetching}
                      className="w-full py-1.5 px-2 bg-[#0069f7] hover:bg-[#0058d0] active:bg-[#004bb3] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50 shadow-xs"
                    >
                      {isCurrentFetching ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Fetching...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3 h-3" />
                          <span>Auto Fetch</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Form Grid */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Headline, Summary, Full Content, SEO Module */}
        <div className="lg:col-span-2 space-y-6">
          {/* Headline */}
          <div className="bg-white p-5 rounded-xl border border-gray-200/90 shadow-xs space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
              News Headline / Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. Nifty IT soars 14% on Q2 earnings boost; TechM, Wipro shine"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-[#0069f7] focus:outline-none"
            />
          </div>

          {/* Summary / Lead */}
          <div className="bg-white p-5 rounded-xl border border-gray-200/90 shadow-xs space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
              Short Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              required
              rows={3}
              placeholder="A concise, high-impact synopsis displayed in news feeds and cards..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-[#0069f7] focus:outline-none"
            />
          </div>

          {/* Full Text / Article Body */}
          <div className="bg-white p-5 rounded-xl border border-gray-200/90 shadow-xs space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
              Long  Description<span className="text-red-500">*</span>
            </label>
            <textarea
              value={fullText}
              onChange={(e) => setFullText(e.target.value)}
              required
              rows={12}
              placeholder="Full article content, statements, quotes, statistical tables and context..."
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

        {/* Right Column (1 col): Taxonomy, Media, Metadata */}
        <div className="space-y-5">
          {/* Category & SubCategory (Dynamic) */}
          <div className="bg-white p-5 rounded-xl border border-gray-200/90 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-100 pb-2">
              Taxonomy & Categorization
            </h3>

            <div>
              <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                Primary Category <span className="text-red-500">*</span>
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

          {/* Media & Local Image Pipeline */}
          <div className="bg-white p-5 rounded-xl border border-gray-200/90 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-100 pb-2">
              Media Asset <span className="text-red-500">*</span>
            </h3>

            {/* Mode Tabs */}
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
                  <span>{uploadingImage ? 'Uploading...' : 'Choose image to store in uploads/'}</span>
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
                  className="w-full py-2 bg-[#0069f7] hover:bg-[#0058d0] text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition cursor-pointer disabled:opacity-50"
                >
                  {downloadingImage ? 'Downloading & Saving...' : 'Download to Uploads Folder'}
                </button>
              </div>
            )}

            {/* Current Selected Image Preview */}
            {(previewUrl || imageUrl) && (
              <div className="mt-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-[10px] font-mono text-gray-500 truncate mb-1.5">
                  {previewUrl ? 'Previewing New File' : `Saved: ${imageUrl}`}
                </p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl || imageUrl}
                  alt="Preview"
                  className="w-full h-36 object-cover rounded-md bg-white border border-gray-200"
                />
              </div>
            )}
          </div>

          {/* Publishing & Meta Controls */}
          <div className="bg-white p-5 rounded-xl border border-gray-200/90 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-100 pb-2">
              Metadata & Attributes
            </h3>

            <div>
              <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                Author Byline
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
                placeholder="e.g. 3 min read"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#0069f7] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                Original Source Reference (URL)
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
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

            <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-700 flex items-center gap-2 cursor-pointer hover:text-[#0069f7] transition">
                <input
                  type="checkbox"
                  checked={isBreaking}
                  onChange={(e) => setIsBreaking(e.target.checked)}
                  className="rounded text-[#0069f7] focus:ring-[#0069f7] w-4 h-4"
                />
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  Mark as Breaking News (Top Bar Ticker)
                </span>
              </label>

              <div className="flex items-center justify-between pt-1">
                <label className="text-xs font-semibold text-gray-700 flex items-center gap-2 cursor-pointer hover:text-[#0069f7] transition">
                  <input
                    type="checkbox"
                    checked={isTrending}
                    onChange={(e) => setIsTrending(e.target.checked)}
                    className="rounded text-[#0069f7] focus:ring-[#0069f7] w-4 h-4"
                  />
                  Mark as Trending
                </label>

                <label className="text-xs font-semibold text-gray-700 flex items-center gap-2 cursor-pointer hover:text-[#0069f7] transition">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded text-[#0069f7] focus:ring-[#0069f7] w-4 h-4"
                  />
                  Mark as Featured
                </label>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Show More Live Editorial Articles Modal */}
      {bsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[88vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#01142e] text-white flex items-center justify-between border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
                  <Newspaper className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Explore Real-Time Editorial Wire
                  </h3>
                  <p className="text-xs text-slate-300">
                    Browse up to 100 live industry articles and import any story directly with 1 click.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBsModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                {[
                  { id: 'latest', name: 'Latest' },
                  { id: 'home', name: 'Top Stories' },
                  { id: 'markets', name: 'Markets' },
                  { id: 'economy', name: 'Economy' },
                  { id: 'companies', name: 'Companies' },
                  { id: 'technology', name: 'Tech' },
                  { id: 'pf', name: 'Personal Finance' },
                  { id: 'cricket', name: 'Sports' },
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setModalCategory(c.id);
                      fetchBsModalArticles(c.id);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${modalCategory === c.id
                      ? 'bg-[#0069f7] text-white shadow-xs'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  placeholder="Filter articles by title..."
                  className="w-full pl-3 pr-8 py-1.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0069f7]"
                />
                {modalSearch && (
                  <button
                    type="button"
                    onClick={() => setModalSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Modal Body - Article List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loadingModalArticles ? (
                <div className="py-16 flex flex-col items-center justify-center gap-3 text-gray-500">
                  <Loader2 className="w-8 h-8 animate-spin text-[#0069f7]" />
                  <span className="text-xs font-medium">Fetching real-time feed articles...</span>
                </div>
              ) : (
                (() => {
                  const filtered = modalArticles.filter(
                    (a) =>
                      !modalSearch ||
                      a.title?.toLowerCase().includes(modalSearch.toLowerCase()) ||
                      a.description?.toLowerCase().includes(modalSearch.toLowerCase())
                  );

                  if (filtered.length === 0) {
                    return (
                      <div className="py-12 text-center text-xs text-gray-500">
                        No articles found matching &quot;{modalSearch}&quot;.
                      </div>
                    );
                  }

                  return filtered.map((item, i) => {
                    const isCurrent = fetchingBsUrl === item.link;
                    return (
                      <div
                        key={item.link || i}
                        className="p-3.5 bg-white border border-gray-200 hover:border-orange-400 rounded-xl flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between transition hover:shadow-xs group"
                      >
                        <div className="flex gap-3 items-center flex-1">
                          {item.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-20 h-16 object-cover rounded-lg shrink-0 border border-gray-200"
                            />
                          ) : (
                            <div className="w-20 h-16 bg-gray-100 rounded-lg shrink-0 border border-gray-200 flex items-center justify-center text-gray-400">
                              <Newspaper className="w-6 h-6" />
                            </div>
                          )}

                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#0069f7] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                                {item.category || 'News'}
                              </span>
                              {item.pubDate && (
                                <span className="text-[10px] text-gray-400">
                                  {new Date(item.pubDate).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })}
                                </span>
                              )}
                            </div>
                            <h4 className="text-xs font-bold text-gray-900 group-hover:text-[#0069f7] transition leading-snug line-clamp-2">
                              {item.title}
                            </h4>
                            {item.description && (
                              <p className="text-[11px] text-gray-500 line-clamp-1">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition"
                            title="Open original article in new tab"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>

                          <button
                            type="button"
                            onClick={() => handleAutoFetchArticle(item.link, item)}
                            disabled={isCurrent}
                            className="px-3.5 py-2 bg-[#0069f7] hover:bg-[#0058d0] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50 shadow-xs"
                          >
                            {isCurrent ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Importing...</span>
                              </>
                            ) : (
                              <>
                                <Download className="w-3.5 h-3.5" />
                                <span>Import to Form</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  });
                })()
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
              <span>Showing up to {modalArticles.length} live editorial stories</span>
              <button
                type="button"
                onClick={() => setBsModalOpen(false)}
                className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
