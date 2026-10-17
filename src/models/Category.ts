import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISubCategory {
  _id?: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  order?: number;
  status: 'active' | 'inactive';
}

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  order: number;
  status: 'active' | 'inactive';
  subCategories: ISubCategory[];
  createdAt: Date;
  updatedAt: Date;
}

const SubCategorySchema = new Schema<ISubCategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true },
    description: { type: String, default: '' },
    order: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    description: { type: String, default: '' },
    order: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    subCategories: [SubCategorySchema],
  },
  { timestamps: true }
);

export const Category: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);
