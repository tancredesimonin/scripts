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
    const {supportedLocales} = this.project.typewriter().drafts.content.articles.bySlug(articleSlug, 'fr')

    const missingLocales = expectedLocales.filter((locale) => !supportedLocales.includes(locale))
    if (missingLocales.length > 0) {
      throw new Error(`❌ Missing locales: ${missingLocales.join(', ')}`)
    }

    for (const locale of expectedLocales) {
      const {article} = this.project.typewriter().drafts.content.articles.bySlug(articleSlug, locale)
      this.project.typewriter().manager.articles.publish(article)
      this.log(`✅ ${articleSlug} published for ${locale}`)
    }

    // TODO validate if the tags, category and serie are published

    ux.action.stop()
    this.log(`✅ ${articleSlug} published`)
  }
}
