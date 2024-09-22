import {checkbox, select} from '@inquirer/prompts'
import {ux} from '@oclif/core'
import {generateObject} from 'ai'
import * as dotenv from 'dotenv'
import {formatDate} from 'typewriter-tools/shared'
import {z} from 'zod'

import BaseCommand from '../base.js'
dotenv.config()

export default class Tags extends BaseCommand {
  static override description = 'Generate tags for a given blog article'

  public async run(): Promise<void> {
    const {articles} = this.project.typewriter().drafts.content.articles.all()

    const articleSlug = await select({
      message: 'Select the article to generate tags',
      choices: this.prompt.itemSelectorChoices(articles),
    })

    ux.action.start(`✨ Generating 5 tags for ${articleSlug}`)

    const {article} = this.project.typewriter().drafts.content.articles.bySlug(articleSlug, 'fr')

    const {object: tags, usage} = await generateObject({
      model: this.ia.models.gpt4o(),

      system:
        'You are a professional SEO writer. You write simple, clear, concise and professional content. You are writing for top level CTOs or VPs of engineering.',
      prompt: `List the 8 most relevant tags for the blog article below. the tags should be written as a slug, lowercase and no space.\ntitle: ${article.title}\n${article.content}`,
      schema: z.object({
        text: z.string(),
      }),
      output: 'array',
      temperature: 0.5,
    })

    ux.action.stop()
    this.ia.logUsage(this.ia.models.gpt4o(), usage)

    const selectedTags = await checkbox({
      message: 'Select the tags you prefer',
      choices: this.prompt.stringSelectorChoices(tags),
      pageSize: 8,
    })

    const alphaOrderedTags = selectedTags.sort((a, b) => a.localeCompare(b))

    const updatedArticle = {
      ...article,
      tags: alphaOrderedTags,
      updatedAt: formatDate(new Date().toISOString())!,
    }

    this.project.typewriter().manager.articles.upsert(updatedArticle, 'drafts')
    this.log(`✅ Tags added for ${articleSlug}`)
  }
}
