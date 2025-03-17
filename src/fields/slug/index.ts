import type { CheckboxField, TextField } from 'payload'

import { formatSlugHook } from './formatSlug'

type Overrides = {
  slugOverrides?: Partial<TextField>
  checkboxOverrides?: Partial<CheckboxField>
}

type Slug = (fieldToUse?: string, overrides?: Overrides) => [TextField, CheckboxField]

export const slugField: Slug = (fieldToUse = 'title', overrides = {}) => {
  const { slugOverrides, checkboxOverrides } = overrides

  const checkBoxField: CheckboxField = {
    name: 'slugLock',
    type: 'checkbox',
    defaultValue: true,
    admin: {
      hidden: true,
      position: 'sidebar',
      condition: (data) => Boolean(data?.localized),
    },
    ...checkboxOverrides,
  }

  // @ts-expect-error - ts mismatch Partial<TextField> with TextField
  const slugField: TextField = {
    name: 'slug',
    type: 'text',
    index: true,
    label: 'Slug',
    // localized: true,
    ...(slugOverrides || {}),
    hooks: {
      // Kept this in for hook or API based updates
      beforeValidate: [formatSlugHook(fieldToUse)],
      beforeChange: [
        ({ data, req, originalDoc }) => {
          // If slug is locked
          if (data.slugLock) {
            // If we have an original slug, use it
            if (originalDoc?.slug) {
              return originalDoc.slug
            }

            // If no original slug but we have data.slug (from beforeValidate), use it
            if (data.slug) {
              return data.slug
            }

            // Otherwise, generate a slug from the title
            // This handles new localized versions where originalDoc.slug doesn't exist
            if (data[fieldToUse]) {
              const locale = req.locale || 'en'
              return formatSlugHook(fieldToUse)({ data, req })
            }

            // Fallback
            return ''
          }

          // Not locked, use the provided slug
          return data.slug
        },
      ],
    },
    admin: {
      position: 'sidebar',
      ...(slugOverrides?.admin || {}),
      components: {
        Field: {
          path: '@/fields/slug/SlugComponent#SlugComponent',
          clientProps: {
            fieldToUse,
            checkboxFieldPath: checkBoxField.name,
          },
        },
      },
    },
  }

  return [slugField, checkBoxField]
}
