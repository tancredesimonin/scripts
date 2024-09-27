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
    const {articles} = this.project.typewriter().drafts.content.articles.all()

    const articleSlug = await select({
      message: 'Select the article to translate',
      choices: this.prompt.itemSelectorChoices(articles),
    })

    ux.action.start(`✨ Translating ${articleSlug}`)

    const {article} = this.project.typewriter().drafts.content.articles.bySlug(articleSlug, 'fr')

    const {object: translation, usage} = await generateObject({
      model: this.ia.models.gpt4o(),

      system:
        'You are a professional writer. You write simple, clear, concise and professional content. You are writing for top level CTOs or VPs of engineering.',
      prompt: `Translate the blog article below to English. Keep the same tone of voice as the article:\ntitle: ${article.title}\ncatchline: ${article.catchline}\ndescription: ${article.description}\ncontent:${article.content}`,
      schema: z.object({
        title: z.string(),
        catchline: z.string(),
        description: z.string(),
        content: z.string(),
      }),
      temperature: 0.5,
    })

    ux.action.stop()
    this.ia.logUsage(this.ia.models.gpt4o(), usage)

    const updatedArticle = {
      ...article,
      locale: 'en',
      title: translation.title,
      catchline: translation.catchline,
      description: translation.description,
      content: translation.content,
      updatedAt: formatDate(new Date().toISOString())!,
    }

    this.project.typewriter().manager.articles.upsert(updatedArticle, 'drafts')
    this.log(`✅ Translated ${articleSlug}`)
  }
}
