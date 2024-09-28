import {select} from '@inquirer/prompts'
import {ux} from '@oclif/core'
import {generateObject} from 'ai'
import * as dotenv from 'dotenv'
import {formatDate} from 'typewriter-tools/shared'
import {z} from 'zod'

import BaseCommand from '../base.js'
dotenv.config()

export default class Spellcheck extends BaseCommand {
  static override description = 'Spellcheck a given serie'

  public async run(): Promise<void> {
    const {supportedLocales} = this.project.typewriter().config
    const {series} = this.project.typewriter().drafts.content.series.allByLocale('fr')

    const serieSlug = await select({
      message: 'Select the serie to spellcheck',
      choices: this.prompt.itemSelectorChoices(series),
    })

    const locale = await select({
      message: 'Select the locale of the serie to spellcheck',
      choices: supportedLocales.map((locale) => ({text: locale, value: locale})),
    })

    ux.action.start(`✨ Spellchecking ${serieSlug}`)

    const {serie} = this.project.typewriter().drafts.content.series.bySlug(serieSlug, locale)

    const {object: spellcheck, usage} = await generateObject({
      model: this.ia.models.gpt4o(),

      system: this.ia.personas.author.description,
      prompt: `
      Spellcheck the serie content below. (the serie is used in the context of a blog)

      ${this.ia.prompts.spellcheck.rules}
      
      <serie>
      title: ${serie.title}
      catchline: ${serie.catchline}
      description: ${serie.description}
    
      content: ${serie.content}
      </serie>`,
      schema: z.object({
        title: z.string(),
        catchline: z.string(),
        description: z.string(),
        content: z.string(),
      }),
      temperature: this.ia.temperature.precise,
    })

    ux.action.stop()
    this.ia.logUsage(this.ia.models.gpt4o(), usage)

    const updatedSerie = {
      ...serie,
      title: spellcheck.title,
      catchline: spellcheck.catchline,
      description: spellcheck.description,
      content: spellcheck.content,
      updatedAt: formatDate(new Date().toISOString())!,
    }

    this.project.typewriter().manager.series.upsert(updatedSerie, 'drafts')
    this.log(`✅ Spellchecked ${serieSlug}`)
  }
}
