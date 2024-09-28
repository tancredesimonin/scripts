import {createOpenAI} from '@ai-sdk/openai'
import {Command} from '@oclif/core'
import {LanguageModelV1} from 'ai'
import * as dotenv from 'dotenv'
import {readdirSync} from 'node:fs'
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
        config: typewriterConfig,
        manager,
        drafts,
        published,
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

    temperature: {
      creative: 0.8,
      precise: 0.3,
    },

    personas: {
      author: {
        description: `You are a professionnal software developer and engineer and an indie maker.
        You like to build professional software that makes people happy.
        The technical challenge and knowledge are here to serve the user and the product.
        You are writing a blog in order to share your experience building products and coding software.
        You have a few goals:
        - show that you can decide on the right technical and architectural choices efficiently. Your tone is direct and clear.
        - show you can build products that are both simple and efficient to use. You solve problems. You will provide answers, not just talk about problems, and be able to solve these problems.
        - You mainly focus on the practical aspects of software development, not on the theoretical aspects.
        - But sometimes you can prove your solid technical skills and reassure the reader by giving technical details, explaining how things work under the hood.
        - Your audience are mostly very busy CEOs or founders that need to make decisions about technology even though they might not have a technical background. They expect concise answers and actionable insights.
        - But a part of your audience are CTOs, VPs of engineering or senior developers that you can address with more technical details. So you have to be very precise and technical when needed.
        `,
      },
    },

    prompts: {
      spellcheck: {
        rules: `
      - You will correct grammar, spelling, syntax and punctuation mistakes.
      - You will not change the meaning of the text.
      - You will do that task in the same language as the text provided.
      - You can slightly rephrase or clarify some sentences if a sentence is not clear or if it is not written in a way that is easy to understand, or seems to have been translated by a machine and is not written in a natural way.
      - If the given text is between "" like "blabla" you will remove the extra " to return only the text inside.
      - if for any reason in one of the field there is a string "undefined" you will replace it by an empty string.
      - The content is markdown formatted. You will not change the markdown formatting.`,
      },
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
