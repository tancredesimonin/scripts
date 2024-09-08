import {generateText} from 'ai'
import {select} from '@inquirer/prompts'
import {Command} from '@oclif/core'
import {existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync} from 'fs'
import {createOpenAI} from '@ai-sdk/openai'
import * as dotenv from 'dotenv'
dotenv.config()

export default class Spellcheck extends Command {
  static override description = 'Spellcheck a file'

  public async run(): Promise<void> {
    const projectFolder = '/Users/tancredo/code/blog/repository/content'
    const draftsFolder = projectFolder + '/drafts'

    this.validateDraftsFolder(draftsFolder)

    const file = await select({
      message: 'Select the file to spellcheck',
      choices: this.fileSelectorChoices(draftsFolder),
    })
    this.log(`📄 Spellchecking ${file}`)

    const filePath = draftsFolder + '/' + file
    const fileContent = readFileSync(filePath, 'utf8')
    this.log('open ai key', process.env.OPENAI_API_KEY)
    const openai = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      project: process.env.OPENAI_PROJECT,
    })
    const model = openai('gpt-4o-mini', {})
    const {text, usage} = await generateText({
      model,
      system: 'You are a professional writer. You write simple, clear, and concise content.',
      prompt: `Correct the grammar and spellcheck errors in that blog article. You will not modify the meaning of any sentence and you will keep the markdown formatting as is. You will not modify the frontmatter formatting (content between ---)":\n${fileContent}`,
    })
    writeFileSync(filePath, text)

    this.log(`✅ Spellchecked ${file}`)
    this.log(
      `✨ Spellchecked used ${usage.promptTokens} prompts tokens and ${usage.completionTokens} completion tokens`,
    )
    const cost = this.calculateCost(usage)
    this.log(`💸 Spellchecked cost ${cost}`)
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
    return drafts.map((draft) => {
      return {
        name: draft,
        value: draft,
        description: '',
      }
    })
  }

  private calculateCost(usage: {promptTokens: number; completionTokens: number}): number {
    const inputCost = 0.15 / 1_000_000
    const outputCost = 0.6 / 1_000_000

    return usage.promptTokens * inputCost + usage.completionTokens * outputCost
  }
}
