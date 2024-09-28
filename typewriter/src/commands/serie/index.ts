import {Command} from '@oclif/core'

export default class Serie extends Command {
  static args = {}

  static description = 'Manage series'

  async run(): Promise<void> {
    await this.parse(Serie)
  }
}
