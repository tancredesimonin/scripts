import {select} from '@inquirer/prompts'
import {ux} from '@oclif/core'
import {generateObject} from 'ai'
import * as dotenv from 'dotenv'
import {formatDate} from 'typewriter-tools/shared'
import {z} from 'zod'

import BaseCommand from '../base.js'
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

      system: this.ia.personas.author.description,
      prompt: `
      Spellcheck the blog article content below.

      - You will correct grammar, spelling and punctuation mistakes.
      - You will not change the meaning of the text.
      - You will do that task in the same language as the text provided.
      - If the given text is between "" like "blabla" you will remove the extra " to return only the text inside.
      - if for any reason in one of the field there is a string "undefined" you will replace it by an empty string.
      - The content is markdown formatted. You will not change the markdown formatting.
      
      <article>
      title: ${article.title}
      catchline: ${article.catchline}
      description: ${article.description}
      
      content: ${article.content}
      </article>`,
      schema: z.object({
        title: z.string(),
        catchline: z.string(),
        description: z.string(),
        content: z.string(),
      }),
      temperature: this.ia.temperature.precise,
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
