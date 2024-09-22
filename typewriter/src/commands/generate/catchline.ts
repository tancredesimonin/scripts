import {select} from '@inquirer/prompts'
import {ux} from '@oclif/core'
import {generateObject} from 'ai'
import * as dotenv from 'dotenv'
import {formatDate} from 'typewriter-tools/shared'
import {z} from 'zod'

import BaseCommand from '../base.js'
dotenv.config()

export default class Catchline extends BaseCommand {
  static override description = 'Generate a catchline for a given blog article'

  public async run(): Promise<void> {
    const {articles} = this.project.typewriter().drafts.content.articles.all()

    const articleSlug = await select({
      message: 'Select the article to generate catchline',
      choices: this.prompt.itemSelectorChoices(articles),
    })

    ux.action.start(`✨ Generating 20 catchline for ${articleSlug}`)

    const {article} = this.project.typewriter().drafts.content.articles.bySlug(articleSlug, 'fr')

    const {object: catchlines, usage} = await generateObject({
      model: this.ia.models.gptMini(),
      system:
        'You are a professional writer. You write simple, clear, concise and fun content. A catchline is a short phrase that captures the essence of the article. It should be catchy and engaging. It must give a reason to read the article. It should be unique and memorable. It should be relevant to the article content. It should be concise and easy to understand. It should be written in a way that makes the reader want to know more. It does not necessaryly need to use the same words as the article title as it is displayed along with the title. It should be written in the same language as the article.',
      prompt: `Generate 20 catchlines for the blog article below:\ntitle: ${article.title}\n${article.content}`,
      schema: z.object({
        text: z.string(),
      }),
      output: 'array',
      temperature: 0.5,
    })

    ux.action.stop()
    this.ia.logUsage(this.ia.models.gptMini(), usage)

    const selectedCatchline = await select({
      message: 'Select the catchline you prefer',
      choices: this.prompt.stringSelectorChoices(catchlines),
      pageSize: 20,
    })

    const updatedArticle = {
      ...article,
      catchline: selectedCatchline,
      updatedAt: formatDate(new Date().toISOString())!,
    }

    this.project.typewriter().manager.articles.upsert(updatedArticle, 'drafts')
    this.log(`✅ Catchline updated for ${articleSlug}`)
  }
}
