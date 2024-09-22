import {select} from '@inquirer/prompts'
import {ux} from '@oclif/core'
import {generateObject} from 'ai'
import * as dotenv from 'dotenv'
import {formatDate} from 'typewriter-tools/shared'
import {z} from 'zod'

import BaseCommand from '../base.js'
dotenv.config()

export default class Description extends BaseCommand {
  static override description = 'Generate a description for a given blog article'

  public async run(): Promise<void> {
    const {articles} = this.project.typewriter().drafts.content.articles.all()

    const articleSlug = await select({
      message: 'Select the article to generate description',
      choices: this.prompt.itemSelectorChoices(articles),
    })

    ux.action.start(`✨ Generating 3 descriptions for ${articleSlug}`)

    const {article} = this.project.typewriter().drafts.content.articles.bySlug(articleSlug, 'fr')

    const {object: descriptions, usage} = await generateObject({
      model: this.ia.models.gpt4o(),

      system:
        'You are a professional SEO writer. You write simple, clear, concise and professional content. You know how to write a good meta description. You are writing for top level CTOs or VPs of engineering.',
      prompt: `Generate 5 meta descriptions for the blog article below (in the same language as the article). You keep the same tone of voice as the article. You don't need to use the same words as the article title and catchline because they are displayed along with the description you are writing:\ntitle: ${article.title}\n${article.content}`,
      schema: z.object({
        text: z.string(),
      }),
      output: 'array',
      temperature: 0.5,
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
