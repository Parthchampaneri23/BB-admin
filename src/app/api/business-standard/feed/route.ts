import { NextRequest, NextResponse } from 'next/server';

interface RSSItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  creator: string;
  imageUrl: string;
  category: string;
  categorySlug: string;
  keywords: string;
}

function cleanHtml(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

function cleanCdata(raw: string): string {
  if (!raw) return '';
  return raw.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5', 10);
    const category = searchParams.get('category') || 'latest';

    // Map common category keys to Business Standard RSS URLs
    const RSS_URLS: Record<string, string> = {
      latest: 'https://www.business-standard.com/rss/latest.rss',
      home: 'https://www.business-standard.com/rss/home_page_top_stories.rss',
      markets: 'https://www.business-standard.com/rss/markets-106.rss',
      economy: 'https://www.business-standard.com/rss/economy-policy-102.rss',
      companies: 'https://www.business-standard.com/rss/companies-101.rss',
      technology: 'https://www.business-standard.com/rss/technology-108.rss',
      pf: 'https://www.business-standard.com/rss/finance-103.rss',
      cricket: 'https://www.business-standard.com/rss/sports-105.rss',
      opinion: 'https://www.business-standard.com/rss/opinion-104.rss',
    };

    const targetUrl = RSS_URLS[category] || RSS_URLS.latest;

    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      },
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: `Failed to fetch RSS from Business Standard: ${response.statusText}` },
        { status: 502 }
      );
    }

    const xmlText = await response.text();

    // Parse RSS items using Regex for robust handling across CDATA and various namespace variations
    const items: RSSItem[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    let match;

    while ((match = itemRegex.exec(xmlText)) !== null) {
      const itemBlock = match[1];

      // Title
      const titleMatch = itemBlock.match(/<title>([\s\S]*?)<\/title>/i);
      const rawTitle = titleMatch ? cleanCdata(titleMatch[1]) : '';
      const title = cleanHtml(rawTitle);

      // Link
      const linkMatch = itemBlock.match(/<link>([\s\S]*?)<\/link>/i);
      const link = linkMatch ? cleanCdata(linkMatch[1]).trim() : '';

      // Description / Summary
      const descMatch = itemBlock.match(/<description>([\s\S]*?)<\/description>/i);
      const rawDesc = descMatch ? cleanCdata(descMatch[1]) : '';
      const description = cleanHtml(rawDesc);

      // pubDate
      const pubDateMatch = itemBlock.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
      const pubDate = pubDateMatch ? cleanCdata(pubDateMatch[1]).trim() : '';

      // Creator / Author (Always BusinessBulletin Desk)
      const creator = 'BusinessBulletin Desk';

      // Keywords
      const keywordsMatch = itemBlock.match(/<bs:keywords>([\s\S]*?)<\/bs:keywords>/i);
      const keywords = keywordsMatch ? cleanCdata(keywordsMatch[1]).trim() : '';

      // Category
      const catMatch = itemBlock.match(/<category>([\s\S]*?)<\/category>/i);
      const rawCat = catMatch ? cleanCdata(catMatch[1]).trim() : 'General';

      // Image URL (check media:content url, enclosure, or inside description)
      let imageUrl = '';
      const mediaMatch = itemBlock.match(/<media:content[^>]+url=["']([^"']+)["']/i);
      if (mediaMatch) {
        imageUrl = mediaMatch[1];
      } else {
        const enclosureMatch = itemBlock.match(/<enclosure[^>]+url=["']([^"']+)["']/i);
        if (enclosureMatch) {
          imageUrl = enclosureMatch[1];
        } else {
          const imgInsideDesc = rawDesc.match(/<img[^>]+src=["']([^"']+)["']/i);
          if (imgInsideDesc) {
            imageUrl = imgInsideDesc[1];
          }
        }
      }

      // Map to internal category slug
      const catLower = rawCat.toLowerCase();
      let categorySlug = 'markets';
      if (catLower.includes('world') || catLower.includes('latest')) categorySlug = 'markets';
      else if (catLower.includes('market') || catLower.includes('stock')) categorySlug = 'markets';
      else if (catLower.includes('economy') || catLower.includes('policy')) categorySlug = 'economy';
      else if (catLower.includes('company') || catLower.includes('companies')) categorySlug = 'companies';
      else if (catLower.includes('tech')) categorySlug = 'technology';
      else if (catLower.includes('finance') || catLower.includes('personal finance') || catLower.includes('pf')) categorySlug = 'pf';
      else if (catLower.includes('sport') || catLower.includes('cricket')) categorySlug = 'cricket';
      else if (catLower.includes('opinion')) categorySlug = 'opinion';

      if (title && link) {
        items.push({
          title,
          link,
          description,
          pubDate,
          creator,
          imageUrl,
          category: rawCat,
          categorySlug,
          keywords,
        });
      }
    }

    const totalCount = items.length;
    const paginatedItems = limit > 0 ? items.slice(0, limit) : items;

    return NextResponse.json({
      success: true,
      totalCount,
      count: paginatedItems.length,
      feedCategory: category,
      articles: paginatedItems,
    });
  } catch (error: any) {
    console.error('Error fetching Business Standard feed:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error while fetching feeds' },
      { status: 500 }
    );
  }
}
