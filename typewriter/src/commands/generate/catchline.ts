import {createOpenAI} from '@ai-sdk/openai'
import {select} from '@inquirer/prompts'
import {Command} from '@oclif/core'
import {generateObject} from 'ai'
import * as dotenv from 'dotenv'
import {existsSync, mkdirSync, readdirSync, readFileSync} from 'node:fs'
import {z} from 'zod'
dotenv.config()

export default class Catchline extends Command {
  static override description = 'Generate a catchline for a given blog article'

  public async run(): Promise<void> {
    this.log('Generate catchline')
    const projectFolder = '/Users/tancredo/code/blog/repository/content'
    const draftsFolder = projectFolder + '/drafts'
    this.validateDraftsFolder(draftsFolder)
    const file = await select({
      message: 'Select the file to generate catchline',
      choices: this.fileSelectorChoices(draftsFolder),
    })
    this.log(`✨ Generating catchline for ${file}`)
    const filePath = draftsFolder + '/' + file
    const fileContent = readFileSync(filePath, 'utf8')
    const openai = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      project: process.env.OPENAI_PROJECT,
    })
    const model = openai('gpt-4o-mini', {})
    const {object, usage} = await generateObject({
      model,
      system:
        'You are a professional writer. You write simple, clear, concise and fun content. A catchline is a short phrase that captures the essence of the article. It should be catchy and engaging. It must give a reason to read the article. It should be unique and memorable. It should be relevant to the article content. It should be concise and easy to understand. It should be written in a way that makes the reader want to know more. It does not necessaryly need to use the same words as the article title as it is displayed along with the title. It should be written in the same language as the article.',
      prompt: `Generate 20 catchlines for the blog article below:\n${fileContent}`,
      schema: z.object({
        catchline: z.string(),
      }),
      output: 'array',
      temperature: 0.5,
    })
    this.log(`✨ operation used ${usage.promptTokens} prompts tokens and ${usage.completionTokens} completion tokens`)
    const cost = this.calculateCost(usage)
    this.log(`💸 operation cost ${cost}$`)
    this.log(`🔥 Catchlines:`)
    for (const item of object) {
      this.log(`- ${item.catchline}`)
    }
  }

  private validateDraftsFolder(draftsFolder: string) {
    this.log(`📁 Found existing drafts folder ${draftsFolder}`)
    if (!existsSync(draftsFolder)) {
      this.log(`📁 Creating drafts folder ${draftsFolder}`)
      mkdirSync(draftsFolder)
    }
  }

  private fileSelectorChoices(folder: string): {name: string; value: string; description: string}[] {
    const drafts = readdirSync(folder)
    return drafts.map((draft) => ({
      name: draft,
      value: draft,
      description: '',
    }))
  }

  private calculateCost(usage: {promptTokens: number; completionTokens: number}): number {
    const inputCost = 0.15 / 1_000_000
    const outputCost = 0.6 / 1_000_000

    return usage.promptTokens * inputCost + usage.completionTokens * outputCost
  }
}
