import {select} from '@inquirer/prompts'
import {ux} from '@oclif/core'
import {generateObject} from 'ai'
import * as dotenv from 'dotenv'
import {formatDate} from 'typewriter-tools/shared'
import {z} from 'zod'

import BaseCommand from '../base.js'
dotenv.config()

export default class Translate extends BaseCommand {
  static override description = 'Translate a given serie'

  public async run(): Promise<void> {
    const {series} = this.project.typewriter().drafts.content.series.allByLocale('fr')

    const serieSlug = await select({
      message: 'Select the serie to translate',
      choices: this.prompt.itemSelectorChoices(series),
    })

    const {serie} = this.project.typewriter().drafts.content.series.bySlug(serieSlug, 'fr')

    ux.action.start(`✨ Translating ${serieSlug} to english`)
    const {object: englishTranslation} = await generateObject({
      model: this.ia.models.gpt4o(),

      system: this.ia.personas.author.description,
      prompt: `
      Translate the blog serie below to English. 
      Keep the same tone of voice as the original text.
      
      title: ${serie.title}
      catchline: ${serie.catchline}
      description: ${serie.description}
      content:${serie.content}`,
      schema: z.object({
        title: z.string(),
        catchline: z.string(),
        description: z.string(),
        content: z.string(),
      }),
      temperature: this.ia.temperature.precise,
    })

    const englishVersion = {
      ...serie,
      locale: 'en',
      title: englishTranslation.title,
      catchline: englishTranslation.catchline,
      description: englishTranslation.description,
      content: englishTranslation.content,
      updatedAt: formatDate(new Date().toISOString()),
    }
    this.project.typewriter().manager.series.upsert(englishVersion, 'drafts')
    ux.action.stop()

    ux.action.start(`✨ Translating ${serieSlug} to portuguese`)
    const {object: portugueseTranslation} = await generateObject({
      model: this.ia.models.gpt4o(),

      system: this.ia.personas.author.description,
      prompt: `
      Translate the blog serie below to Portuguese - Brazil. 
      Keep the same tone of voice as the original text.
      
      title: ${serie.title}
      catchline: ${serie.catchline}
      description: ${serie.description}
      content:${serie.content}`,
      schema: z.object({
        title: z.string(),
        catchline: z.string(),
        description: z.string(),
        content: z.string(),
      }),
      temperature: this.ia.temperature.precise,
    })

    const portugueseVersion = {
      ...serie,
      locale: 'pt',
      title: portugueseTranslation.title,
      catchline: portugueseTranslation.catchline,
      description: portugueseTranslation.description,
      content: portugueseTranslation.content,
      updatedAt: formatDate(new Date().toISOString()),
    }
    this.project.typewriter().manager.series.upsert(portugueseVersion, 'drafts')
    ux.action.stop()

    ux.action.start(`✨ Translating ${serieSlug} to spanish`)
    const {object: spanishTranslation, usage} = await generateObject({
      model: this.ia.models.gpt4o(),

      system: this.ia.personas.author.description,
      prompt: `
      Translate the blog serie below to Spanish. 
      Keep the same tone of voice as the original text.
      
      title: ${serie.title}
      catchline: ${serie.catchline}
      description: ${serie.description}
      content:${serie.content}`,
      schema: z.object({
        title: z.string(),
        catchline: z.string(),
        description: z.string(),
        content: z.string(),
      }),
      temperature: this.ia.temperature.precise,
    })

    const spanishVersion = {
      ...serie,
      locale: 'es',
      title: spanishTranslation.title,
      catchline: spanishTranslation.catchline,
      description: spanishTranslation.description,
      content: spanishTranslation.content,
      updatedAt: formatDate(new Date().toISOString()),
    }
    this.project.typewriter().manager.series.upsert(spanishVersion, 'drafts')
    ux.action.stop()

    this.ia.logUsage(this.ia.models.gpt4o(), usage)
    this.log(`✅ Translated ${serieSlug}`)
  }
}
