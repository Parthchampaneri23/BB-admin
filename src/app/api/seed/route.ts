import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Category } from '@/models/Category';
import { News } from '@/models/News';
import { downloadImageToUploads } from '@/lib/imageDownloader';
import rawArticles from '@/data/articles.json';

const DEFAULT_CATEGORIES = [
  {
    name: 'Markets',
    slug: 'markets',
    description: 'Stock market, mutual funds, indices, commodities and currency movements',
    order: 1,
    subCategories: [
      { name: 'Stock Market', slug: 'stock-market', status: 'active' },
      { name: 'Mutual Funds', slug: 'mutual-funds', status: 'active' },
      { name: 'IPOs', slug: 'ipos', status: 'active' },
      { name: 'Commodities', slug: 'commodities', status: 'active' },
    ],
  },
  {
    name: 'Economy',
    slug: 'economy',
    description: 'Fiscal policies, inflation, trade, GDP, and macroeconomic developments',
    order: 2,
    subCategories: [
      { name: 'Policy & RBI', slug: 'policy-rbi', status: 'active' },
      { name: 'Indicators & GDP', slug: 'indicators-gdp', status: 'active' },
      { name: 'Trade & Forex', slug: 'trade-forex', status: 'active' },
    ],
  },
  {
    name: 'Personal Finance (PF)',
    slug: 'pf',
    description: 'Smart tax planning, insurance, retirement and wealth building',
    order: 3,
    subCategories: [
      { name: 'Tax Planning', slug: 'tax-planning', status: 'active' },
      { name: 'Insurance', slug: 'insurance', status: 'active' },
      { name: 'Retirement & Savings', slug: 'retirement-savings', status: 'active' },
    ],
  },
  {
    name: 'Smart Investor',
    slug: 'smart-investor',
    description: 'Expert analysis, stock ideas, portfolio strategies and brokerage views',
    order: 4,
    subCategories: [
      { name: 'Stock Picks', slug: 'stock-picks', status: 'active' },
      { name: 'Technical Analysis', slug: 'technical-analysis', status: 'active' },
    ],
  },
  {
    name: 'Companies',
    slug: 'companies',
    description: 'Corporate news, earnings, mergers, executive appointments and industry leaders',
    order: 5,
    subCategories: [
      { name: 'Earnings & Results', slug: 'earnings-results', status: 'active' },
      { name: 'Mergers & Acquisitions', slug: 'mergers-acquisitions', status: 'active' },
      { name: 'Aviation & Infra', slug: 'aviation-infra', status: 'active' },
      { name: 'Banking & Auto', slug: 'banking-auto', status: 'active' },
    ],
  },
  {
    name: 'Technology',
    slug: 'technology',
    description: 'AI, startups, cybersecurity, enterprise software and gadgets',
    order: 6,
    subCategories: [
      { name: 'Artificial Intelligence', slug: 'artificial-intelligence', status: 'active' },
      { name: 'Startups & Funding', slug: 'startups-funding', status: 'active' },
      { name: 'Cybersecurity', slug: 'cybersecurity', status: 'active' },
    ],
  },
  {
    name: 'Sports',
    slug: 'cricket',
    description: 'Cricket leagues, domestic tournaments, commercial deals and international events',
    order: 7,
    subCategories: [
      { name: 'Cricket & IPL', slug: 'cricket-ipl', status: 'active' },
      { name: 'Sponsorships & Deals', slug: 'sponsorships-deals', status: 'active' },
    ],
  },
  {
    name: 'Opinion',
    slug: 'opinion',
    description: 'Editorials, columns, expert views and guest perspectives',
    order: 8,
    subCategories: [
      { name: 'Editorial Column', slug: 'editorial-column', status: 'active' },
      { name: 'Guest Analysis', slug: 'guest-analysis', status: 'active' },
    ],
  },
];

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    // 1. Seed Categories if empty
    const catCount = await Category.countDocuments();
    let seededCategories = 0;
    if (catCount === 0) {
      await Category.insertMany(DEFAULT_CATEGORIES);
      seededCategories = DEFAULT_CATEGORIES.length;
    }

    // 2. Seed News from BB-website articles.json if empty or requested
    const newsCount = await News.countDocuments();
    let seededArticles = 0;

    const url = new URL(request.url);
    const force = url.searchParams.get('force') === 'true';

    if (newsCount === 0 || force) {
      if (force) {
        await News.deleteMany({});
      }
      const articlesToSeed = rawArticles as any[]; // Exactly 8 articles per section (80 total)
      for (const item of articlesToSeed) {
        let localImg = item.imageUrl;
        try {
          localImg = await downloadImageToUploads(item.imageUrl);
        } catch {
          localImg = item.imageUrl;
        }

        const generatedCanonical = `https://businessbulletin.com/article/${item.id}`;
        const schema = {
          '@context': 'https://schema.org',
          '@type': 'NewsArticle',
          'headline': item.title,
          'description': item.summary,
          'image': [localImg],
          'datePublished': item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
          'author': [{ '@type': 'Person', 'name': item.author || 'BusinessBulletin Desk' }],
          'publisher': {
            '@type': 'Organization',
            'name': 'BusinessBulletin',
            'logo': { '@type': 'ImageObject', 'url': 'https://businessbulletin.com/updatedlogo.svg' },
          },
          'mainEntityOfPage': { '@type': 'WebPage', '@id': generatedCanonical },
          'articleSection': item.categoryLabel || item.category,
        };

        await News.findOneAndUpdate(
          { slug: item.id },
          {
            title: item.title,
            slug: item.id,
            summary: item.summary,
            fullText: item.fullText || item.summary,
            category: item.category,
            categoryLabel: item.categoryLabel || item.category,
            subCategory: '',
            subCategoryLabel: '',
            url: item.url || '',
            imageUrl: localImg,
            originalImageUrl: item.imageUrl,
            author: item.author || 'BusinessBulletin Desk',
            readTime: item.readTime || '3 min read',
            status: 'published',
            isTrending: true,
            isFeatured: false,
            pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
            metaTitle: `${item.title} | BusinessBulletin`,
            metaDescription: item.summary ? item.summary.slice(0, 160) : '',
            metaKeywords: `${item.categoryLabel || item.category}, financial news, business bulletin, stocks`,
            canonicalUrl: generatedCanonical,
            schemaMarkup: JSON.stringify(schema, null, 2),
          },
          { upsert: true, new: true }
        );
        seededArticles++;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Seeding completed',
      seededCategories,
      seededArticles,
      totalCategories: await Category.countDocuments(),
      totalNews: await News.countDocuments(),
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
