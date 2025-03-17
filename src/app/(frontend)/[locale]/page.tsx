import { Metadata } from 'next'
import { TypedLocale } from 'payload'
import { routing } from '@/i18n/routing'
// Import the named exports, not default
import { PageComponent, getPageMeta } from './[slug]/page'

// Generate static paths for the root locale paths
export async function generateStaticParams() {
  return routing.locales.map((locale) => ({
    locale: String(locale),
  }))
}

// Helper function to construct home slug for a locale
const getHomeSlugForLocale = (locale: TypedLocale): string => {
  return `home-${locale}`
}

// Custom page function to handle the root locale path as home
export default async function LocaleHomePage({ params }: { params: { locale: TypedLocale } }) {
  const awaitedParams = await params
  const homeSlug = getHomeSlugForLocale(awaitedParams.locale)

  // Pass the dynamically constructed home slug to the page component
  return PageComponent({
    params: {
      locale: awaitedParams.locale,
      slug: homeSlug,
    },
  })
}

// Generate metadata for the home page
export async function generateMetadata({
  params,
}: {
  params: { locale: TypedLocale }
}): Promise<Metadata> {
  const awaitedParams = await params
  const homeSlug = getHomeSlugForLocale(awaitedParams.locale)

  // Use the dynamically constructed home slug
  return getPageMeta({
    params: {
      locale: awaitedParams.locale,
      slug: homeSlug,
    },
  })
}
