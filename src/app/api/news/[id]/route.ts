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
      isBreaking,
      pubDate,
      // SEO Fields
      metaTitle,
      metaDescription,
      metaKeywords,
      canonicalUrl,
      schemaMarkup,
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

    const updateFields: any = {};
    if (title) updateFields.title = title.trim();
    if (summary) updateFields.summary = summary.trim();
    if (fullText) updateFields.fullText = fullText.trim();
    if (category) {
      updateFields.category = category.trim();
      updateFields.categoryLabel = categoryLabel || category;
    }
    if (subCategory !== undefined) {
      updateFields.subCategory = subCategory ? subCategory.trim() : '';
      updateFields.subCategoryLabel = subCategoryLabel || '';
    }
    if (url !== undefined) updateFields.url = url;
    if (author) updateFields.author = author.trim();
    if (readTime) updateFields.readTime = readTime.trim();
    if (status) updateFields.status = status;
    if (isTrending !== undefined) updateFields.isTrending = Boolean(isTrending);
    if (isFeatured !== undefined) updateFields.isFeatured = Boolean(isFeatured);
    if (isBreaking !== undefined) updateFields.isBreaking = Boolean(isBreaking);
    if (pubDate) updateFields.pubDate = new Date(pubDate);

    // Update SEO fields
    if (metaTitle !== undefined) updateFields.metaTitle = metaTitle.trim();
    if (metaDescription !== undefined) updateFields.metaDescription = metaDescription.trim();
    if (metaKeywords !== undefined) updateFields.metaKeywords = metaKeywords.trim();
    if (canonicalUrl !== undefined) updateFields.canonicalUrl = canonicalUrl.trim();
    if (schemaMarkup !== undefined) updateFields.schemaMarkup = schemaMarkup;

    // If new image supplied and not already local upload
    if (imageUrl && imageUrl !== article.imageUrl) {
      updateFields.originalImageUrl = imageUrl;
      try {
        updateFields.imageUrl = await downloadImageToUploads(imageUrl);
      } catch {
        updateFields.imageUrl = imageUrl;
      }
    }

    const updatedArticle = await News.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    return NextResponse.json({ success: true, article: updatedArticle });
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
