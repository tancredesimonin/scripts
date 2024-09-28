import {select} from '@inquirer/prompts'
import {ux} from '@oclif/core'
import {generateObject} from 'ai'
import * as dotenv from 'dotenv'
import {formatDate} from 'typewriter-tools/shared'
import {z} from 'zod'

import BaseCommand from '../base.js'
dotenv.config()

export default class Translate extends BaseCommand {
  static override description = 'Translate a given category'

  public async run(): Promise<void> {
    const {categories} = this.project.typewriter().drafts.content.categories.allByLocale('fr')

    const categorySlug = await select({
      message: 'Select the category to translate',
      choices: this.prompt.itemSelectorChoices(categories),
    })

    const {category} = this.project.typewriter().drafts.content.categories.bySlug(categorySlug, 'fr')

    ux.action.start(`✨ Translating ${categorySlug} to english`)
    const {object: englishTranslation} = await generateObject({
      model: this.ia.models.gpt4o(),

      system: this.ia.personas.author.description,
      prompt: `
      Translate the blog category below to English. 
      Keep the same tone of voice as the original text.
      
      title: ${category.title}
      catchline: ${category.catchline}
      description: ${category.description}
      content:${category.content}`,
      schema: z.object({
        title: z.string(),
        catchline: z.string(),
        description: z.string(),
        content: z.string(),
      }),
      temperature: this.ia.temperature.precise,
    })

    const englishVersion = {
      ...category,
      locale: 'en',
      title: englishTranslation.title,
      catchline: englishTranslation.catchline,
      description: englishTranslation.description,
      content: englishTranslation.content,
      updatedAt: formatDate(new Date().toISOString()),
    }
    this.project.typewriter().manager.categories.upsert(englishVersion, 'drafts')
    ux.action.stop()

    ux.action.start(`✨ Translating ${categorySlug} to portuguese`)
    const {object: portugueseTranslation} = await generateObject({
      model: this.ia.models.gpt4o(),

      system: this.ia.personas.author.description,
      prompt: `
      Translate the blog category below to Portuguese - Brazil. 
      Keep the same tone of voice as the original text.
      
      title: ${category.title}
      catchline: ${category.catchline}
      description: ${category.description}
      content:${category.content}`,
      schema: z.object({
        title: z.string(),
        catchline: z.string(),
        description: z.string(),
        content: z.string(),
      }),
      temperature: this.ia.temperature.precise,
    })

    const portugueseVersion = {
      ...category,
      locale: 'pt',
      title: portugueseTranslation.title,
      catchline: portugueseTranslation.catchline,
      description: portugueseTranslation.description,
      content: portugueseTranslation.content,
      updatedAt: formatDate(new Date().toISOString()),
    }
    this.project.typewriter().manager.categories.upsert(portugueseVersion, 'drafts')
    ux.action.stop()

    ux.action.start(`✨ Translating ${categorySlug} to spanish`)
    const {object: spanishTranslation, usage} = await generateObject({
      model: this.ia.models.gpt4o(),

      system: this.ia.personas.author.description,
      prompt: `
      Translate the blog category below to Spanish. 
      Keep the same tone of voice as the original text.
      
      title: ${category.title}
      catchline: ${category.catchline}
      description: ${category.description}
      content:${category.content}`,
      schema: z.object({
        title: z.string(),
        catchline: z.string(),
        description: z.string(),
        content: z.string(),
      }),
      temperature: this.ia.temperature.precise,
    })

    const spanishVersion = {
      ...category,
      locale: 'es',
      title: spanishTranslation.title,
      catchline: spanishTranslation.catchline,
      description: spanishTranslation.description,
      content: spanishTranslation.content,
      updatedAt: formatDate(new Date().toISOString()),
    }
    this.project.typewriter().manager.categories.upsert(spanishVersion, 'drafts')
    ux.action.stop()

    this.ia.logUsage(this.ia.models.gpt4o(), usage)
    this.log(`✅ Translated ${categorySlug}`)
  }
}
