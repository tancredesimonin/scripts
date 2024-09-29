/* eslint-disable no-await-in-loop */
import {ux} from '@oclif/core'
import {generateObject} from 'ai'
import * as dotenv from 'dotenv'
import {formatDate} from 'typewriter-tools/shared'
import {z} from 'zod'

import BaseCommand from '../base.js'
dotenv.config()

export default class Spellcheck extends BaseCommand {
  static override description = 'Spellcheck pages'

  public async run(): Promise<void> {
    ux.action.start(`✨ Spellchecking home page`)
    const {page: homePage} = this.project.typewriter().published.content.home.page('fr')
    this.project.typewriter().manager.home.unpublish(homePage)

    const {object: spellcheck} = await generateObject({
      model: this.ia.models.gpt4o(),

      system: this.ia.personas.author.description,
      prompt: `
      Spellcheck the page content below. (content from my blog)

      ${this.ia.prompts.spellcheck.rules}
      
      <page>
      title: ${homePage.title}
      catchline: ${homePage.catchline}
      description: ${homePage.description}
    
      content: ${homePage.content}
      </page>`,
      schema: z.object({
        title: z.string(),
        catchline: z.string(),
        description: z.string(),
        content: z.string(),
      }),
      temperature: this.ia.temperature.precise,
    })

    const updatedPage = {
      ...homePage,
      title: spellcheck.title,
      catchline: spellcheck.catchline,
      description: spellcheck.description,
      content: spellcheck.content,
      updatedAt: formatDate(new Date().toISOString())!,
    }

    this.project.typewriter().manager.home.upsert(updatedPage, 'drafts')
    ux.action.stop()
  }
}
