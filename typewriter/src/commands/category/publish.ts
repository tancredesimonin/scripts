import {select} from '@inquirer/prompts'
import {ux} from '@oclif/core'
import * as dotenv from 'dotenv'

import BaseCommand from '../base.js'
dotenv.config()

export default class Publish extends BaseCommand {
  static override description = 'Publish a blog category'

  public async run(): Promise<void> {
    const {categories} = this.project.typewriter().drafts.content.categories.allByLocale('fr')

    const categorySlug = await select({
      message: 'Select the category to publish',
      choices: this.prompt.itemSelectorChoices(categories),
    })

    ux.action.start(`✨ Publishing ${categorySlug}`)

    const {supportedLocales: expectedLocales} = this.project.typewriter().config
    const {supportedLocales} = this.project.typewriter().drafts.content.categories.bySlug(categorySlug, 'fr')

    const missingLocales = expectedLocales.filter((locale) => !supportedLocales.includes(locale))
    if (missingLocales.length > 0) {
      throw new Error(`❌ Missing locales: ${missingLocales.join(', ')}`)
    }

    for (const locale of expectedLocales) {
      const {category} = this.project.typewriter().drafts.content.categories.bySlug(categorySlug, locale)
      this.project.typewriter().manager.categories.publish(category)
      this.log(`✅ ${categorySlug} published for ${locale}`)
    }

    ux.action.stop()
    this.log(`✅ ${categorySlug} published`)
  }
}
