import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload, type RequiredDataFromCollectionSlug } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import { homeStatic } from '@/endpoints/seed/home-static'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'
import { TypedLocale } from 'payload'
import { routing } from '@/i18n/routing'
import { LivePreviewListener } from '@/components/LivePreviewListener'

// For pages
export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const pages = await payload.find({
    collection: 'pages',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  return pages.docs
    ?.filter((doc) => doc.slug !== 'home')
    .flatMap(({ slug }) =>
      routing.locales.map((locale) => ({
        slug: String(slug), // Ensure slug is a string
        locale: String(locale), // Ensure locale is a string
      })),
    )
}

type Args = {
  params: {
    slug?: string
    locale: TypedLocale
  }
}

export default async function Page({ params }: Args) {
  const { isEnabled: draft } = await draftMode()
  const awaitedParams = await params
  const { slug = 'home', locale = 'en' } = awaitedParams
  const url = slug === 'home' ? '/' : '/' + slug

  let page: RequiredDataFromCollectionSlug<'pages'> | null

  try {
    console.log(`Fetching page for slug: ${slug} and locale: ${locale}`)
    page = await queryPageBySlug({
      slug,
      locale,
    })
    console.log(`Page found for ${slug}, locale: ${locale}: ${page ? 'Yes' : 'No'}`)

    // Only use homeStatic as a fallback during development if needed
    if (!page && slug === 'home') {
      console.log('Using homeStatic fallback for home page')
      page = homeStatic
    }

    if (!page) {
      console.log(`Page not found for slug: ${slug} and locale: ${locale}, returning 404`)
      return <PayloadRedirects url={url} />
    }

    const { hero, layout } = page

    return (
      <article className="pt-16 pb-24">
        <PageClient page={page} />
        {/* Allows redirects for valid pages too */}
        <PayloadRedirects disableNotFound url={url} />

        {draft && <LivePreviewListener />}

        <RenderHero {...hero} />
        <RenderBlocks blocks={layout} locale={locale} />
      </article>
    )
  } catch (error) {
    console.error(`Error rendering page for slug: ${slug} and locale: ${locale}:`, error)
    return <div>Error loading page. Please try again later.</div>
  }
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const awaitedParams = await params
  const { slug = 'home', locale = 'en' } = awaitedParams
  const page = await queryPageBySlug({
    slug,
    locale,
  })

  return generateMeta({ doc: page })
}

const queryPageBySlug = cache(async ({ slug, locale }: { slug: string; locale: TypedLocale }) => {
  try {
    const { isEnabled: draft } = await draftMode()
    const payload = await getPayload({ config: configPromise })

    console.log(`Running query for slug: ${slug}, locale: ${locale}, draft mode: ${draft}`)

    const result = await payload.find({
      collection: 'pages',
      draft,
      limit: 1,
      locale,
      pagination: false,
      overrideAccess: draft,
      where: {
        slug: {
          equals: slug,
        },
      },
    })

    console.log(`Query results for ${slug}/${locale}: Found ${result.docs.length} docs`)
    return result.docs?.[0] || null
  } catch (error) {
    console.error(`Error in queryPageBySlug for ${slug}/${locale}:`, error)
    throw error
  }
})

// Exporting the Page component for reuse
export const PageComponent = Page
export const getPageMeta = generateMetadata
