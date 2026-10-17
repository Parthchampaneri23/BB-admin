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
  views: number;
  pubDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NewsSchema = new Schema<INews>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    summary: { type: String, required: true, trim: true },
    fullText: { type: String, required: true },
    category: { type: String, required: true, trim: true },
    categoryLabel: { type: String, required: true, trim: true },
    subCategory: { type: String, default: '', trim: true },
    subCategoryLabel: { type: String, default: '', trim: true },
    url: { type: String, default: '' },
    imageUrl: { type: String, required: true },
    originalImageUrl: { type: String, default: '' },
    author: { type: String, default: 'BusinessBulletin Desk' },
    readTime: { type: String, default: '3 min read' },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'published' },
    isTrending: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    pubDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const News: Model<INews> =
  mongoose.models.News || mongoose.model<INews>('News', NewsSchema);
