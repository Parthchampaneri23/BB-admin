import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { News } from '@/models/News';
import { getAuthUser } from '@/lib/auth';
import { downloadImageToUploads } from '@/lib/imageDownloader';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const article = await News.findById(id);
    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, article });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = await params;
    const body = await request.json();

    const article = await News.findById(id);
    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    const {
      title,
      summary,
      fullText,
      category,
      categoryLabel,
      subCategory,
      subCategoryLabel,
      imageUrl,
      url,
      author,
      readTime,
      status,
      isTrending,
      isFeatured,
      pubDate,
    } = body;

    // Field Validations
    if (title && !title.trim()) {
      return NextResponse.json({ error: 'News Title cannot be empty' }, { status: 400 });
    }
    if (summary && !summary.trim()) {
      return NextResponse.json({ error: 'Summary cannot be empty' }, { status: 400 });
    }
    if (fullText && !fullText.trim()) {
      return NextResponse.json({ error: 'Full content cannot be empty' }, { status: 400 });
    }

    if (title) article.title = title.trim();
    if (summary) article.summary = summary.trim();
    if (fullText) article.fullText = fullText.trim();
    if (category) {
      article.category = category.trim();
      article.categoryLabel = categoryLabel || category;
    }
    if (subCategory !== undefined) {
      article.subCategory = subCategory ? subCategory.trim() : '';
      article.subCategoryLabel = subCategoryLabel || '';
    }
    if (url !== undefined) article.url = url;
    if (author) article.author = author.trim();
    if (readTime) article.readTime = readTime.trim();
    if (status) article.status = status;
    if (isTrending !== undefined) article.isTrending = Boolean(isTrending);
    if (isFeatured !== undefined) article.isFeatured = Boolean(isFeatured);
    if (pubDate) article.pubDate = new Date(pubDate);

    // If new image supplied and not already local upload
    if (imageUrl && imageUrl !== article.imageUrl) {
      article.originalImageUrl = imageUrl;
      try {
        article.imageUrl = await downloadImageToUploads(imageUrl);
      } catch {
        article.imageUrl = imageUrl;
      }
    }

    await article.save();

    return NextResponse.json({ success: true, article });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = await params;
    const article = await News.findByIdAndDelete(id);
    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Article deleted' });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
