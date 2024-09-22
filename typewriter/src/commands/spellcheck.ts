import {select} from '@inquirer/prompts'
import {ux} from '@oclif/core'
import {generateObject} from 'ai'
import * as dotenv from 'dotenv'
import {formatDate} from 'typewriter-tools/shared'
import {z} from 'zod'

import BaseCommand from './base.js'
dotenv.config()

export default class Spellcheck extends BaseCommand {
  static override description = 'Spellcheck a given blog article'

  public async run(): Promise<void> {
    const {articles} = this.project.typewriter().drafts.content.articles.all()

    const articleSlug = await select({
      message: 'Select the article to spellcheck',
      choices: this.prompt.itemSelectorChoices(articles),
    })

    ux.action.start(`✨ Spellchecking ${articleSlug}`)

    const {article} = this.project.typewriter().drafts.content.articles.bySlug(articleSlug, 'fr')

    const {object: spellcheck, usage} = await generateObject({
      model: this.ia.models.gpt4o(),

      system:
        'You are a professional writer. You write simple, clear, concise and professional content. You are writing for top level CTOs or VPs of engineering.',
      prompt: `Spellcheck the blog article below:\ntitle: ${article.title}\ncatchline: ${article.catchline}\ndescription: ${article.description}\ncontent:${article.content}`,
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
      title: spellcheck.title,
      catchline: spellcheck.catchline,
      description: spellcheck.description,
      content: spellcheck.content,
      updatedAt: formatDate(new Date().toISOString())!,
    }

    this.project.typewriter().manager.articles.upsert(updatedArticle, 'drafts')
    this.log(`✅ Spellchecked ${articleSlug}`)
  }
}
