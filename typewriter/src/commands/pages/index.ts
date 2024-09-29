import {Command} from '@oclif/core'

export default class Pages extends Command {
  static args = {}

  static description = 'pages'

  async run(): Promise<void> {
    await this.parse(Pages)
  }
}
