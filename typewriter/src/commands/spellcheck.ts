import {select} from '@inquirer/prompts'
import {generateText} from 'ai'
import * as dotenv from 'dotenv'
import {readFileSync, writeFileSync} from 'node:fs'

import BaseCommand from './base.js'

dotenv.config()

export default class Spellcheck extends BaseCommand {
  static override description = 'Spellcheck a file'

  public async run(): Promise<void> {
    const {draftsFolder} = this.project.getConfig()
    this.project.validateDraftsFolder()

    const file = await select({
      message: 'Select the file to spellcheck',
      choices: this.prompt.fileSelectorChoices(draftsFolder),
    })
    this.log(`📄 Spellchecking ${file}`)

    const filePath = draftsFolder + '/' + file
    const fileContent = readFileSync(filePath, 'utf8')

    const {text, usage} = await generateText({
      model: this.ia.models.gptMini(),
      system: 'You are a professional writer. You write simple, clear, and concise content.',
      prompt: `Correct the grammar and spellcheck errors in that blog article. You will not modify the meaning of any sentence and you will keep the markdown formatting as is. You will apply this grammar and spellcheck correction on the frontmatter but will not modify the formatting (content between ---)":\n${fileContent}`,
    })

    writeFileSync(filePath, text)

    this.log(`✅ Spellchecked ${file}`)
    this.ia.logUsage(usage)
  }
}
