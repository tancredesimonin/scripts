import {select} from '@inquirer/prompts'
import {ux} from '@oclif/core'
import {generateObject} from 'ai'
import * as dotenv from 'dotenv'
import {formatDate} from 'typewriter-tools/shared'
import {z} from 'zod'

import BaseCommand from '../base.js'
dotenv.config()

export default class Translate extends BaseCommand {
  static override description = 'Translate a given tag'

  public async run(): Promise<void> {
    const {tags} = this.project.typewriter().drafts.content.tags.allByLocale('fr')

    const tagSlug = await select({
      message: 'Select the tag to translate',
      choices: this.prompt.itemSelectorChoices(tags),
    })

    const {tag} = this.project.typewriter().drafts.content.tags.bySlug(tagSlug, 'fr')

    ux.action.start(`✨ Translating ${tagSlug} to english`)
    const {object: englishTranslation} = await generateObject({
      model: this.ia.models.gpt4o(),

      system: this.ia.personas.author.description,
      prompt: `
      Translate the tag below to English. 
      Keep the same tone of voice as the tag.
      
      title: ${tag.title}
      catchline: ${tag.catchline}
      description: ${tag.description}
      content:${tag.content}`,
      schema: z.object({
        title: z.string(),
        catchline: z.string(),
        description: z.string(),
        content: z.string(),
      }),
      temperature: this.ia.temperature.precise,
    })

    const englishVersion = {
      ...tag,
      locale: 'en',
      title: englishTranslation.title,
      catchline: englishTranslation.catchline,
      description: englishTranslation.description,
      content: englishTranslation.content,
      updatedAt: formatDate(new Date().toISOString()),
    }
    this.project.typewriter().manager.tags.upsert(englishVersion, 'drafts')
    ux.action.stop()

    ux.action.start(`✨ Translating ${tagSlug} to portuguese`)
    const {object: portugueseTranslation} = await generateObject({
      model: this.ia.models.gpt4o(),

      system: this.ia.personas.author.description,
      prompt: `
      Translate the tag below to Portuguese - Brazil. 
      Keep the same tone of voice as the tag.
      
      title: ${tag.title}
      catchline: ${tag.catchline}
      description: ${tag.description}
      content:${tag.content}`,
      schema: z.object({
        title: z.string(),
        catchline: z.string(),
        description: z.string(),
        content: z.string(),
      }),
      temperature: this.ia.temperature.precise,
    })

    const portugueseVersion = {
      ...tag,
      locale: 'pt',
      title: portugueseTranslation.title,
      catchline: portugueseTranslation.catchline,
      description: portugueseTranslation.description,
      content: portugueseTranslation.content,
      updatedAt: formatDate(new Date().toISOString()),
    }
    this.project.typewriter().manager.tags.upsert(portugueseVersion, 'drafts')
    ux.action.stop()

    ux.action.start(`✨ Translating ${tagSlug} to spanish`)
    const {object: spanishTranslation, usage} = await generateObject({
      model: this.ia.models.gpt4o(),

      system: this.ia.personas.author.description,
      prompt: `
      Translate the blog below to Spanish. 
      Keep the same tone of voice as the tag.
      
      title: ${tag.title}
      catchline: ${tag.catchline}
      description: ${tag.description}
      content:${tag.content}`,
      schema: z.object({
        title: z.string(),
        catchline: z.string(),
        description: z.string(),
        content: z.string(),
      }),
      temperature: this.ia.temperature.precise,
    })

    const spanishVersion = {
      ...tag,
      locale: 'es',
      title: spanishTranslation.title,
      catchline: spanishTranslation.catchline,
      description: spanishTranslation.description,
      content: spanishTranslation.content,
      updatedAt: formatDate(new Date().toISOString()),
    }
    this.project.typewriter().manager.tags.upsert(spanishVersion, 'drafts')
    ux.action.stop()

    this.ia.logUsage(this.ia.models.gpt4o(), usage)
    this.log(`✅ Translated ${tagSlug}`)
  }
}
