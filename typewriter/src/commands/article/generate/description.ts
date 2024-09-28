import {select} from '@inquirer/prompts'
import {ux} from '@oclif/core'
import {generateObject} from 'ai'
import * as dotenv from 'dotenv'
import {formatDate} from 'typewriter-tools/shared'
import {z} from 'zod'

import BaseCommand from '../../base.js'
dotenv.config()

export default class Description extends BaseCommand {
  static override description = 'Generate a description for a given blog article'

  public async run(): Promise<void> {
    const {articles} = this.project.typewriter().drafts.content.articles.allByLocale('fr')

    const articleSlug = await select({
      message: 'Select the article to generate description',
      choices: this.prompt.itemSelectorChoices(articles),
    })

    ux.action.start(`✨ Generating 10 descriptions for ${articleSlug}`)

    const {article} = this.project.typewriter().drafts.content.articles.bySlug(articleSlug, 'fr')

    const {object: descriptions, usage} = await generateObject({
      model: this.ia.models.gpt4o(),

      system: this.ia.personas.author.description,
      prompt: `
      In SEO, a meta description is a short description of the page that is displayed in the search results. 
      It is used to attract the attention of the user to the article.
      It should be concise and easy to understand.
      It should be written in the same language as the article.
      
      generate 10 meta descriptions for the blog article below. 
      
      - You will keep the same tone of voice as the article. 
      - You don't need to repeat what the title says because it will always be displayed along.
      
      <article>
      title: ${article.title}
      ${article.content}
      </article>`,
      schema: z.object({
        text: z.string(),
      }),
      output: 'array',
      temperature: this.ia.temperature.creative,
    })

    ux.action.stop()
    this.ia.logUsage(this.ia.models.gpt4o(), usage)

    const selectedDescription = await select({
      message: 'Select the description you prefer',
      choices: this.prompt.stringSelectorChoices(descriptions),
      pageSize: 5,
    })

    const updatedArticle = {
      ...article,
      description: selectedDescription,
      updatedAt: formatDate(new Date().toISOString())!,
    }

    this.project.typewriter().manager.articles.upsert(updatedArticle, 'drafts')
    this.log(`✅ Description updated for ${articleSlug}`)
  }
}
