'use client'

import React, { useEffect, useState } from 'react'
import type { Header as HeaderType } from '@/payload-types'
import { CMSLink } from '@/components/Link'
import Link from 'next/link'
import { SearchIcon } from 'lucide-react'
import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { LocaleSelector } from '@/components/LocaleSelector'
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data: initialData }) => {
  const t = useTranslations()
  const locale = useLocale()
  const [data, setData] = useState<HeaderType>(initialData)

  // Fetch localized navigation data when the locale changes
  useEffect(() => {
    const fetchLocalizedNav = async () => {
      try {
        const response = await fetch(`/api/globals/header?depth=1&draft=false&locale=${locale}`)
        if (response.ok) {
          const localizedData = await response.json()
          setData(localizedData)
        }
      } catch (error) {
        console.error('Error fetching localized navigation:', error)
      }
    }

    fetchLocalizedNav()
  }, [locale])

  const navItems = data?.navItems || []

  return (
    <nav className="flex gap-3 items-center">
      {navItems.map(({ link }, i) => {
        return <CMSLink key={i} {...link} appearance="link" />
      })}
      <Link href="/search">
        <span className="sr-only">{t('search')}</span>
        <SearchIcon className="w-5 text-primary" />
      </Link>
      <LocaleSelector />
      <ThemeSelector />
    </nav>
  )
}
