import {Command} from '@oclif/core'

export default class List extends Command {
  static args = {}

  static description = 'List pages'

  async run(): Promise<void> {
    await this.parse(List)
  }
}
