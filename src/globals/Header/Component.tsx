import { HeaderClient } from './Component.client'
import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'

import type { Header } from '@/payload-types'
import { TypedLocale } from 'payload'

type HeaderProps = {
  locale: TypedLocale
}

export async function Header({ locale }: HeaderProps) {
  const headerData: Header = await getCachedGlobal('header', 1)()

  return <HeaderClient data={headerData} locale={locale} />
}
