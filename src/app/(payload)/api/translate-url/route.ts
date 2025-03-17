import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { currentSlug, currentLocale, targetLocale, contentType } = await request.json()

    // For safety, validate input
    if (!currentSlug || !currentLocale || !targetLocale || !contentType) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // Initialize Payload CMS
    const payload = await getPayload({ config: configPromise })

    // First, get the document ID in the current language
    const currentDoc = await payload.find({
      collection: contentType,
      limit: 1,
      locale: currentLocale,
      where: {
        slug: { equals: currentSlug },
      },
      depth: 0,
    })

    // If document not found, return null
    if (!currentDoc.docs || currentDoc.docs.length === 0) {
      return NextResponse.json({ targetSlug: null })
    }

    // Get the document ID from the current language version
    const docId = currentDoc.docs[0].id

    // Now fetch the same document by ID in the target language
    const targetDoc = await payload.findByID({
      id: docId,
      collection: contentType,
      locale: targetLocale,
      depth: 0,
    })

    return NextResponse.json({
      targetSlug: targetDoc?.slug || null,
    })
  } catch (error) {
    console.error('Error in translate-url API:', error)
    return NextResponse.json({ error: 'Failed to translate URL' }, { status: 500 })
  }
}
