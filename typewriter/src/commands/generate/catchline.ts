import {select} from '@inquirer/prompts'
import {generateObject} from 'ai'
import * as dotenv from 'dotenv'
import {readFileSync} from 'node:fs'
import {z} from 'zod'

import BaseCommand from '../base.js'
dotenv.config()

export default class Catchline extends BaseCommand {
  static override description = 'Generate a catchline for a given blog article'

  public async run(): Promise<void> {
    const {draftsFolder} = this.project.getConfig()
    this.project.validateDraftsFolder()

    const file = await select({
      message: 'Select the file to generate catchline',
      choices: this.prompt.fileSelectorChoices(draftsFolder),
    })
    this.log(`✨ Generating catchline for ${file}`)

    const filePath = draftsFolder + '/' + file
    const fileContent = readFileSync(filePath, 'utf8')

    const {object, usage} = await generateObject({
      model: this.ia.models.gptMini(),
      system:
        'You are a professional writer. You write simple, clear, concise and fun content. A catchline is a short phrase that captures the essence of the article. It should be catchy and engaging. It must give a reason to read the article. It should be unique and memorable. It should be relevant to the article content. It should be concise and easy to understand. It should be written in a way that makes the reader want to know more. It does not necessaryly need to use the same words as the article title as it is displayed along with the title. It should be written in the same language as the article.',
      prompt: `Generate 20 catchlines for the blog article below:\n${fileContent}`,
      schema: z.object({
        catchline: z.string(),
      }),
      output: 'array',
      temperature: 0.5,
    })
    this.ia.logUsage(usage)
    this.log(`🔥 Catchlines:`)
    for (const item of object) {
      this.log(`- ${item.catchline}`)
    }
  }
}
