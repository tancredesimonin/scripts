import {select} from '@inquirer/prompts'
import {ux} from '@oclif/core'
import {generateObject} from 'ai'
import * as dotenv from 'dotenv'
import {formatDate} from 'typewriter-tools/shared'
import {z} from 'zod'

import {supportedLocales} from '../../shared/personal-blog.typewriter.config.js'
import BaseCommand from '../base.js'
dotenv.config()

export default class Spellcheck extends BaseCommand {
  static override description = 'Spellcheck a given tag'

  public async run(): Promise<void> {
    const {tags} = this.project.typewriter().drafts.content.tags.allByLocale('fr')

    const tagSlug = await select({
      message: 'Select the tag to spellcheck',
      choices: this.prompt.itemSelectorChoices(tags),
    })

    const locale = await select({
      message: 'Select the locale of the tag to spellcheck',
      choices: supportedLocales.map((locale) => ({text: locale, value: locale})),
    })

    ux.action.start(`✨ Spellchecking ${tagSlug}`)

    const {tag} = this.project.typewriter().drafts.content.tags.bySlug(tagSlug, locale)

    const {object: spellcheck, usage} = await generateObject({
      model: this.ia.models.gpt4o(),

      system: this.ia.personas.author.description,
      prompt: `
      Spellcheck the tag content below. (the tag is used in the context of a blog)

      ${this.ia.prompts.spellcheck.rules}
      
      <tag>
      title: ${tag.title}
      catchline: ${tag.catchline}
      description: ${tag.description}
    
      content: ${tag.content}
      </tag>`,
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

    const updatedTag = {
      ...tag,
      title: spellcheck.title,
      catchline: spellcheck.catchline,
      description: spellcheck.description,
      content: spellcheck.content,
      updatedAt: formatDate(new Date().toISOString())!,
    }

    this.project.typewriter().manager.tags.upsert(updatedTag, 'drafts')
    this.log(`✅ Spellchecked ${tagSlug}`)
  }
}
