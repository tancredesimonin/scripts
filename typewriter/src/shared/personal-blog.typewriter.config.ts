import {TypewriterConfig} from 'typewriter-tools'

const BASE_URL = 'http://localhost:3000'

export const supportedLocales = ['en', 'fr'] as const
export type SupportedLocale = (typeof supportedLocales)[number]

export const typewriterConfig: TypewriterConfig<SupportedLocale> = {
  baseUrl: BASE_URL,
  directory: '/Users/tancredo/code/blog/repository',
  defaultLocale: 'en',
  supportedLocales,
  home: {
    label: {
      en: 'Home',
      fr: 'Accueil',
    },
  },
  series: {
    segment: '/series',
    label: {
      en: 'Series',
      fr: 'Séries',
    },
  },
  categories: {
    segment: '/categories',
    label: {
      en: 'Categories',
      fr: 'Catégories',
    },
  },
  tags: {
    segment: '/tags',
    label: {
      en: 'Tags',
      fr: 'Tags',
    },
  },
  articles: {
    segment: '/articles',
    label: {
      en: 'Articles',
      fr: 'Articles',
    },
  },
}
