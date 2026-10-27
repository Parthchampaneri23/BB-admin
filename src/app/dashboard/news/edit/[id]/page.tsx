'use client';

import React, { useEffect, useState, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  Download,
  Video,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Heading2,
  Heading3,
  Undo2,
  Redo2,
  Image as ImageIcon,
  X,
  Loader2,
} from 'lucide-react';

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
  const videoInputRef = useRef<HTMLInputElement>(null);
  const richEditorRef = useRef<HTMLDivElement>(null);
  const inlineImageInputRef = useRef<HTMLInputElement>(null);
  const savedSelectionRef = useRef<Range | null>(null);

  // 1. Article Title & Metadata
  const [title, setTitle] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('');
  const [categoryLabel, setCategoryLabel] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [subCategoryLabel, setSubCategoryLabel] = useState('');
  const [isBreaking, setIsBreaking] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [author, setAuthor] = useState('BusinessBulletin Desk');
  const [readTime, setReadTime] = useState('3 min read');
  const [status, setStatus] = useState<'published' | 'draft' | 'archived'>('published');

  // 2. Image Asset Handler
  const [imageUrl, setImageUrl] = useState('');
  const [imageTitle, setImageTitle] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'download'>('upload');
  const [remoteImageUrl, setRemoteImageUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [downloadingImage, setDownloadingImage] = useState(false);

  // 3. Video Asset Handler
  const [videoUrl, setVideoUrl] = useState('');
  const [videoCaption, setVideoCaption] = useState('');
  const [uploadingVideo, setUploadingVideo] = useState(false);

  // 4. News Summary & Content
  const [summary, setSummary] = useState('');
  const [fullText, setFullText] = useState('');
  const [isRawCodeMode, setIsRawCodeMode] = useState(false);

  // In-content Body Image Modal
  const [showInlineImgModal, setShowInlineImgModal] = useState(false);
  const [inlineImgMode, setInlineImgMode] = useState<'upload' | 'url'>('upload');
  const [inlineImgUrl, setInlineImgUrl] = useState('');
  const [inlineImgCaption, setInlineImgCaption] = useState('');
  const [inlineImgAlt, setInlineImgAlt] = useState('');
  const [inlineImgUploading, setInlineImgUploading] = useState(false);

  // 5. Tags & Attribution
  const [tags, setTags] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');

  // 6. Social Media & Custom Share Links
  const [facebookShareUrl, setFacebookShareUrl] = useState('');
  const [twitterShareUrl, setTwitterShareUrl] = useState('');
  const [whatsappShareUrl, setWhatsappShareUrl] = useState('');
  const [telegramShareUrl, setTelegramShareUrl] = useState('');
  const [linkedinShareUrl, setLinkedinShareUrl] = useState('');
  const [instagramShareUrl, setInstagramShareUrl] = useState('');
  const [youtubeShareUrl, setYoutubeShareUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');

  // 7. SEO & Schema Markup
  const [metaTitle, setMetaTitle] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');
  const [schemaMarkup, setSchemaMarkup] = useState('');
  const [ogTitle, setOgTitle] = useState('');
  const [ogImage, setOgImage] = useState('');

  // Categories & SubCategories
  const [categories, setCategories] = useState<Category[]>([]);
  const [availableSubCats, setAvailableSubCats] = useState<SubCategory[]>([]);

  // State Feedback
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch Categories & Article
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
          setCustomSlug(a.customSlug || a.slug || '');
          setSlug(a.slug || '');
          setSummary(a.summary || '');
          setFullText(a.fullText || '');
          setCategory(a.category || '');
          setCategoryLabel(a.categoryLabel || '');
          setSubCategory(a.subCategory || '');
          setSubCategoryLabel(a.subCategoryLabel || '');
          setImageUrl(a.imageUrl || '');
          setImageTitle(a.imageTitle || a.title || '');
          setImageAlt(a.imageAlt || a.title || '');
          setImageCaption(a.imageCaption || '');
          setVideoUrl(a.videoUrl || '');
          setVideoCaption(a.videoCaption || '');
          setTags(a.tags || '');
          setSourceUrl(a.sourceUrl || a.url || '');
          setAuthor(a.author || 'BusinessBulletin Desk');
          setReadTime(a.readTime || '3 min read');
          setStatus(a.status || 'published');
          setIsBreaking(Boolean(a.isBreaking));
          setIsTrending(Boolean(a.isTrending));
          setIsFeatured(Boolean(a.isFeatured));

          // Social Links
          if (a.socialLinks) {
            setFacebookShareUrl(a.socialLinks.facebook || '');
            setTwitterShareUrl(a.socialLinks.twitter || '');
            setWhatsappShareUrl(a.socialLinks.whatsapp || '');
            setTelegramShareUrl(a.socialLinks.telegram || '');
            setLinkedinShareUrl(a.socialLinks.linkedin || '');
            setInstagramShareUrl(a.socialLinks.instagram || '');
            setYoutubeShareUrl(a.socialLinks.youtube || '');
            setWebsiteUrl(a.socialLinks.website || '');
          }

          // SEO Fields
          setMetaTitle(a.metaTitle || `${a.title} | BusinessBulletin`);
          setMetaDescription(a.metaDescription || (a.summary ? a.summary.slice(0, 160) : ''));
          setMetaKeywords(a.metaKeywords || '');
          setCanonicalUrl(a.canonicalUrl || `/news/${a.category}/${a.slug}`);
          setSchemaMarkup(a.schemaMarkup || '');
          setOgTitle(a.ogTitle || a.title || '');
          setOgImage(a.ogImage || a.imageUrl || '');

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

  // Keep visual editor in sync
  useEffect(() => {
    if (richEditorRef.current && !isRawCodeMode) {
      if (richEditorRef.current.innerHTML !== fullText) {
        richEditorRef.current.innerHTML = fullText;
      }
    }
  }, [fullText, isRawCodeMode]);

  const execEditorCmd = (cmd: string, val: string = '') => {
    document.execCommand(cmd, false, val);
    if (richEditorRef.current) {
      setFullText(richEditorRef.current.innerHTML);
    }
  };

  const saveCurrentSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedSelectionRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const openInlineImageModal = () => {
    saveCurrentSelection();
    setInlineImgUrl('');
    setInlineImgCaption('');
    setInlineImgAlt('');
    setShowInlineImgModal(true);
  };

  const handleInlineFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setInlineImgUploading(true);
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

      setInlineImgUrl(data.relativeUrl || data.url);
      setSuccess('Image uploaded to /public/uploads/!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setInlineImgUploading(false);
    }
  };

  const insertInlineImageToEditor = () => {
    if (!inlineImgUrl.trim()) {
      setError('Please provide or upload an image first.');
      return;
    }

    const safeUrl = inlineImgUrl.trim();
    const safeCaption = inlineImgCaption.trim();
    const safeAlt = (inlineImgAlt.trim() || safeCaption || title || 'Article image').replace(/"/g, '&quot;');

    const figureHtml = safeCaption
      ? `<figure class="my-6 block"><img src="${safeUrl}" alt="${safeAlt}" class="rounded-md max-w-full h-auto mx-auto block shadow-xs" /><figcaption class="text-xs text-gray-500 italic text-center mt-2">${safeCaption}</figcaption></figure><p><br/></p>`
      : `<figure class="my-6 block"><img src="${safeUrl}" alt="${safeAlt}" class="rounded-md max-w-full h-auto mx-auto block shadow-xs" /></figure><p><br/></p>`;

    if (isRawCodeMode) {
      setFullText((prev) => prev + '\n' + figureHtml);
    } else {
      if (richEditorRef.current) {
        richEditorRef.current.focus();

        const sel = window.getSelection();
        if (sel && savedSelectionRef.current) {
          sel.removeAllRanges();
          sel.addRange(savedSelectionRef.current);
        }

        document.execCommand('insertHTML', false, figureHtml);
        setFullText(richEditorRef.current.innerHTML);
      }
    }

    setShowInlineImgModal(false);
    setInlineImgUrl('');
    setInlineImgCaption('');
    setInlineImgAlt('');
    setSuccess('In-article image successfully inserted!');
  };

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

  // Image Upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
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

      setImageUrl(data.relativeUrl || data.url);
      setOgImage(data.relativeUrl || data.url);
      setSuccess('Image updated & saved in /public/uploads/!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  // Download image from URL handler
  const handleDownloadImage = async () => {
    if (!remoteImageUrl.trim()) {
      setError('Please provide an image URL to download.');
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

      setImageUrl(data.relativeUrl || data.url);
      setOgImage(data.relativeUrl || data.url);
      setSuccess('Image successfully downloaded & saved in /public/uploads/!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDownloadingImage(false);
    }
  };

  // Video Upload handler
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingVideo(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Video upload failed');

      setVideoUrl(data.relativeUrl || data.url);
      setSuccess('Video successfully uploaded to /public/uploads/!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploadingVideo(false);
    }
  };

  // Auto Generate SEO Meta Tags & Schema Markup
  const handleAutoGenerateSEO = () => {
    if (!title.trim()) {
      setError('Article title cannot be empty.');
      return;
    }
    const cleanSlug = customSlug || slug || title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:4036';
    const canonical = `/news/${category || 'business'}/${cleanSlug}`;
    const generatedMetaTitle = `${title.trim()} | BusinessBulletin`;
    const generatedMetaDesc = summary ? summary.slice(0, 160) : title.slice(0, 160);

    const keywordsList = [
      tags || '',
      categoryLabel || 'Business News',
      subCategoryLabel || '',
      'Stock Market India',
      'Finance',
      'Economy',
      title.split(' ').slice(0, 4).join(' '),
    ].filter(Boolean).join(', ');

    const sampleSchema = `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "headline": ${JSON.stringify(title.trim())},
  "description": ${JSON.stringify(generatedMetaDesc)},
  "image": [
    ${JSON.stringify(imageUrl || `${currentOrigin}/updatedlogo.svg`)}
  ],
  "datePublished": "${new Date().toISOString()}",
  "author": [{
    "@type": "Person",
    "name": ${JSON.stringify(author || 'BusinessBulletin Desk')}
  }],
  "publisher": {
    "@type": "Organization",
    "name": "BusinessBulletin",
    "logo": {
      "@type": "ImageObject",
      "url": "${currentOrigin}/updatedlogo.svg"
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "${currentOrigin}${canonical}"
  },
  "articleSection": ${JSON.stringify(categoryLabel || 'Business')}
}
</script>`;

    setMetaTitle(generatedMetaTitle);
    setMetaDescription(generatedMetaDesc);
    setCanonicalUrl(canonical);
    setMetaKeywords(keywordsList);
    setOgTitle(title.trim());
    setOgImage(imageUrl || '');
    setSchemaMarkup(sampleSchema);
    setSuccess('SEO Meta tags, OpenGraph previews & Schema script updated!');
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

    const currentEditorContent = isRawCodeMode
      ? fullText
      : richEditorRef.current?.innerHTML || fullText;

    if (!currentEditorContent.trim()) {
      setError('Article Content cannot be empty.');
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(`/api/news/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          customSlug,
          summary,
          fullText: currentEditorContent,
          category,
          categoryLabel,
          subCategory,
          subCategoryLabel,
          imageUrl,
          imageTitle,
          imageAlt,
          imageCaption,
          videoUrl,
          videoCaption,
          tags,
          sourceUrl,
          author,
          readTime,
          status,
          isBreaking,
          isTrending,
          isFeatured,
          socialLinks: {
            facebook: facebookShareUrl,
            twitter: twitterShareUrl,
            whatsapp: whatsappShareUrl,
            telegram: telegramShareUrl,
            linkedin: linkedinShareUrl,
            instagram: instagramShareUrl,
            youtube: youtubeShareUrl,
            website: websiteUrl,
          },
          metaTitle,
          canonicalUrl,
          metaDescription,
          metaKeywords,
          schemaMarkup,
          ogTitle,
          ogImage,
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
    return <div className="text-center py-16 text-gray-400 text-xs font-semibold">Loading article details...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl pb-16 font-sans">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/news"
            className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition border border-gray-200 bg-white shadow-xs"
            title="Back to News Module"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#01142e] tracking-tight">
              Edit News Article
            </h1>
            <p className="text-xs text-gray-500">
              Update editorial article attributes, taxonomy, media assets, social links and SEO schema.
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
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="font-bold hover:underline">
            ✕
          </button>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess('')} className="font-bold hover:underline">
            ✕
          </button>
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: ARTICLE TITLE & METADATA */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/90 shadow-xs space-y-5">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0069f7] flex items-center justify-center font-bold text-xs">
              1
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#01142e] tracking-tight">
                Article Title & Metadata
              </h2>
              <p className="text-[11px] text-gray-400">
                Core headline, categories, taxonomy, author and slug identification.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Article Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-[#0069f7] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs font-semibold text-gray-800 focus:ring-2 focus:ring-[#0069f7] focus:outline-none"
                >
                  <option value="">-- Select Category --</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Subcategory (Optional)
                </label>
                <select
                  value={subCategory}
                  onChange={(e) => handleSubCategoryChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs font-medium text-gray-800 focus:ring-2 focus:ring-[#0069f7] focus:outline-none"
                >
                  <option value="">-- Select Subcategory --</option>
                  {availableSubCats.map((sub, i) => (
                    <option key={sub.slug || i} value={sub.slug}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-3.5 bg-red-50/60 border border-red-200/80 rounded-xl flex items-start gap-3">
              <input
                type="checkbox"
                id="isBreakingNewsEdit"
                checked={isBreaking}
                onChange={(e) => setIsBreaking(e.target.checked)}
                className="mt-0.5 rounded text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer"
              />
              <label htmlFor="isBreakingNewsEdit" className="text-xs cursor-pointer select-none">
                <span className="font-bold text-red-800 uppercase tracking-wide flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                  Mark as Breaking News
                </span>
                <span className="block text-[11px] text-red-700 mt-0.5">
                  When enabled, this news article will automatically appear in the top website Breaking News ticker.
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <label className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl flex items-center gap-2.5 cursor-pointer hover:bg-amber-50 transition">
                <input
                  type="checkbox"
                  checked={isTrending}
                  onChange={(e) => setIsTrending(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-amber-900 block">Mark as Trending</span>
                  <span className="text-[10px] text-amber-700">Display in trending widgets & badges</span>
                </div>
              </label>

              <label className="p-3 bg-blue-50/50 border border-blue-200 rounded-xl flex items-center gap-2.5 cursor-pointer hover:bg-blue-50 transition">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded text-[#0069f7] focus:ring-[#0069f7] w-4 h-4 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-blue-900 block">Mark as Featured</span>
                  <span className="text-[10px] text-blue-700">Display in top hero banner & primary grid</span>
                </div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Author
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-[#0069f7] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Read Time
                </label>
                <input
                  type="text"
                  value={readTime}
                  onChange={(e) => setReadTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-[#0069f7] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Custom Slug (Optional)
                </label>
                <input
                  type="text"
                  value={customSlug}
                  onChange={(e) => setCustomSlug(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs font-mono text-gray-900 focus:ring-2 focus:ring-[#0069f7] focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: IMAGE ASSET HANDLER */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/90 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-[#01142e] tracking-tight">
                    Image Asset Handler
                  </h2>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                    LOCAL UPLOAD
                  </span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Images MUST be stored inside <code className="font-mono text-gray-600 bg-gray-100 px-1 py-0.5 rounded">/public/uploads/</code> folder before saving.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex border border-gray-200 rounded-xl overflow-hidden max-w-sm text-xs">
              <button
                type="button"
                onClick={() => setImageInputMode('upload')}
                className={`flex-1 py-2 font-semibold transition ${imageInputMode === 'upload'
                  ? 'bg-[#01142e] text-white shadow-xs'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
              >
                Upload File (.jpg, .png, .webp)
              </button>
              <button
                type="button"
                onClick={() => setImageInputMode('download')}
                className={`flex-1 py-2 font-semibold transition ${imageInputMode === 'download'
                  ? 'bg-[#01142e] text-white shadow-xs'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
              >
                Download From Live URL
              </button>
            </div>

            {imageInputMode === 'upload' ? (
              <div className="space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    required
                    placeholder="/uploads/my_news_image.jpg or http://..."
                    className="flex-1 px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs font-mono text-gray-900 focus:ring-2 focus:ring-[#0069f7] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="px-4 py-2.5 bg-[#0069f7] hover:bg-[#0058d0] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs shrink-0 disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingImage ? 'Uploading...' : 'Upload Local Image'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="url"
                    value={remoteImageUrl}
                    onChange={(e) => setRemoteImageUrl(e.target.value)}
                    placeholder="Paste external image URL (e.g. https://...)"
                    className="flex-1 px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs font-mono text-gray-900 focus:ring-2 focus:ring-[#0069f7] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleDownloadImage}
                    disabled={downloadingImage || !remoteImageUrl.trim()}
                    className="px-4 py-2.5 bg-[#0069f7] hover:bg-[#0058d0] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs shrink-0 disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{downloadingImage ? 'Downloading...' : 'Download & Store Locally'}</span>
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  SEO Image Title Attribute <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={imageTitle}
                  onChange={(e) => setImageTitle(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-[#0069f7] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  SEO Image Alt Text (Alternative Text) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-[#0069f7] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Image Caption (Optional)
                </label>
                <input
                  type="text"
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-[#0069f7] focus:outline-none"
                />
              </div>
            </div>

            {(previewUrl || imageUrl) && (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl || imageUrl}
                  alt={imageAlt || 'Preview'}
                  className="w-28 h-20 object-cover rounded-lg border border-gray-300 bg-white shadow-xs shrink-0"
                />
                <div className="space-y-1 text-xs">
                  <p className="font-semibold text-gray-900 truncate">
                    {imageTitle || 'Selected Media Asset'}
                  </p>
                  <p className="font-mono text-[11px] text-gray-500 break-all">
                    Path: {imageUrl}
                  </p>
                  {imageCaption && (
                    <p className="text-[11px] text-gray-500 italic">
                      Caption: {imageCaption}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 3: VIDEO ASSET HANDLER */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/90 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-[#01142e] tracking-tight">
                    Video Asset Handler & Embed Link
                  </h2>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase bg-indigo-100 text-indigo-800 border border-indigo-200">
                    VIDEO FILE / EMBED
                  </span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Upload local video files (.mp4, .webm) or enter video embed URLs (YouTube / Vimeo / mp4).
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <input
              type="file"
              ref={videoInputRef}
              onChange={handleVideoUpload}
              accept="video/*"
              className="hidden"
            />
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="/uploads/news_video.mp4 or https://www.youtube.com/watch?v=..."
                className="flex-1 px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs font-mono text-gray-900 focus:ring-2 focus:ring-[#0069f7] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                disabled={uploadingVideo}
                className="px-4 py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs shrink-0 disabled:opacity-50"
              >
                <Video className="w-3.5 h-3.5" />
                <span>{uploadingVideo ? 'Uploading Video...' : 'Upload Local Video'}</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Video Caption (Optional)
              </label>
              <input
                type="text"
                value={videoCaption}
                onChange={(e) => setVideoCaption(e.target.value)}
                placeholder="e.g. Special Video Bulletin"
                className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-[#0069f7] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: NEWS SUMMARY & PARAGRAPH CONTENT */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/90 shadow-xs space-y-5">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-xs">
              4
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#01142e] tracking-tight">
                News Summary & Paragraph Content
              </h2>
              <p className="text-[11px] text-gray-400">
                Short synopsis and rich editorial article formatting with headings, lists, blockquotes and links.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Short Description / Summary <span className="text-red-500">*</span>
              </label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                required
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-xs text-gray-900 leading-relaxed focus:ring-2 focus:ring-[#0069f7] focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                  Full Article Content (Rich Text Editor) <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsRawCodeMode(!isRawCodeMode)}
                  className="text-[11px] font-semibold text-[#0069f7] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>{isRawCodeMode ? 'Switch to Visual Editor' : 'Switch to Raw HTML Code'}</span>
                </button>
              </div>

              {!isRawCodeMode && (
                <div className="bg-gray-50 border border-gray-200 border-b-0 rounded-t-xl p-2 flex flex-wrap items-center gap-1 text-xs">
                  <button
                    type="button"
                    onClick={() => execEditorCmd('formatBlock', 'p')}
                    className="p-1.5 hover:bg-white rounded text-gray-700 font-bold"
                    title="Paragraph"
                  >
                    ¶
                  </button>
                  <button
                    type="button"
                    onClick={() => execEditorCmd('formatBlock', 'h2')}
                    className="p-1.5 hover:bg-white rounded text-gray-700 font-bold"
                    title="Heading 2"
                  >
                    <Heading2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => execEditorCmd('formatBlock', 'h3')}
                    className="p-1.5 hover:bg-white rounded text-gray-700 font-bold"
                    title="Heading 3"
                  >
                    <Heading3 className="w-4 h-4" />
                  </button>

                  <span className="w-px h-4 bg-gray-300 mx-1" />

                  <button
                    type="button"
                    onClick={() => execEditorCmd('bold')}
                    className="p-1.5 hover:bg-white rounded text-gray-700 font-bold"
                    title="Bold"
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => execEditorCmd('italic')}
                    className="p-1.5 hover:bg-white rounded text-gray-700"
                    title="Italic"
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => execEditorCmd('underline')}
                    className="p-1.5 hover:bg-white rounded text-gray-700"
                    title="Underline"
                  >
                    <Underline className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => execEditorCmd('strikeThrough')}
                    className="p-1.5 hover:bg-white rounded text-gray-700"
                    title="Strikethrough"
                  >
                    <Strikethrough className="w-4 h-4" />
                  </button>

                  <span className="w-px h-4 bg-gray-300 mx-1" />

                  <button
                    type="button"
                    onClick={() => execEditorCmd('insertUnorderedList')}
                    className="p-1.5 hover:bg-white rounded text-gray-700"
                    title="Bullet List"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => execEditorCmd('insertOrderedList')}
                    className="p-1.5 hover:bg-white rounded text-gray-700"
                    title="Numbered List"
                  >
                    <ListOrdered className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => execEditorCmd('formatBlock', 'blockquote')}
                    className="p-1.5 hover:bg-white rounded text-gray-700"
                    title="Blockquote"
                  >
                    <Quote className="w-4 h-4" />
                  </button>

                  <span className="w-px h-4 bg-gray-300 mx-1" />

                  <button
                    type="button"
                    onClick={() => {
                      const link = prompt('Enter destination URL:');
                      if (link) execEditorCmd('createLink', link);
                    }}
                    className="p-1.5 hover:bg-white rounded text-gray-700"
                    title="Insert Link"
                  >
                    <LinkIcon className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={openInlineImageModal}
                    className="p-1.5 hover:bg-white rounded text-[#0069f7] font-semibold flex items-center gap-1 bg-blue-50/70 border border-blue-200/60 shadow-xs"
                    title="Insert In-Article Image (Middle/Bottom)"
                  >
                    <ImageIcon className="w-4 h-4 text-[#0069f7]" />
                    <span className="text-[11px] font-bold">Image</span>
                  </button>

                  <span className="w-px h-4 bg-gray-300 mx-1" />

                  <button
                    type="button"
                    onClick={() => execEditorCmd('undo')}
                    className="p-1.5 hover:bg-white rounded text-gray-700"
                    title="Undo"
                  >
                    <Undo2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => execEditorCmd('redo')}
                    className="p-1.5 hover:bg-white rounded text-gray-700"
                    title="Redo"
                  >
                    <Redo2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              {isRawCodeMode ? (
                <div className="space-y-2">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={openInlineImageModal}
                      className="px-3 py-1 bg-blue-50 text-[#0069f7] border border-blue-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-blue-100 transition"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Insert Image into HTML</span>
                    </button>
                  </div>
                  <textarea
                    value={fullText}
                    onChange={(e) => setFullText(e.target.value)}
                    rows={14}
                    className="w-full p-4 border border-gray-300 rounded-xl font-mono text-xs text-gray-900 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#0069f7] focus:outline-none"
                  />
                </div>
              ) : (
                <div
                  ref={richEditorRef}
                  contentEditable
                  onMouseUp={saveCurrentSelection}
                  onKeyUp={saveCurrentSelection}
                  onInput={() => {
                    if (richEditorRef.current) {
                      setFullText(richEditorRef.current.innerHTML);
                    }
                  }}
                  className="min-h-[280px] p-4 border border-gray-300 rounded-b-xl text-sm leading-relaxed text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0069f7] bg-white space-y-3"
                  style={{ minHeight: '280px' }}
                />
              )}
            </div>
          </div>
        </div>

        {/* IN-ARTICLE IMAGE INSERTION MODAL */}
        {showInlineImgModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0069f7] flex items-center justify-center font-bold">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#01142e]">Insert Image into Article</h3>
                    <p className="text-[11px] text-gray-400">Place an image anywhere in the middle or bottom of the story</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowInlineImgModal(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Upload vs URL Tabs */}
              <div className="flex border border-gray-200 rounded-xl overflow-hidden text-xs">
                <button
                  type="button"
                  onClick={() => setInlineImgMode('upload')}
                  className={`flex-1 py-2 font-semibold transition ${
                    inlineImgMode === 'upload'
                      ? 'bg-[#01142e] text-white'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Upload File From Computer
                </button>
                <button
                  type="button"
                  onClick={() => setInlineImgMode('url')}
                  className={`flex-1 py-2 font-semibold transition ${
                    inlineImgMode === 'url'
                      ? 'bg-[#01142e] text-white'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Paste Image URL
                </button>
              </div>

              {inlineImgMode === 'upload' ? (
                <div className="space-y-3">
                  <input
                    type="file"
                    ref={inlineImageInputRef}
                    onChange={handleInlineFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <div
                    onClick={() => inlineImageInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 hover:border-[#0069f7] rounded-xl p-5 text-center cursor-pointer transition bg-gray-50/50 hover:bg-blue-50/20"
                  >
                    {inlineImgUploading ? (
                      <div className="flex flex-col items-center gap-2 text-xs text-gray-600">
                        <Loader2 className="w-6 h-6 animate-spin text-[#0069f7]" />
                        <span>Uploading image to server...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5">
                        <Upload className="w-6 h-6 text-[#0069f7]" />
                        <span className="text-xs font-semibold text-gray-700">Click to choose image file</span>
                        <span className="text-[10px] text-gray-400">JPG, PNG, WebP supported</span>
                      </div>
                    )}
                  </div>
                  {inlineImgUrl && (
                    <div className="flex items-center gap-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="truncate font-mono text-[11px]">{inlineImgUrl}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Image URL / Path</label>
                  <input
                    type="text"
                    value={inlineImgUrl}
                    onChange={(e) => setInlineImgUrl(e.target.value)}
                    placeholder="https://... or /uploads/..."
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs font-mono text-gray-900 focus:ring-2 focus:ring-[#0069f7] focus:outline-none"
                  />
                </div>
              )}

              {/* Preview if image URL exists */}
              {inlineImgUrl && (
                <div className="relative aspect-video max-h-40 w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={inlineImgUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}

              {/* Caption & Alt Inputs */}
              <div className="space-y-2.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Caption / Source Credit <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={inlineImgCaption}
                    onChange={(e) => setInlineImgCaption(e.target.value)}
                    placeholder="e.g. Photo: Business Standard / Financial Chart Q3"
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-[#0069f7] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Alt Text <span className="text-gray-400 font-normal">(for SEO / Accessibility)</span>
                  </label>
                  <input
                    type="text"
                    value={inlineImgAlt}
                    onChange={(e) => setInlineImgAlt(e.target.value)}
                    placeholder="Brief description of this image"
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-[#0069f7] focus:outline-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowInlineImgModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={insertInlineImageToEditor}
                  disabled={!inlineImgUrl.trim() || inlineImgUploading}
                  className="px-5 py-2 bg-[#0069f7] hover:bg-[#0053c7] text-white text-xs font-bold rounded-xl transition shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Insert into Story</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 5: TAGS & SOURCE ATTRIBUTION */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/90 shadow-xs space-y-5">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs">
              5
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#01142e] tracking-tight">
                Tags & Source Attribution
              </h2>
              <p className="text-[11px] text-gray-400">
                Categorical keywords, editorial metadata, and source verification links.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Tags (Comma Separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Global south, Multilateral system, Jaishankar"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-[#0069f7] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Source URL (Optional)
              </label>
              <input
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://www.aninews.in/news/..."
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-[#0069f7] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* SECTION 6: ARTICLE SOCIAL MEDIA & CUSTOM SHARE LINKS */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/90 shadow-xs space-y-5">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-xs">
              6
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#01142e] tracking-tight">
                Article Social Media & Custom Share Links
              </h2>
              <p className="text-[11px] text-gray-400">
                Define article-specific social media share links across all website. If left blank, dynamic website links will be used automatically.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Facebook Share URL
              </label>
              <input
                type="url"
                value={facebookShareUrl}
                onChange={(e) => setFacebookShareUrl(e.target.value)}
                placeholder="https://facebook.com/sharer/..."
                className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-[#0069f7] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Twitter / X Share URL
              </label>
              <input
                type="url"
                value={twitterShareUrl}
                onChange={(e) => setTwitterShareUrl(e.target.value)}
                placeholder="https://twitter.com/intent/..."
                className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-[#0069f7] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                WhatsApp Share URL
              </label>
              <input
                type="url"
                value={whatsappShareUrl}
                onChange={(e) => setWhatsappShareUrl(e.target.value)}
                placeholder="https://api.whatsapp.com/..."
                className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-[#0069f7] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Telegram Share URL
              </label>
              <input
                type="url"
                value={telegramShareUrl}
                onChange={(e) => setTelegramShareUrl(e.target.value)}
                placeholder="https://t.me/share/..."
                className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-[#0069f7] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                LinkedIn Share URL
              </label>
              <input
                type="url"
                value={linkedinShareUrl}
                onChange={(e) => setLinkedinShareUrl(e.target.value)}
                placeholder="https://linkedin.com/sharing/..."
                className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-[#0069f7] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Instagram Link URL
              </label>
              <input
                type="url"
                value={instagramShareUrl}
                onChange={(e) => setInstagramShareUrl(e.target.value)}
                placeholder="https://instagram.com/..."
                className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-[#0069f7] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                YouTube Link URL
              </label>
              <input
                type="url"
                value={youtubeShareUrl}
                onChange={(e) => setYoutubeShareUrl(e.target.value)}
                placeholder="https://youtube.com/..."
                className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-[#0069f7] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Website URL
              </label>
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://yourwebsite.com/..."
                className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-[#0069f7] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* SECTION 7: WEBSITE SEO META INFORMATION SCHEMA */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/90 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-xs">
                7
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#01142e] tracking-tight">
                  Website SEO Meta Information Schema
                </h2>
                <p className="text-[11px] text-gray-400">
                  Configures metadata, OpenGraph tags, and canonical links matching the website.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAutoGenerateSEO}
              className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#0069f7] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Auto-Generate Meta Tags</span>
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-[#0069f7] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Canonical URL
                </label>
                <input
                  type="text"
                  value={canonicalUrl}
                  onChange={(e) => setCanonicalUrl(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs font-mono text-gray-900 focus:ring-2 focus:ring-[#0069f7] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Meta Description
              </label>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                rows={2}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-[#0069f7] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Meta Keywords
              </label>
              <input
                type="text"
                value={metaKeywords}
                onChange={(e) => setMetaKeywords(e.target.value)}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-[#0069f7] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Schema Script / JSON-LD Markup
              </label>
              <textarea
                value={schemaMarkup}
                onChange={(e) => setSchemaMarkup(e.target.value)}
                rows={5}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs font-mono bg-gray-50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#0069f7] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  OpenGraph OG:Title
                </label>
                <input
                  type="text"
                  value={ogTitle}
                  onChange={(e) => setOgTitle(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-[#0069f7] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  OpenGraph OG:Image Path
                </label>
                <input
                  type="text"
                  value={ogImage}
                  onChange={(e) => setOgImage(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs font-mono text-gray-900 focus:ring-2 focus:ring-[#0069f7] focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 8: FORM ACTION BUTTONS */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <Link
            href="/dashboard/news"
            className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-100 transition shadow-xs"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-[#0069f7] hover:bg-[#0058d0] active:bg-[#004bb3] text-white rounded-xl text-xs font-bold tracking-wider uppercase transition shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Changes...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
