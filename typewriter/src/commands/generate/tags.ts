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

    ux.action.start(`✨ Suggesting existing tags for ${articleSlug}`)

    const {article} = this.project.typewriter().drafts.content.articles.bySlug(articleSlug, 'fr')
    const {tags: existingTags} = this.project.typewriter().published.content.tags.all()
    const asString = existingTags.map((tag) => tag.slug).join(', ')

    const {object: suggestedExistingTags, usage} = await generateObject({
      model: this.ia.models.gpt4o(),

      system:
        'You are a professional SEO writer. You write simple, clear, concise and professional content. You are writing for top level CTOs or VPs of engineering.',
      prompt: `I will give you a list of tags, from that list you will select up to 10 most relevant tags for the blog article below. You can only suggest existing tags. The tags should be written as a slug, lowercase and no space.\nlist of existing tags: ${asString}\narticle:\ntitle: ${article.title}\n${article.content}`,
      schema: z.object({
        text: z.string(),
      }),
      output: 'array',
      temperature: 0.5,
    })

    ux.action.stop()
    this.ia.logUsage(this.ia.models.gpt4o(), usage)

    const selectedExistingTags = await checkbox({
      message: 'Select the tags you prefer',
      choices: this.prompt.stringSelectorChoices(suggestedExistingTags),
      pageSize: 8,
    })

    ux.action.start(`✨ Suggesting new tags for ${articleSlug}`)

    const {object: suggestedNewTags, usage: usage2} = await generateObject({
      model: this.ia.models.gpt4o(),

      system:
        'You are a professional SEO writer. You write simple, clear, concise and professional content. You are writing for top level CTOs or VPs of engineering.',
      prompt: `I will give you a list of tags. This is the list of tags i already have in my system. 
      You will list up to 20 most relevant tags for the blog article below that are not in the list of existing tags.
      There is different strategies of tags you can use:
      - narrow and very specific
      - generic, as a theme or family of concepts 
      - based on the tone of article, if it is a news, a tutorial or a vulgarized article
      The tags should be written as a slug:
      - in english
      - lowercase
      - spaces are replaced by "-".
      \nlist of existing tags: ${asString}\narticle:\ntitle: ${article.title}\n${article.content}`,
      schema: z.object({
        text: z.string(),
      }),
      output: 'array',
      temperature: 0.5,
    })

    ux.action.stop()
    this.ia.logUsage(this.ia.models.gpt4o(), usage2)

    const selectedNewTags = await checkbox({
      message: 'Select the tags you prefer',
      choices: this.prompt.stringSelectorChoices(suggestedNewTags),
      pageSize: 8,
    })

    const alphaOrderedTags = [...selectedExistingTags, ...selectedNewTags].sort((a, b) => a.localeCompare(b))

    const updatedArticle = {
      ...article,
      tags: alphaOrderedTags,
      updatedAt: formatDate(new Date().toISOString())!,
    }

    this.project.typewriter().manager.articles.upsert(updatedArticle, 'drafts')
    this.log(`✅ Tags added for ${articleSlug}`)

    this.log(`➕ Creating ${selectedNewTags.length} new tags`)

    for (const tag of selectedNewTags) {
      this.log(`➕ Creating tag ${tag}`)
      this.project.typewriter().manager.tags.upsert(
        {
          slug: tag,
          title: tag,
          locale: 'fr',
        },
        'drafts',
      )
    }
  }
}
