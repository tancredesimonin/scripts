import {Command} from '@oclif/core'

export default class Tag extends Command {
  static args = {}

  static description = 'Manage tags'

  async run(): Promise<void> {
    await this.parse(Tag)
  }
}
