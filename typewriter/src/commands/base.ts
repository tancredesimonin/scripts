import {createOpenAI} from '@ai-sdk/openai'
import {Command} from '@oclif/core'
import {LanguageModelV1} from 'ai'
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

    getConfig() {
      // Consider moving these paths to environment variables or a configuration file
      const projectFolder = '/Users/tancredo/code/blog/repository/content'
      const draftsFolder = '/Users/tancredo/code/blog/repository/content/articles/drafts'
      return {projectFolder, draftsFolder}
    },

    validateDraftsFolder: () => {
      const {draftsFolder} = this.project.getConfig()
      this.log(`📁 Found existing drafts folder ${draftsFolder}`)
      if (!existsSync(draftsFolder)) {
        this.log(`📁 Creating drafts folder ${draftsFolder}`)
        mkdirSync(draftsFolder, {recursive: true})
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
    prices: {
      'gpt-4o-mini': {input: 0.15, output: 0.6},
      'gpt-4o': {input: 5, output: 15},
    },

    calculateCost(
      usage: {promptTokens: number; completionTokens: number},
      price: {input: number; output: number},
    ): number {
      const inputCost = price.input / 1_000_000
      const outputCost = price.output / 1_000_000
      return usage.promptTokens * inputCost + usage.completionTokens * outputCost
    },

    logUsage(model: LanguageModelV1, usage: {promptTokens: number; completionTokens: number}) {
      console.log(`✨ Used ${usage.promptTokens} prompts tokens and ${usage.completionTokens} completion tokens`)
      console.log(`✨ Used ${model.modelId} model`)
      const cost = this.calculateCost(usage, this.prices[model.modelId as keyof typeof this.prices])
      console.log(`💸 Cost $${cost.toFixed(6)}`)
    },

    models: {
      gptMini: () => this.ia.createOpenAIModel('gpt-4o-mini'),
      gpt4o: () => this.ia.createOpenAIModel('gpt-4o'),
    },

    createOpenAIModel(modelId: string) {
      const openai = createOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        project: process.env.OPENAI_PROJECT,
      })
      return openai(modelId, {})
    },
  }
}
