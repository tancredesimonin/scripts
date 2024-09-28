import {select} from '@inquirer/prompts'
import {ux} from '@oclif/core'
import * as dotenv from 'dotenv'

import BaseCommand from '../base.js'
dotenv.config()

export default class Publish extends BaseCommand {
  static override description = 'Publish a blog article'

  public async run(): Promise<void> {
    const {articles} = this.project.typewriter().drafts.content.articles.allByLocale('fr')

    const articleSlug = await select({
      message: 'Select the article to publish',
      choices: this.prompt.itemSelectorChoices(articles),
    })

    ux.action.start(`✨ Publishing ${articleSlug}`)

    const {supportedLocales: expectedLocales} = this.project.typewriter().config
    const {article, supportedLocales} = this.project.typewriter().drafts.content.articles.bySlug(articleSlug, 'fr')

    const missingLocales = expectedLocales.filter((locale) => !supportedLocales.includes(locale))
    if (missingLocales.length > 0) {
      throw new Error(`❌ Missing locales: ${missingLocales.join(', ')}`)
    }

    this.log(`🔍 Checking category ${article.meta.category}`)
    this.project.typewriter().published.content.categories.bySlug(article.meta.category, 'fr')

    if (article.meta.serie) {
      this.log(`🔍 Checking serie ${article.meta.serie.slug}`)
      this.project.typewriter().published.content.series.bySlug(article.meta.serie.slug, 'fr')
    }

    for (const tagSlug of article.meta.tags) {
      this.log(`🔍 Checking tag ${tagSlug}`)
      // will throw if the tag is not found
      this.project.typewriter().published.content.tags.bySlug(tagSlug, 'fr')
    }

    for (const locale of expectedLocales) {
      const {article} = this.project.typewriter().drafts.content.articles.bySlug(articleSlug, locale)
      this.project.typewriter().manager.articles.publish(article)
      this.log(`✅ ${articleSlug} published for ${locale}`)
    }

    ux.action.stop()
    this.log(`✅ ${articleSlug} published`)
  }
}
