/* eslint-disable no-await-in-loop */
import {checkbox, search, select} from '@inquirer/prompts'
import {ux} from '@oclif/core'
import {generateObject} from 'ai'
import * as dotenv from 'dotenv'
import terminalLink from 'terminal-link'
import {formatDate, Color, IconName, Article} from 'typewriter-tools/shared'
import {z} from 'zod'

import BaseCommand from '../../base.js'
dotenv.config()

export default class Tags extends BaseCommand {
  static override description = 'Generate tags for a given blog article'

  public async run(): Promise<void> {
    const {articles} = this.project.typewriter().drafts.content.articles.allByLocale('fr')

    const articleSlug = await select({
      message: 'Select the article to generate tags',
      choices: this.prompt.itemSelectorChoices(articles),
    })

    ux.action.start(`✨ Suggesting existing tags for ${articleSlug}`)

    const {article} = this.project.typewriter().drafts.content.articles.bySlug(articleSlug, 'fr')
    const {tags: existingTags} = this.project.typewriter().published.content.tags.allByLocale('fr')
    const existingTagsListAsString = existingTags.map((tag) => tag.slug).join(', ')

    let selectedExistingTags: string[] = []
    if (existingTagsListAsString.length > 0) {
      const {object: suggestedExistingTags, usage} = await generateObject({
        model: this.ia.models.gpt4o(),

        system: this.ia.personas.author.description,
        prompt: `
      I will give you a list of tags. 
      From that list you will select up to 10 most relevant tags for the blog article below. 
      
      - You can only suggest existing tags.
      - The tags should be written as a slug: lowercase and no space
      
      <list of existing tags>
      ${existingTagsListAsString}
      </list of existing tags>

      <article>
      title: ${article.title}
      catchline: ${article.catchline}
      description: ${article.description}
      
      ${article.content}
      </article>`,
        schema: z.object({
          text: z.string(),
        }),
        output: 'array',
        temperature: this.ia.temperature.precise,
      })

      ux.action.stop()
      this.ia.logUsage(this.ia.models.gpt4o(), usage)

      selectedExistingTags = await checkbox({
        message: 'Select the tags you prefer',
        choices: this.prompt.stringSelectorChoices(suggestedExistingTags),
        pageSize: 8,
      })
    } else {
      this.log('🔍 No existing tags found.')
    }

    this.log(`🔖 Selected ${selectedExistingTags.length} existing tags. ${selectedExistingTags.join(', ')}`)

    ux.action.start(`✨ Suggesting new tags for ${articleSlug}`)

    const {object: suggestedNewTags} = await generateObject({
      model: this.ia.models.gpt4o(),

      system: this.ia.personas.author.description,
      prompt: `
      I will give you a list of tags. 
      It is the list of tags i already have in my system. 
      Tags, in the context of a blog, are used to describe the content of the article.
      They are a way for Search engines to classify article, as well as users to find articles on topics they are interested in.
      You will list up to 20 most relevant tags for the blog article below that are not in the list of existing tags.
      A tag is a word that is used to describe the content of the article.
      It should be a way to classify the article.
      It should be a way to go from a topic to another, related, but not deep into a tunnel by narrowing and narrowing classification. so it can also be more general and not technical like "tech-guide"      
      
      There is different strategies you can use to find good tags:
      - narrow and very specific like "react hooks"
      - generic, as a theme or family of concepts like "javascript"
      - based on the tone of article, if it is a news, a tutorial or a vulgarized article like "news" or "tutorial"
      - 
      Tags are often one word, sometimes two, but rarely more.
      
      The tags should be written as a slug:
      - in english
      - lowercase
      - spaces are replaced by "-".
      
      <list of existing tags>
      ${existingTagsListAsString}
      </list of existing tags>

      <article>
      title: ${article.title}
      catchline: ${article.catchline}
      description: ${article.description}
      category: ${article.meta.category}
      
      ${article.content}
      </article>`,
      schema: z.object({
        text: z.string(),
      }),
      output: 'array',
      temperature: this.ia.temperature.creative,
    })

    ux.action.stop()

    const selectedNewTags = await checkbox({
      message: 'Select the tags you prefer',
      choices: this.prompt.stringSelectorChoices(suggestedNewTags),
      pageSize: 8,
    })

    this.log(`🔖 Selected ${selectedNewTags.length} new tags. ${selectedNewTags.join(', ')}`)

    const alphaOrderedTags = [...selectedExistingTags, ...selectedNewTags].sort((a, b) => a.localeCompare(b))

    const updatedArticle: Article = {
      ...article,
      meta: {
        ...article.meta,
        tags: alphaOrderedTags,
      },
      updatedAt: formatDate(new Date().toISOString())!,
    }

    this.project.typewriter().manager.articles.upsert(updatedArticle, 'drafts')
    this.log(`✅ Tags added for ${articleSlug}`)

    this.log(`➕ Creating ${selectedNewTags.length} new tags`)

    for (const tag of selectedNewTags) {
      this.log(`➕ Creating tag ${tag}`)

      this.log(
        terminalLink('https://tailwindcss.com/docs/customizing-colors', '🔎 TailwindCSS documentation for colors'),
      )

      const color = await select<Color>({
        message: 'Select the color of the tag',
        choices: this.project.typewriter().manager.options.colors.map((color) => ({
          text: color,
          value: color,
        })),
      })

      this.log(terminalLink('https://lucide.dev/icons/?focus', '🔎 Lucid icons website for documentation'))

      const icon = await search<IconName>({
        message: 'Select the icon of the tag. ',
        source: async (input) => {
          if (!input) {
            return []
          }

          const allIcons = this.project.typewriter().manager.options.icons

          const filteredIcons = allIcons.filter((icon) => icon.startsWith(input))

          return filteredIcons.map((icon) => ({
            name: icon,
            value: icon,
            description: icon,
          }))
        },
      })

      ux.action.start(`✨ Generating titles for ${tag}`)

      const {object: generatedTitles} = await generateObject({
        model: this.ia.models.gpt4o(),
        system: this.ia.personas.author.description,
        prompt: `
      I will give you a tag.
      
      The tag is a word that is used to describe the content of the article.
      It is a way for Search engines to classify article, as well as users to find articles on topics they are interested in.

      I will give you a template or example of what you should write for the page title for the content of my blog classified with the tag.

      Based on that template you will suggest me 5 variants of that title.

      You will write in french. You may translate the tag itself from english to french when it makes sense.
      As in the template, it should be generic and very simple.

      <tag>
      tag: ${tag}
      </tag>
      
      <suggestion>
      Tout ce que je partage sur ${tag}
      </suggestion>

      example:
      given tag: backend
      => Tout ce que je partage sur le backend
      `,
        schema: z.object({
          text: z.string(),
        }),
        output: 'array',
        temperature: this.ia.temperature.precise,
      })

      ux.action.stop()

      const selectedTitle = await select<string>({
        message: 'Select the title you prefer',
        choices: this.prompt.stringSelectorChoices(generatedTitles),
      })

      ux.action.start(`✨ Generating catchlines for ${tag}`)

      const {object: generatedCatchlines} = await generateObject({
        model: this.ia.models.gpt4o(),
        system: this.ia.personas.author.description,
        prompt: `
      I will give you a tag.
      
      The tag is a word that is used to describe the content of the article.
      It is a way for Search engines to classify article, as well as users to find articles on topics they are interested in.

      I will give you a template or example of what you should write for the catchline for the content of my blog classified with the tag.

      Based on that template you will suggest me 10 variants of that catchline.

      You will write in french. You may translate the tag itself from english to french when it makes sense.
      As in the template, it should be generic and very simple.
      
      <tag>
      tag: ${tag}
      </tag>
      
      <suggestion>
      Découvrez tout ce que j’ai écrit sur ${tag}
      </suggestion>

      example:
      given tag: backend
      => Découvrez tout ce que j’ai écrit sur le backend
      `,
        schema: z.object({
          text: z.string(),
        }),
        output: 'array',
        temperature: this.ia.temperature.creative,
      })

      ux.action.stop()

      const selectedCatchline = await select<string>({
        message: 'Select the catchline you prefer',
        choices: this.prompt.stringSelectorChoices(generatedCatchlines),
      })

      ux.action.start(`✨ Generating catchlines for ${tag}`)

      const {object: generatedDescriptions} = await generateObject({
        model: this.ia.models.gpt4o(),
        system: this.ia.personas.author.description,
        prompt: `
      I will give you a tag.
      
      The tag is a word that is used to describe the content of the article.
      It is a way for Search engines to classify article, as well as users to find articles on topics they are interested in.

      I will give you a template or example of what you should write for the description for the content of my blog classified with the tag.

      Based on that template you will suggest me 10 variants of that description.

      You will write in french. You may translate the tag itself from english to french when it makes sense.
      As in the template, it should be generic and very simple.

      <tag>
      tag: ${tag}
      </tag>
      
      <suggestion>
      Tous les articles et contenus en rapport avec ${tag}
      </suggestion>

      example:
      given tag: backend
      => Tous les articles et contenus en rapport avec le backend
      `,
        schema: z.object({
          text: z.string(),
        }),
        output: 'array',
        temperature: this.ia.temperature.creative,
      })

      ux.action.stop()

      const selectedDescription = await select<string>({
        message: 'Select the description you prefer',
        choices: this.prompt.stringSelectorChoices(generatedDescriptions),
      })

      this.project.typewriter().manager.tags.upsert(
        {
          slug: tag,
          title: selectedTitle,
          color,
          icon,
          catchline: selectedCatchline,
          description: selectedDescription,
          locale: 'fr',
        },
        'drafts',
      )
    }
  }
}
