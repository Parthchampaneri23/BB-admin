import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { News } from '@/models/News';
import { getAuthUser } from '@/lib/auth';
import { downloadImageToUploads } from '@/lib/imageDownloader';

// GET news list with search and filters
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);

    const category = searchParams.get('category');
    const subCategory = searchParams.get('subCategory');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limitParam = searchParams.get('limit');
    const limit = limitParam === '0' || limitParam === 'all' ? 0 : parseInt(limitParam || '20', 10);

    const query: any = {};

    if (category && category !== 'all') {
      query.category = category;
    }
    if (subCategory && subCategory !== 'all') {
      query.subCategory = subCategory;
    }
    if (status && status !== 'all') {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await News.countDocuments(query);
    const queryBuilder = News.find(query).sort({ pubDate: -1, createdAt: -1 });

    if (limit > 0) {
      queryBuilder.skip((page - 1) * limit).limit(limit);
    }

    const news = await queryBuilder;

    return NextResponse.json({
      success: true,
      news,
      pagination: {
        total,
        page: limit > 0 ? page : 1,
        limit: limit > 0 ? limit : total,
        pages: limit > 0 ? Math.ceil(total / limit) : 1,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

// POST create news item
export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();

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
    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'News Title is required' }, { status: 400 });
    }
    if (!summary || !summary.trim()) {
      return NextResponse.json({ error: 'Summary is required' }, { status: 400 });
    }
    if (!fullText || !fullText.trim()) {
      return NextResponse.json({ error: 'Full Article content is required' }, { status: 400 });
    }
    if (!category || !category.trim()) {
      return NextResponse.json({ error: 'Category selection is required' }, { status: 400 });
    }
    if (!imageUrl || !imageUrl.trim()) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    // Auto generate clean slug
    const baseSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const uniqueSuffix = Math.floor(100000 + Math.random() * 900000);
    const slug = `${baseSlug}-${uniqueSuffix}`;

    // Ensure image is downloaded to /uploads if it's an external or website image
    let downloadedImageUrl = imageUrl;
    let originalImageUrl = imageUrl;
    try {
      downloadedImageUrl = await downloadImageToUploads(imageUrl);
    } catch (err) {
      console.warn('Image download warning:', err);
    }

    // Auto generate fallback SEO fields if empty
    const finalMetaTitle = metaTitle && metaTitle.trim() ? metaTitle.trim() : `${title.trim()} | BusinessBulletin`;
    const finalMetaDescription = metaDescription && metaDescription.trim() ? metaDescription.trim() : summary.trim().slice(0, 160);
    const finalCanonicalUrl = canonicalUrl && canonicalUrl.trim() ? canonicalUrl.trim() : `https://businessbulletin.com/article/${slug}`;

    let finalSchemaMarkup = schemaMarkup;
    if (!finalSchemaMarkup || !finalSchemaMarkup.trim()) {
      finalSchemaMarkup = JSON.stringify(
        {
          '@context': 'https://schema.org',
          '@type': 'NewsArticle',
          'headline': title.trim(),
          'description': summary.trim(),
          'image': [downloadedImageUrl],
          'datePublished': pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
          'author': [{ '@type': 'Person', 'name': author || 'BusinessBulletin Desk' }],
          'publisher': {
            '@type': 'Organization',
            'name': 'BusinessBulletin',
            'logo': { '@type': 'ImageObject', 'url': 'https://businessbulletin.com/updatedlogo.svg' },
          },
          'mainEntityOfPage': { '@type': 'WebPage', '@id': finalCanonicalUrl },
          'articleSection': categoryLabel || category,
        },
        null,
        2
      );
    }

    const newArticle = await News.create({
      title: title.trim(),
      slug,
      summary: summary.trim(),
      fullText: fullText.trim(),
      category: category.trim(),
      categoryLabel: categoryLabel || category,
      subCategory: subCategory ? subCategory.trim() : '',
      subCategoryLabel: subCategoryLabel || '',
      url: url || '',
      imageUrl: downloadedImageUrl,
      originalImageUrl,
      author: author && author.trim() ? author.trim() : 'BusinessBulletin Desk',
      readTime: readTime && readTime.trim() ? readTime.trim() : '3 min read',
      status: status || 'published',
      isTrending: Boolean(isTrending),
      isFeatured: Boolean(isFeatured),
      isBreaking: Boolean(isBreaking),
      pubDate: pubDate ? new Date(pubDate) : new Date(),
      // SEO Fields
      metaTitle: finalMetaTitle,
      metaDescription: finalMetaDescription,
      metaKeywords: metaKeywords ? metaKeywords.trim() : '',
      canonicalUrl: finalCanonicalUrl,
      schemaMarkup: finalSchemaMarkup,
    });

    return NextResponse.json({ success: true, article: newArticle }, { status: 201 });
  } catch (error) {
    console.error('Error creating news:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
