import { MetadataRoute } from 'next';
import { articles } from '@/lib/articles';
import { cryptoList } from '@/lib/cryptoList';

const MOIS_FR: Record<string, number> = {
  janvier: 0, février: 1, mars: 2, avril: 3, mai: 4, juin: 5,
  juillet: 6, août: 7, septembre: 8, octobre: 9, novembre: 10, décembre: 11,
};

function parseFrenchDate(date: string): Date {
  const [day, month, year] = date.toLowerCase().split(' ');
  const monthIndex = MOIS_FR[month];
  if (monthIndex === undefined) return new Date();
  return new Date(Number(year), monthIndex, Number(day));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const url = 'https://www.remedly.fr';

  const blogUrls = articles.map(article => ({
    url: `${url}/apprendre/${article.slug}`,
    lastModified: parseFrenchDate(article.date),
  }));

  const buyUrls = cryptoList
    .filter(crypto => crypto.supported)
    .map(crypto => ({
      url: `${url}/acheter/${crypto.id}`,
      lastModified: new Date(),
    }));

  return [
    { url: url, lastModified: new Date() },
    { url: `${url}/acheter`, lastModified: new Date() },
    { url: `${url}/apprendre`, lastModified: new Date() },
    { url: `${url}/plateforme`, lastModified: new Date() },
    { url: `${url}/cgu`, lastModified: new Date() },
    { url: `${url}/confidentialite`, lastModified: new Date() },
    { url: `${url}/mentions-legales`, lastModified: new Date() },
    ...buyUrls,
    ...blogUrls
  ];
}
