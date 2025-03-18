import { cn } from 'src/utilities/ui'
import React from 'react'

import type { Post } from '@/payload-types'

import { Card, CardPostData } from '@/components/Card'

export type Props = {
  posts: CardPostData[]
  locale: string // Add locale parameter
}

export const CollectionArchive: React.FC<Props> = (props) => {
  const { posts, locale } = props // Extract locale from props

  return (
    <div className={cn('container')}>
      <div>
        <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-12 gap-y-4 gap-x-4 lg:gap-y-8 lg:gap-x-8 xl:gap-x-8">
          {posts?.map((result, index) => {
            if (typeof result === 'object' && result !== null) {
              return (
                <div className="col-span-4" key={index}>
                  <Card
                    className="h-full"
                    doc={result}
                    relationTo="posts"
                    showCategories
                    locale={locale} // Pass locale to Card component
                  />
                </div>
              )
            }

            return null
          })}
        </div>
      </div>
    </div>
  )
}
