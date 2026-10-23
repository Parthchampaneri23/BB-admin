import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INews extends Document {
  title: string;
  slug: string;
  summary: string;
  fullText: string;
  category: string; // Category slug or id
  categoryLabel: string;
  subCategory?: string; // Sub-category slug or id
  subCategoryLabel?: string;
  url?: string;
  imageUrl: string;
  originalImageUrl?: string;
  author: string;
  readTime: string;
  status: 'draft' | 'published' | 'archived';
  isTrending: boolean;
  isFeatured: boolean;
  isBreaking?: boolean;
  views: number;
  pubDate: Date;

  customSlug?: string;
  tags?: string; // Comma separated tags
  sourceUrl?: string; // Source URL

  // Image attributes
  imageTitle?: string;
  imageAlt?: string;
  imageCaption?: string;

  // Video attributes
  videoUrl?: string;
  videoCaption?: string;

  // Social & Share links
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    whatsapp?: string;
    telegram?: string;
    linkedin?: string;
    instagram?: string;
    youtube?: string;
    website?: string;
  };

  // SEO Fields
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  canonicalUrl?: string;
  schemaMarkup?: string; // JSON-LD Structured Data Schema
  ogTitle?: string;
  ogImage?: string;

  createdAt: Date;
  updatedAt: Date;
}

const NewsSchema = new Schema<INews>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    customSlug: { type: String, default: '', trim: true },
    summary: { type: String, required: true, trim: true },
    fullText: { type: String, required: true },
    category: { type: String, required: true, trim: true },
    categoryLabel: { type: String, required: true, trim: true },
    subCategory: { type: String, default: '', trim: true },
    subCategoryLabel: { type: String, default: '', trim: true },
    url: { type: String, default: '' },
    sourceUrl: { type: String, default: '' },
    tags: { type: String, default: '' },
    imageUrl: { type: String, required: true },
    originalImageUrl: { type: String, default: '' },
    imageTitle: { type: String, default: '', trim: true },
    imageAlt: { type: String, default: '', trim: true },
    imageCaption: { type: String, default: '', trim: true },
    videoUrl: { type: String, default: '', trim: true },
    videoCaption: { type: String, default: '', trim: true },
    author: { type: String, default: 'BusinessBulletin Desk' },
    readTime: { type: String, default: '3 min read' },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'published' },
    isTrending: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isBreaking: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    pubDate: { type: Date, default: Date.now },

    // Social & Share links
    socialLinks: {
      facebook: { type: String, default: '' },
      twitter: { type: String, default: '' },
      whatsapp: { type: String, default: '' },
      telegram: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      instagram: { type: String, default: '' },
      youtube: { type: String, default: '' },
      website: { type: String, default: '' },
    },

    // SEO Fields
    metaTitle: { type: String, default: '', trim: true },
    metaDescription: { type: String, default: '', trim: true },
    metaKeywords: { type: String, default: '', trim: true },
    canonicalUrl: { type: String, default: '', trim: true },
    schemaMarkup: { type: String, default: '' },
    ogTitle: { type: String, default: '', trim: true },
    ogImage: { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

if (process.env.NODE_ENV !== 'production') {
  delete mongoose.models.News;
}

export const News: Model<INews> =
  mongoose.models.News || mongoose.model<INews>('News', NewsSchema);
