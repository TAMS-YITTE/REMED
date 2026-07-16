import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/portefeuille', // Page privée nécessitant connexion
    },
    sitemap: 'https://www.remedly.fr/sitemap.xml',
  };
}
