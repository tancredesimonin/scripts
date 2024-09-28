import {select} from '@inquirer/prompts'
import {ux} from '@oclif/core'
import * as dotenv from 'dotenv'

import BaseCommand from '../base.js'
dotenv.config()

export default class Publish extends BaseCommand {
  static override description = 'Publish a blog serie'

  public async run(): Promise<void> {
    const {series} = this.project.typewriter().drafts.content.series.allByLocale('fr')

    const serieSlug = await select({
      message: 'Select the serie to publish',
      choices: this.prompt.itemSelectorChoices(series),
    })

    ux.action.start(`✨ Publishing ${serieSlug}`)

    const {supportedLocales: expectedLocales} = this.project.typewriter().config
    const {supportedLocales} = this.project.typewriter().drafts.content.series.bySlug(serieSlug, 'fr')

    const missingLocales = expectedLocales.filter((locale) => !supportedLocales.includes(locale))
    if (missingLocales.length > 0) {
      throw new Error(`❌ Missing locales: ${missingLocales.join(', ')}`)
    }

    for (const locale of expectedLocales) {
      const {serie} = this.project.typewriter().drafts.content.series.bySlug(serieSlug, locale)
      this.project.typewriter().manager.series.publish(serie)
      this.log(`✅ ${serieSlug} published for ${locale}`)
    }

    ux.action.stop()
    this.log(`✅ ${serieSlug} published`)
  }
}
