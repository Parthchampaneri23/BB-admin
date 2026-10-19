import { NextRequest, NextResponse } from 'next/server';

function cleanHtml(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
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

function scrubExternalBranding(text: string): string {
  if (!text) return '';
  return text
    .replace(/Business\s*Standard/gi, 'BusinessBulletin')
    .replace(/\b(ANI|PTI|Press\s*Trust\s*of\s*India|Asian\s*News\s*International)\b/gi, 'BusinessBulletin Desk')
    .replace(/Follow us on (Twitter|Facebook|Telegram|WhatsApp|Instagram)[^\n.]*/gi, '')
    .replace(/Also Read:[^\n.]*/gi, '')
    .trim();
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
      return NextResponse.json({ success: false, error: 'A valid article URL is required.' }, { status: 400 });
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: `Failed to load article from source (${response.status} ${response.statusText})` },
        { status: 502 }
      );
    }

    const html = await response.text();

    // 1. Extract JSON-LD Schemas (NewsArticle has structured articleBody, headline, author, image, etc.)
    let articleBody = '';
    let headline = '';
    let description = '';
    let imageUrl = '';
    let author = '';
    let pubDate = '';
    let keywords = '';

    const jsonLdRegex = /<script[^>]*type=['"]application\/ld\+json['"][^>]*>([\s\S]*?)<\/script>/gi;
    let match;
    while ((match = jsonLdRegex.exec(html)) !== null) {
      try {
        const rawJson = match[1].trim();
        const data = JSON.parse(rawJson);
        const candidates = Array.isArray(data) ? data : [data];

        for (const item of candidates) {
          if (item['@type'] === 'NewsArticle' || item['@type'] === 'Article') {
            if (item.articleBody && typeof item.articleBody === 'string') {
              articleBody = cleanHtml(item.articleBody);
            }
            if (item.headline && typeof item.headline === 'string') {
              headline = cleanHtml(item.headline);
            }
            if (item.description && typeof item.description === 'string') {
              description = cleanHtml(item.description);
            }
            if (item.datePublished && typeof item.datePublished === 'string') {
              pubDate = item.datePublished;
            }
            if (item.keywords) {
              keywords = Array.isArray(item.keywords) ? item.keywords.join(', ') : String(item.keywords);
            }
            if (item.image) {
              if (typeof item.image === 'string') imageUrl = item.image;
              else if (Array.isArray(item.image) && item.image[0]) {
                imageUrl = typeof item.image[0] === 'string' ? item.image[0] : item.image[0].url || '';
              } else if (item.image.url) {
                imageUrl = item.image.url;
              }
            }
            if (item.author) {
              if (Array.isArray(item.author) && item.author[0]?.name) {
                author = item.author[0].name;
              } else if (item.author.name) {
                author = item.author.name;
              }
            }
            break;
          }
        }
      } catch (e) {
        // Continue to other blocks if one fails JSON parsing
      }
    }

    // 2. Fallbacks if JSON-LD wasn't present or missing full text
    if (!headline) {
      const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
      if (h1Match) headline = cleanHtml(h1Match[1]);
    }

    if (!description) {
      const metaDescMatch = html.match(/<meta[^>]+name=['"]description['"][^>]+content=['"]([\s\S]*?)['"]/i);
      if (metaDescMatch) description = cleanHtml(metaDescMatch[1]);
    }

    if (!imageUrl) {
      const ogImgMatch = html.match(/<meta[^>]+property=['"]og:image['"][^>]+content=['"]([\s\S]*?)['"]/i);
      if (ogImgMatch) imageUrl = ogImgMatch[1];
    }

    if (!articleBody) {
      // Extract paragraphs from article tag or story content
      const pMatches = html.match(/<p[^>]*>([\s\S]*?)<\/p>/gi);
      if (pMatches) {
        const cleanedParagraphs = pMatches
          .map((p) => cleanHtml(p))
          .filter(
            (p) =>
              p.length > 50 &&
              !p.startsWith('.') &&
              !p.includes('Telegram channel') &&
              !p.includes('background-repeat') &&
              !p.includes('Business Standard')
          );
        if (cleanedParagraphs.length > 0) {
          articleBody = cleanedParagraphs.join('\n\n');
        }
      }
    }

    // Clean headline, summary and body of external branding
    const finalAuthor = 'BusinessBulletin Desk';
    const cleanHeadline = scrubExternalBranding(headline);
    const cleanDesc = scrubExternalBranding(description || (articleBody ? articleBody.slice(0, 200) + '...' : ''));
    const cleanFullText = scrubExternalBranding(articleBody || description);
    const cleanKeywords = scrubExternalBranding(keywords);

    return NextResponse.json({
      success: true,
      data: {
        headline: cleanHeadline,
        description: cleanDesc,
        fullText: cleanFullText,
        imageUrl,
        author: finalAuthor,
        pubDate: pubDate || new Date().toISOString(),
        keywords: cleanKeywords,
        url: '', // keep secret - do not expose third party url in admin form
      },
    });
  } catch (error: any) {
    console.error('Error scraping article full detail:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to extract article details.' },
      { status: 500 }
    );
  }
}
