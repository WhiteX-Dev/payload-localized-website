import { unstable_cache } from 'next/cache'

const getSitemapIndex = unstable_cache(
  async () => {
    const SITE_URL =
      process.env.NEXT_PUBLIC_SERVER_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      'https://example.com'

    // Current date for lastmod timestamps
    const currentDate = new Date().toISOString()

    // List all sitemap URLs with lastmod
    return [
      {
        url: `${SITE_URL}/posts-sitemap.xml`,
        lastmod: currentDate,
      },
      {
        url: `${SITE_URL}/pages-sitemap.xml`,
        lastmod: currentDate,
      },
    ]
  },
  ['sitemap-index'],
  {
    tags: ['sitemap-index'],
  },
)

export async function GET() {
  const sitemaps = await getSitemapIndex()

  // Generate custom XML with lastmod timestamps
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

  sitemaps.forEach((sitemap) => {
    xml += '  <sitemap>\n'
    xml += `    <loc>${sitemap.url}</loc>\n`
    xml += `    <lastmod>${sitemap.lastmod}</lastmod>\n`
    xml += '  </sitemap>\n'
  })

  xml += '</sitemapindex>'

  // Return custom XML response
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
