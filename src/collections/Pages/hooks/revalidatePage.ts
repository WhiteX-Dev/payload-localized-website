import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import type { Page } from '../../../payload-types'

export const revalidatePage: CollectionAfterChangeHook<Page> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      const path =
        doc.slug === 'home' ? `/${doc.locale || 'en'}` : `/${doc.locale || 'en'}/${doc.slug}`

      payload.logger.info(`Revalidating page at path: ${path}`)

      revalidatePath(path)
      revalidateTag('pages-sitemap')
    }

    // If the page was previously published, we need to revalidate the old path
    if (previousDoc?._status === 'published' && doc._status !== 'published') {
      const oldPath =
        previousDoc?.slug === 'home'
          ? `/${previousDoc?.locale || 'en'}`
          : `/${previousDoc?.locale || 'en'}/${previousDoc?.slug}`

      payload.logger.info(`Revalidating old page at path: ${oldPath}`)

      revalidatePath(oldPath)
      revalidateTag('pages-sitemap')
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Page> = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    const deletePath =
      doc?.slug === 'home' ? `/${doc?.locale || 'en'}` : `/${doc?.locale || 'en'}/${doc?.slug}`
    revalidatePath(deletePath)
    revalidateTag('pages-sitemap')
  }

  return doc
}
