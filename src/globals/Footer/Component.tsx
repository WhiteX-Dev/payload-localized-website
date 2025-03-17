import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'

import type { Footer } from '@/payload-types'
import { TypedLocale } from 'payload'

import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { LocaleSelector } from '@/components/LocaleSelector'
import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'

type FooterProps = {
  locale: TypedLocale
}

export async function Footer({ locale }: FooterProps) {
  const footerData: Footer = await getCachedGlobal('footer', 1, locale)()

  const navItems = footerData?.navItems || []

  return (
    <footer
      className="mt-auto border-t border-border bg-black dark:bg-card text-white"
      data-theme="dark"
    >
      <div className="container py-8 gap-8 flex flex-col md:flex-row md:justify-between">
        <Link className="flex items-center" href={`/${locale}`}>
          <Logo className="h-8" />
        </Link>

        <div className="flex flex-col-reverse items-start md:flex-row gap-4 md:items-center">
          <nav className="flex flex-col md:flex-row gap-4">
            {navItems.map(({ link }, i) => {
              // Ensure links include the current locale
              const href =
                link.url && !link.url.startsWith('http')
                  ? `/${locale}${link.url.startsWith('/') ? link.url : `/${link.url}`}`
                  : link.url

              return <CMSLink className="text-white" key={i} {...link} url={href} />
            })}
          </nav>
          <LocaleSelector className="ml-5" />
          <ThemeSelector />
        </div>
      </div>
    </footer>
  )
}
