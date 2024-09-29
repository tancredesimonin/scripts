/* eslint-disable no-await-in-loop */
import {ux} from '@oclif/core'
import {generateObject} from 'ai'
import * as dotenv from 'dotenv'
import {formatDate} from 'typewriter-tools/shared'
import {z} from 'zod'

import BaseCommand from '../base.js'
dotenv.config()

export default class Spellcheck extends BaseCommand {
  static override description = 'Spellcheck list pages'

  public async run(): Promise<void> {
    /**
     * ARTICLES LIST PAGE
     */

    ux.action.start(`✨ Spellchecking articles list page`)
    const {page: articlesListPage} = this.project.typewriter().published.content.articles.base.page('fr')

    this.project.typewriter().manager.articlesList.unpublish(articlesListPage)

    const {object: spellcheck} = await generateObject({
      model: this.ia.models.gpt4o(),

      system: this.ia.personas.author.description,
      prompt: `
      Spellcheck the page content below. (content from my blog)

      ${this.ia.prompts.spellcheck.rules}
      
      <page>
      title: ${articlesListPage.title}
      catchline: ${articlesListPage.catchline}
      description: ${articlesListPage.description}
    
      content: ${articlesListPage.content}
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
      ...articlesListPage,
      title: spellcheck.title,
      catchline: spellcheck.catchline,
      description: spellcheck.description,
      content: spellcheck.content,
      updatedAt: formatDate(new Date().toISOString())!,
    }

    this.project.typewriter().manager.articlesList.upsert(updatedPage, 'drafts')
    ux.action.stop()

    /**
     * SERIES LIST PAGE
     */

    ux.action.start(`✨ Spellchecking series list page`)
    const {page: seriesListPage} = this.project.typewriter().published.content.series.base.page('fr')

    this.project.typewriter().manager.seriesList.unpublish(seriesListPage)

    const {object: spellcheckSeries} = await generateObject({
      model: this.ia.models.gpt4o(),

      system: this.ia.personas.author.description,
      prompt: `
      Spellcheck the page content below. (content from my blog)

      ${this.ia.prompts.spellcheck.rules}
      
      <page>
      title: ${seriesListPage.title}
      catchline: ${seriesListPage.catchline}
      description: ${seriesListPage.description}
    
      content: ${seriesListPage.content}
      </page>`,
      schema: z.object({
        title: z.string(),
        catchline: z.string(),
        description: z.string(),
        content: z.string(),
      }),
      temperature: this.ia.temperature.precise,
    })

    const updatedSeriesPage = {
      ...seriesListPage,
      title: spellcheckSeries.title,
      catchline: spellcheckSeries.catchline,
      description: spellcheckSeries.description,
      content: spellcheckSeries.content,
      updatedAt: formatDate(new Date().toISOString())!,
    }

    this.project.typewriter().manager.seriesList.upsert(updatedSeriesPage, 'drafts')
    ux.action.stop()

    /**
     * TAGS LIST PAGE
     */
    ux.action.start(`✨ Spellchecking tags list page`)
    const {page: tagsListPage} = this.project.typewriter().published.content.tags.base.page('fr')

    this.project.typewriter().manager.tagsList.unpublish(tagsListPage)

    const {object: spellcheckTags} = await generateObject({
      model: this.ia.models.gpt4o(),

      system: this.ia.personas.author.description,
      prompt: `
      Spellcheck the page content below. (content from my blog)

      ${this.ia.prompts.spellcheck.rules}
      
      <page>
      title: ${tagsListPage.title}
      catchline: ${tagsListPage.catchline}
      description: ${tagsListPage.description}
    
      content: ${tagsListPage.content}
      </page>`,
      schema: z.object({
        title: z.string(),
        catchline: z.string(),
        description: z.string(),
        content: z.string(),
      }),
      temperature: this.ia.temperature.precise,
    })

    const updatedTagsPage = {
      ...tagsListPage,
      title: spellcheckTags.title,
      catchline: spellcheckTags.catchline,
      description: spellcheckTags.description,
      content: spellcheckTags.content,
      updatedAt: formatDate(new Date().toISOString())!,
    }

    this.project.typewriter().manager.tagsList.upsert(updatedTagsPage, 'drafts')
    ux.action.stop()

    /**
     * CATEGORIES  LIST PAGE
     */
    ux.action.start(`✨ Spellchecking categories list page`)
    const {page: categoriesListPage} = this.project.typewriter().published.content.categories.base.page('fr')

    this.project.typewriter().manager.categoriesList.unpublish(categoriesListPage)

    const {object: spellcheckCategories} = await generateObject({
      model: this.ia.models.gpt4o(),

      system: this.ia.personas.author.description,
      prompt: `
      Spellcheck the page content below. (content from my blog)

      ${this.ia.prompts.spellcheck.rules}
      
      <page>
      title: ${categoriesListPage.title}
      catchline: ${categoriesListPage.catchline}
      description: ${categoriesListPage.description}
    
      content: ${categoriesListPage.content}
      </page>`,
      schema: z.object({
        title: z.string(),
        catchline: z.string(),
        description: z.string(),
        content: z.string(),
      }),
      temperature: this.ia.temperature.precise,
    })

    const updatedCategoriesPage = {
      ...categoriesListPage,
      title: spellcheckCategories.title,
      catchline: spellcheckCategories.catchline,
      description: spellcheckCategories.description,
      content: spellcheckCategories.content,
      updatedAt: formatDate(new Date().toISOString())!,
    }

    this.project.typewriter().manager.categoriesList.upsert(updatedCategoriesPage, 'drafts')
    ux.action.stop()
  }
}
