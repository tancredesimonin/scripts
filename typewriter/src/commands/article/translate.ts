import {select} from '@inquirer/prompts'
import {ux} from '@oclif/core'
import {generateObject} from 'ai'
import * as dotenv from 'dotenv'
import {formatDate} from 'typewriter-tools/shared'
import {z} from 'zod'

import BaseCommand from '../base.js'
dotenv.config()

export default class Translate extends BaseCommand {
  static override description = 'Translate a given blog article'

  public async run(): Promise<void> {
    const {articles} = this.project.typewriter().drafts.content.articles.allByLocale('fr')

    const articleSlug = await select({
      message: 'Select the article to translate',
      choices: this.prompt.itemSelectorChoices(articles),
    })

    const {article} = this.project.typewriter().drafts.content.articles.bySlug(articleSlug, 'fr')

    ux.action.start(`✨ Translating ${articleSlug} to english`)
    const {object: englishTranslation} = await generateObject({
      model: this.ia.models.gpt4o(),

      system: this.ia.personas.author.description,
      prompt: `
      Translate the blog article below to English. 
      Keep the same tone of voice as the article.
      
      title: ${article.title}
      catchline: ${article.catchline}
      description: ${article.description}
      content:${article.content}`,
      schema: z.object({
        title: z.string(),
        catchline: z.string(),
        description: z.string(),
        content: z.string(),
      }),
      temperature: this.ia.temperature.precise,
    })

    const englishVersion = {
      ...article,
      locale: 'en',
      title: englishTranslation.title,
      catchline: englishTranslation.catchline,
      description: englishTranslation.description,
      content: englishTranslation.content,
      updatedAt: formatDate(new Date().toISOString()),
    }
    this.project.typewriter().manager.articles.upsert(englishVersion, 'drafts')
    ux.action.stop()

    ux.action.start(`✨ Translating ${articleSlug} to portuguese`)
    const {object: portugueseTranslation} = await generateObject({
      model: this.ia.models.gpt4o(),

      system: this.ia.personas.author.description,
      prompt: `
      Translate the blog article below to Portuguese - Brazil. 
      Keep the same tone of voice as the article.
      
      title: ${article.title}
      catchline: ${article.catchline}
      description: ${article.description}
      content:${article.content}`,
      schema: z.object({
        title: z.string(),
        catchline: z.string(),
        description: z.string(),
        content: z.string(),
      }),
      temperature: this.ia.temperature.precise,
    })

    const portugueseVersion = {
      ...article,
      locale: 'pt',
      title: portugueseTranslation.title,
      catchline: portugueseTranslation.catchline,
      description: portugueseTranslation.description,
      content: portugueseTranslation.content,
      updatedAt: formatDate(new Date().toISOString()),
    }
    this.project.typewriter().manager.articles.upsert(portugueseVersion, 'drafts')
    ux.action.stop()

    ux.action.start(`✨ Translating ${articleSlug} to spanish`)
    const {object: spanishTranslation, usage} = await generateObject({
      model: this.ia.models.gpt4o(),

      system: this.ia.personas.author.description,
      prompt: `
      Translate the blog article below to Spanish. 
      Keep the same tone of voice as the article.
      
      title: ${article.title}
      catchline: ${article.catchline}
      description: ${article.description}
      content:${article.content}`,
      schema: z.object({
        title: z.string(),
        catchline: z.string(),
        description: z.string(),
        content: z.string(),
      }),
      temperature: this.ia.temperature.precise,
    })

    const spanishVersion = {
      ...article,
      locale: 'es',
      title: spanishTranslation.title,
      catchline: spanishTranslation.catchline,
      description: spanishTranslation.description,
      content: spanishTranslation.content,
      updatedAt: formatDate(new Date().toISOString()),
    }
    this.project.typewriter().manager.articles.upsert(spanishVersion, 'drafts')
    ux.action.stop()

    this.ia.logUsage(this.ia.models.gpt4o(), usage)
    this.log(`✅ Translated ${articleSlug}`)
  }
}
