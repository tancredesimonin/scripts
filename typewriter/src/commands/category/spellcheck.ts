import {select} from '@inquirer/prompts'
import {ux} from '@oclif/core'
import {generateObject} from 'ai'
import * as dotenv from 'dotenv'
import {formatDate} from 'typewriter-tools/shared'
import {z} from 'zod'

import BaseCommand from '../base.js'
dotenv.config()

export default class Spellcheck extends BaseCommand {
  static override description = 'Spellcheck a given category'

  public async run(): Promise<void> {
    const {supportedLocales} = this.project.typewriter().config
    const {categories} = this.project.typewriter().drafts.content.categories.allByLocale('fr')

    const categorySlug = await select({
      message: 'Select the category to spellcheck',
      choices: this.prompt.itemSelectorChoices(categories),
    })

    const locale = await select({
      message: 'Select the locale of the category to spellcheck',
      choices: supportedLocales.map((locale) => ({text: locale, value: locale})),
    })

    ux.action.start(`✨ Spellchecking ${categorySlug}`)

    const {category} = this.project.typewriter().drafts.content.categories.bySlug(categorySlug, locale)

    const {object: spellcheck, usage} = await generateObject({
      model: this.ia.models.gpt4o(),

      system: this.ia.personas.author.description,
      prompt: `
      Spellcheck the category content below. (the category is used in the context of a blog)

      ${this.ia.prompts.spellcheck.rules}
      
      <category>
      title: ${category.title}
      catchline: ${category.catchline}
      description: ${category.description}
    
      content: ${category.content}
      </category>`,
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

    const updatedCategory = {
      ...category,
      title: spellcheck.title,
      catchline: spellcheck.catchline,
      description: spellcheck.description,
      content: spellcheck.content,
      updatedAt: formatDate(new Date().toISOString())!,
    }

    this.project.typewriter().manager.categories.upsert(updatedCategory, 'drafts')
    this.log(`✅ Spellchecked ${categorySlug}`)
  }
}
