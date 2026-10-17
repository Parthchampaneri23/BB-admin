export interface ArticleSchemaData {
  title: string;
  summary: string;
  imageUrl: string;
  author: string;
  pubDate: string | Date;
  canonicalUrl?: string;
  categoryLabel?: string;
}

export function generateNewsArticleSchema(data: ArticleSchemaData): string {
  const publishedDate = data.pubDate ? new Date(data.pubDate).toISOString() : new Date().toISOString();
  const canonical = data.canonicalUrl || 'https://businessbulletin.com';

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    'headline': data.title,
    'description': data.summary,
    'image': [data.imageUrl],
    'datePublished': publishedDate,
    'dateModified': publishedDate,
    'author': [
      {
        '@type': 'Person',
        'name': data.author || 'BusinessBulletin Desk',
      },
    ],
    'publisher': {
      '@type': 'Organization',
      'name': 'BusinessBulletin',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://businessbulletin.com/updatedlogo.svg',
      },
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': canonical,
    },
    'articleSection': data.categoryLabel || 'Business & Financial News',
  };

  return JSON.stringify(schema, null, 2);
}
