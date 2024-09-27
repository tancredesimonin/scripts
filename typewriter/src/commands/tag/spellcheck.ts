import {select} from '@inquirer/prompts'
import {ux} from '@oclif/core'
import {generateObject} from 'ai'
import * as dotenv from 'dotenv'
import {formatDate} from 'typewriter-tools/shared'
import {z} from 'zod'

import BaseCommand from '../base.js'
dotenv.config()

export default class Spellcheck extends BaseCommand {
  static override description = 'Spellcheck a given tag'

  public async run(): Promise<void> {
    const {tags} = this.project.typewriter().drafts.content.tags.all()

    const tagSlug = await select({
      message: 'Select the tag to spellcheck',
      choices: this.prompt.itemSelectorChoices(tags),
    })

    ux.action.start(`✨ Spellchecking ${tagSlug}`)

    const {tag} = this.project.typewriter().drafts.content.tags.bySlug(tagSlug, 'fr')

    const {object: spellcheck, usage} = await generateObject({
      model: this.ia.models.gpt4o(),

      system: this.ia.personas.author.description,
      prompt: `
      Spellcheck the tag content below. (the tag is used in the context of a blog)

      - You will correct grammar, spelling and punctuation mistakes.
      - You will not change the meaning of the text.
      - You will do that task in the same language as the text provided.
      - If the given text is between "" like "blabla" you will remove the extra " to return only the text inside.
      - if for any reason in one of the field there is a string "undefined" you will replace it by an empty string.
      - The content is markdown formatted. You will not change the markdown formatting.
      
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
