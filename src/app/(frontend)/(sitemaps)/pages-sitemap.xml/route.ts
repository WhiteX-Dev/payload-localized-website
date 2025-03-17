import { getServerSideSitemap } from 'next-sitemap'
import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'

const getPagesSitemap = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const SITE_URL =
      process.env.NEXT_PUBLIC_SERVER_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      'https://example.com'

    // Get supported locales - add your locales here
    const locales = ['en', 'ro', 'hu'] // Update with your supported locales

    let sitemapEntries = []

    // Process each locale
    for (const locale of locales) {
      // Fetch pages for this locale
      const results = await payload.find({
        collection: 'pages',
        overrideAccess: false,
        draft: false,
        depth: 0,
        limit: 1000,
        locale, // Add locale to query
        pagination: false,
        where: {
          _status: {
            equals: 'published',
          },
        },
        select: {
          slug: true,
          updatedAt: true,
        },
      })

      const dateFallback = new Date().toISOString()

      // Default entries with locale
      const defaultSitemapEntries = [
        {
          loc: `${SITE_URL}/${locale}/search`,
          lastmod: dateFallback,
        },
        {
          loc: `${SITE_URL}/${locale}/posts`,
          lastmod: dateFallback,
        },
      ]

      // Process pages with locale
      const localizedPageEntries = results.docs
        ? results.docs
            .filter((page) => Boolean(page?.slug))
            .map((page) => {
              return {
                loc:
                  page?.slug === 'home'
                    ? `${SITE_URL}/${locale}`
                    : `${SITE_URL}/${locale}/${page?.slug}`,
                lastmod: page.updatedAt || dateFallback,
              }
            })
        : []

      sitemapEntries = [...sitemapEntries, ...defaultSitemapEntries, ...localizedPageEntries]
    }

    return sitemapEntries
  },
  ['pages-sitemap'],
  {
    tags: ['pages-sitemap'],
  },
)

export async function GET() {
  const sitemap = await getPagesSitemap()

  return getServerSideSitemap(sitemap)
}
