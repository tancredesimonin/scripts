import {createOpenAI} from '@ai-sdk/openai'
import {Command} from '@oclif/core'
import * as dotenv from 'dotenv'
import {existsSync, readdirSync, mkdirSync} from 'node:fs'
import {TypewriterServer} from 'typewriter-tools/server'
import {TypewriterConfig} from 'typewriter-tools/shared'
dotenv.config()

const BASE_URL = process.env.NEXT_PUBLIC_FRONTEND_BASE_URL ?? 'http://localhost:3000'

export const supportedLocales = ['en', 'fr'] as const
export type SupportedLocale = (typeof supportedLocales)[number]

export const typewriterConfig: TypewriterConfig<SupportedLocale> = {
  baseUrl: BASE_URL,
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

export default abstract class BaseCommand extends Command {
  protected project = {
    getTypewriter() {
      const typewriter = new TypewriterServer(typewriterConfig)
      return typewriter
    },
    getConfig() {
      const projectFolder = '/Users/tancredo/code/blog/repository/content'
      const draftsFolder = '/Users/tancredo/code/blog/repository/content/articles/drafts'
      return {
        projectFolder,
        draftsFolder,
      }
    },

    validateDraftsFolder: () => {
      const {draftsFolder} = this.project.getConfig()
      this.log(`📁 Found existing drafts folder ${draftsFolder}`)
      if (!existsSync(draftsFolder)) {
        this.log(`📁 Creating drafts folder ${draftsFolder}`)
        mkdirSync(draftsFolder)
      }
    },
  }

  protected prompt = {
    fileSelectorChoices(folder: string): {name: string; value: string; description: string}[] {
      const files = readdirSync(folder)
      return files.map((file) => ({
        name: file,
        value: file,
        description: '',
      }))
    },

    stringSelectorChoices(choices: {text: string}[]): {name: string; value: string; description: string}[] {
      return choices.map((choice) => ({
        name: choice.text,
        value: choice.text,
        description: '',
      }))
    },
  }

  protected ia = {
    calculateCost(usage: {promptTokens: number; completionTokens: number}): number {
      const inputCost = 0.15 / 1_000_000
      const outputCost = 0.6 / 1_000_000

      return usage.promptTokens * inputCost + usage.completionTokens * outputCost
    },
    logUsage(usage: {promptTokens: number; completionTokens: number}) {
      console.log(`✨ Used ${usage.promptTokens} prompts tokens and ${usage.completionTokens} completion tokens`)
      const cost = this.calculateCost(usage)
      console.log(`💸 Cost ${cost.toFixed(6)}$`)
    },

    models: {
      gptMini() {
        const openai = createOpenAI({
          apiKey: process.env.OPENAI_API_KEY,
          project: process.env.OPENAI_PROJECT,
        })

        return openai('gpt-4o-mini', {})
      },
    },
  }
}
