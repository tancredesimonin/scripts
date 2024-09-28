import {select} from '@inquirer/prompts'
import {ux} from '@oclif/core'
import {generateObject} from 'ai'
import * as dotenv from 'dotenv'
import {formatDate} from 'typewriter-tools/shared'
import {z} from 'zod'

import {supportedLocales} from '../../shared/personal-blog.typewriter.config.js'
import BaseCommand from '../base.js'
dotenv.config()

export default class Spellcheck extends BaseCommand {
  static override description = 'Spellcheck a given blog article'

  public async run(): Promise<void> {
    const {articles} = this.project.typewriter().drafts.content.articles.allByLocale('fr')

    const articleSlug = await select({
      message: 'Select the article to spellcheck',
      choices: this.prompt.itemSelectorChoices(articles),
    })

    const locale = await select({
      message: 'Select the locale of the article to spellcheck',
      choices: supportedLocales.map((locale) => ({text: locale, value: locale})),
    })

    ux.action.start(`✨ Spellchecking ${articleSlug} in ${locale}`)

    const {article} = this.project.typewriter().drafts.content.articles.bySlug(articleSlug, locale)

    const {object: spellcheck, usage} = await generateObject({
      model: this.ia.models.gpt4o(),

      system: this.ia.personas.author.description,
      prompt: `
      Spellcheck the blog article content below.

      ${this.ia.prompts.spellcheck.rules}
      
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
    this.log(`✅ Spellchecked ${articleSlug} in ${locale}`)
  }
}
