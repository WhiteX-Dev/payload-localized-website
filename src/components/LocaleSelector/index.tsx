'use client'

import React, { useState } from 'react'
import { useLocale } from 'next-intl'
import { useParams } from 'next/navigation'
import { usePathname, useRouter } from '@/i18n/routing'
import { TypedLocale } from 'payload'
import localization from '@/i18n/localization'
import { cn } from '@/utilities/ui'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type LocaleSelectorProps = {
  className?: string
}

export function LocaleSelector({ className }: LocaleSelectorProps) {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const [isChanging, setIsChanging] = useState(false)

  async function onSelectChange(newLocale: TypedLocale) {
    if (isChanging) return
    setIsChanging(true)

    try {
      // Get current slug and path information
      const currentSlug = params?.slug || 'home'
      const isPost = pathname?.includes('/posts/')
      const isPostsArchive = pathname === '/posts' || pathname?.endsWith('/posts')
      const postSlug = isPost ? params?.slug : null

      // For posts archive page, just change locale but keep on /posts
      if (isPostsArchive) {
        return router.replace('/posts', { locale: newLocale })
      }

      // For home page, just change locale
      if (currentSlug === 'home' && !isPost) {
        return router.replace('/', { locale: newLocale })
      }

      // For posts or pages, find the equivalent content in the target language
      const apiEndpoint = `/api/translate-url`
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentSlug,
          currentLocale: locale,
          targetLocale: newLocale,
          contentType: isPost ? 'posts' : 'pages',
        }),
      })

      if (response.ok) {
        const { targetSlug } = await response.json()

        // If we found a translated slug, use it
        if (targetSlug) {
          const newPath = isPost
            ? `/posts/${targetSlug}`
            : targetSlug === 'home'
              ? '/'
              : `/${targetSlug}`
          return router.replace(newPath, { locale: newLocale })
        }
      }

      // Fallback to just changing the locale part if translation lookup fails
      router.replace(pathname || '/', { locale: newLocale })
    } catch (error) {
      console.error('Locale change error:', error)
      // Fallback to simple locale change
      router.replace(pathname || '/', { locale: newLocale })
    } finally {
      setIsChanging(false)
    }
  }

  return (
    <Select onValueChange={onSelectChange} value={locale} disabled={isChanging}>
      <SelectTrigger
        className={cn(
          'w-auto p-0 pl-0 text-sm font-medium text-black bg-transparent border-none md:ml-9 dark:text-white',
          className,
        )}
      >
        <SelectValue placeholder="Language" />
      </SelectTrigger>
      <SelectContent>
        {localization.locales
          .sort((a, b) => a.label.localeCompare(b.label))
          .map((locale) => (
            <SelectItem value={locale.code} key={locale.code}>
              {locale.label}
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  )
}
