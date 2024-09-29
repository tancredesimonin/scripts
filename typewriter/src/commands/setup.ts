import * as dotenv from 'dotenv'

import BaseCommand from './base.js'
dotenv.config()

export default class Setup extends BaseCommand {
  static override description = 'Setup the typewriter project'

  public async run(): Promise<void> {
    this.log('⚙️ Setting up typewriter with articles, categories, tags and series')

    this.project.typewriter().manager.setup()
    this.project.typewriter().manager.forceFileCreation()

    this.log('✅ Typewriter setup')
  }
}
