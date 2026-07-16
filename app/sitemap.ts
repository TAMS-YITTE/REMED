import { MetadataRoute } from 'next';
import { articles } from '@/lib/articles';

export default function sitemap(): MetadataRoute.Sitemap {
  const url = 'https://www.remedly.fr';
  const blogUrls = articles.map(article => ({
    url: `${url}/apprendre/${article.slug}`,
    lastModified: new Date(),
  }));

  return [
    { url: url, lastModified: new Date() },
    { url: `${url}/acheter`, lastModified: new Date() },
    { url: `${url}/apprendre`, lastModified: new Date() },
    { url: `${url}/cgu`, lastModified: new Date() },
    { url: `${url}/confidentialite`, lastModified: new Date() },
    { url: `${url}/mentions-legales`, lastModified: new Date() },
    ...blogUrls
  ];
}
