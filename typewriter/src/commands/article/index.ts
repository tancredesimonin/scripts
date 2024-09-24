import {Command} from '@oclif/core'

export default class Article extends Command {
  static args = {}

  static description = 'Manage articles'

  async run(): Promise<void> {
    await this.parse(Article)
  }
}
