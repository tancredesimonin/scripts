import {select} from '@inquirer/prompts'
import {ux} from '@oclif/core'
import * as dotenv from 'dotenv'

import BaseCommand from '../base.js'
dotenv.config()

export default class Publish extends BaseCommand {
  static override description = 'Publish a blog tag'

  public async run(): Promise<void> {
    const {tags} = this.project.typewriter().drafts.content.tags.allByLocale('fr')

    const tagSlug = await select({
      message: 'Select the article to publish',
      choices: this.prompt.itemSelectorChoices(tags),
    })

    ux.action.start(`✨ Publishing ${tagSlug}`)

    const {supportedLocales: expectedLocales} = this.project.typewriter().config
    const {supportedLocales} = this.project.typewriter().drafts.content.tags.bySlug(tagSlug, 'fr')

    const missingLocales = expectedLocales.filter((locale) => !supportedLocales.includes(locale))
    if (missingLocales.length > 0) {
      throw new Error(`❌ Missing locales: ${missingLocales.join(', ')}`)
    }

    for (const locale of expectedLocales) {
      const {tag} = this.project.typewriter().drafts.content.tags.bySlug(tagSlug, locale)
      this.project.typewriter().manager.tags.publish(tag)
      this.log(`✅ ${tagSlug} published for ${locale}`)
    }

    ux.action.stop()
    this.log(`✅ ${tagSlug} published`)
  }
}
