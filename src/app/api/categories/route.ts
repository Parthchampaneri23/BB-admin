import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Category } from '@/models/Category';
import { getAuthUser } from '@/lib/auth';

// GET all categories
export async function GET() {
  try {
    await connectToDatabase();
    const categories = await Category.find().sort({ order: 1, createdAt: -1 });
    return NextResponse.json({ success: true, categories });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

// POST create category
export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();
    const { name, slug, description, order, status, subCategories } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const finalSlug = (slug || name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const existing = await Category.findOne({ slug: finalSlug });
    if (existing) {
      return NextResponse.json({ error: `Category with slug "${finalSlug}" already exists` }, { status: 400 });
    }

    const newCategory = await Category.create({
      name: name.trim(),
      slug: finalSlug,
      description: description || '',
      order: Number(order) || 0,
      status: status || 'active',
      subCategories: Array.isArray(subCategories) ? subCategories : [],
    });

    return NextResponse.json({ success: true, category: newCategory }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
