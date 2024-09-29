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
  static override description = 'Translate all list pages'

  private async translatePage(frenchPage: ListPageBase, pageType: string) {
    const languages = [
      {code: 'en', name: 'English'},
      {code: 'pt', name: 'Portuguese - Brazil'},
      {code: 'es', name: 'Spanish'},
    ]

    for (const lang of languages) {
      ux.action.start(`✨ Translating ${pageType} page to ${lang.name}`)

      const {object: translation, usage} = await generateObject({
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
        case 'articlesList': {
          this.project.typewriter().manager.articlesList.upsert(translatedVersion, 'drafts')
          this.project.typewriter().manager.articlesList.publish(translatedVersion)

          break
        }

        case 'categoriesList': {
          this.project.typewriter().manager.categoriesList.upsert(translatedVersion, 'drafts')
          this.project.typewriter().manager.categoriesList.publish(translatedVersion)

          break
        }

        case 'tagsList': {
          this.project.typewriter().manager.tagsList.upsert(translatedVersion, 'drafts')
          this.project.typewriter().manager.tagsList.publish(translatedVersion)

          break
        }

        case 'seriesList': {
          this.project.typewriter().manager.seriesList.upsert(translatedVersion, 'drafts')
          this.project.typewriter().manager.seriesList.publish(translatedVersion)

          break
        }

        default: {
          throw new Error(`Unknown page type: ${pageType}`)
        }
      }

      ux.action.stop()
      this.ia.logUsage(this.ia.models.gpt4o(), usage)
    }
  }

  public async run(): Promise<void> {
    // Handle Articles List Page
    this.log('🧹 Removing all translations for Articles List')
    this.project.typewriter().manager.articlesList.delete({locale: 'en'}, 'published')
    this.project.typewriter().manager.articlesList.delete({locale: 'pt'}, 'published')
    this.project.typewriter().manager.articlesList.delete({locale: 'es'}, 'published')

    const {page: frenchArticlesPage} = this.project.typewriter().published.content.articles.base.page('fr')
    await this.translatePage(frenchArticlesPage, 'articlesList')

    // Handle Categories List Page
    this.log('🧹 Removing all translations for Categories List')
    this.project.typewriter().manager.categoriesList.delete({locale: 'en'}, 'published')
    this.project.typewriter().manager.categoriesList.delete({locale: 'pt'}, 'published')
    this.project.typewriter().manager.categoriesList.delete({locale: 'es'}, 'published')

    const {page: frenchCategoriesPage} = this.project.typewriter().published.content.categories.base.page('fr')
    await this.translatePage(frenchCategoriesPage, 'categoriesList')

    // Handle Tags List Page
    this.log('🧹 Removing all translations for Tags List')
    this.project.typewriter().manager.tagsList.delete({locale: 'en'}, 'published')
    this.project.typewriter().manager.tagsList.delete({locale: 'pt'}, 'published')
    this.project.typewriter().manager.tagsList.delete({locale: 'es'}, 'published')

    const {page: frenchTagsPage} = this.project.typewriter().published.content.tags.base.page('fr')
    await this.translatePage(frenchTagsPage, 'tagsList')

    // Handle Series List Page
    this.log('🧹 Removing all translations for Series List')
    this.project.typewriter().manager.seriesList.delete({locale: 'en'}, 'published')
    this.project.typewriter().manager.seriesList.delete({locale: 'pt'}, 'published')
    this.project.typewriter().manager.seriesList.delete({locale: 'es'}, 'published')

    const {page: frenchSeriesPage} = this.project.typewriter().published.content.series.base.page('fr')
    await this.translatePage(frenchSeriesPage, 'seriesList')
  }
}
