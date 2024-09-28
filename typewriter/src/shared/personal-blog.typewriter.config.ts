import {TypewriterConfig} from 'typewriter-tools'

const BASE_URL = 'http://localhost:3000'

export const supportedLocales = ['en', 'fr', 'pt', 'es'] as const
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
      pt: 'Início',
      es: 'Inicio',
    },
  },
  series: {
    segment: '/series',
    label: {
      en: 'Series',
      fr: 'Séries',
      pt: 'Séries',
      es: 'Series',
    },
  },
  categories: {
    segment: '/categories',
    label: {
      en: 'Categories',
      fr: 'Catégories',
      pt: 'Categorias',
      es: 'Categorías',
    },
  },
  tags: {
    segment: '/tags',
    label: {
      en: 'Tags',
      fr: 'Tags',
      pt: 'Tags',
      es: 'Tags',
    },
  },
  articles: {
    segment: '/articles',
    label: {
      en: 'Articles',
      fr: 'Articles',
      pt: 'Artigos',
      es: 'Artículos',
    },
  },
}
