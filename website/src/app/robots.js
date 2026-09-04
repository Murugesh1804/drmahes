export default function robots() {
  const baseUrl = 'https://drmahesdentistry.in';

  return {
    rules: [
      {
        // General crawlers — allow everything
        userAgent: '*',
        allow: '/',
        disallow: ['/private/', '/contact?*'],
      },
      {
        // Allow AI Search Engines for Local Discovery & Citations
        userAgent: 'GPTBot',
        allow: '/',
      },
      {
        userAgent: 'Google-Extended',
        allow: '/',
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
      },
      {
        // Block aggressive training/data scrapers
        userAgent: 'Bytespider',
        disallow: '/',
      },
      {
        userAgent: 'CCBot',
        disallow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
