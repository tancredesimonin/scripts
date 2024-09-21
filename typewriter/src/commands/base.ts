import {createOpenAI} from '@ai-sdk/openai'
import {Command} from '@oclif/core'
import * as dotenv from 'dotenv'
import {existsSync, readdirSync, mkdirSync} from 'node:fs'
import {TypewriterManager} from 'typewriter-tools/manager'
import {TypewriterServer} from 'typewriter-tools/server'

import {typewriterConfig} from '../shared/personal-blog.typewriter.config.js'
dotenv.config()

export default abstract class BaseCommand extends Command {
  protected project = {
    typewriter() {
      const manager = new TypewriterManager(typewriterConfig)
      const drafts = new TypewriterServer({
        ...typewriterConfig,
        stage: 'drafts',
      })

      const published = new TypewriterServer({
        ...typewriterConfig,
        stage: 'published',
      })

      return {
        manager,
        drafts,
        published,
      }
    },

    /**
     * @deprecated
     */
    getConfig() {
      const projectFolder = '/Users/tancredo/code/blog/repository/content'
      const draftsFolder = '/Users/tancredo/code/blog/repository/content/articles/drafts'
      return {
        projectFolder,
        draftsFolder,
      }
    },

    /**
     * @deprecated
     */
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

    itemSelectorChoices(items: {title: string; slug: string}[]): {name: string; value: string; description: string}[] {
      return items.map((item) => ({
        name: item.title,
        value: item.slug,
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
