/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-await-in-loop */
import {ux} from '@oclif/core'
import {generateObject} from 'ai'
import * as dotenv from 'dotenv'
import {formatDate, ListPageBase} from 'typewriter-tools/shared'
import {z} from 'zod'

import BaseCommand from '../base.js'
dotenv.config()

export default class Translate extends BaseCommand {
  static override description = 'Translate all pages'

  private async translatePage(frenchPage: ListPageBase, pageType: string) {
    const languages = [
      {code: 'en', name: 'English'},
      {code: 'pt', name: 'Portuguese - Brazil'},
      {code: 'es', name: 'Spanish'},
    ]

    for (const lang of languages) {
      ux.action.start(`✨ Translating ${pageType} page to ${lang.name}`)

      const {object: translation} = await generateObject({
        model: this.ia.models.gpt4o(),
        system: this.ia.personas.author.description,
        prompt: `
        Translate the page below to ${lang.name}. 
        Keep the same tone of voice as the page.
        
        title: ${frenchPage.title}
        catchline: ${frenchPage.catchline}
        description: ${frenchPage.description}
        content:${frenchPage.content}`,
        schema: z.object({
          title: z.string(),
          catchline: z.string(),
          description: z.string(),
          content: z.string(),
        }),
        temperature: this.ia.temperature.precise,
      })

      const translatedVersion = {
        ...frenchPage,
        locale: lang.code,
        title: translation.title,
        catchline: translation.catchline,
        description: translation.description,
        content: translation.content,
        updatedAt: formatDate(new Date().toISOString()),
      }

      switch (pageType) {
        case 'home': {
          this.project.typewriter().manager.home.upsert(translatedVersion, 'drafts')
          this.project.typewriter().manager.home.publish(translatedVersion)

          break
        }

        default: {
          throw new Error(`Unknown page type: ${pageType}`)
        }
      }

      ux.action.stop()
    }
  }

  public async run(): Promise<void> {
    this.log('🧹 Removing all translations for Home')
    this.project.typewriter().manager.home.delete({locale: 'en'}, 'published')
    this.project.typewriter().manager.home.delete({locale: 'pt'}, 'published')
    this.project.typewriter().manager.home.delete({locale: 'es'}, 'published')

    const {page: frenchHomePage} = this.project.typewriter().published.content.home.page('fr')
    await this.translatePage(frenchHomePage, 'home')
  }
}
