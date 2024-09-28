import {Command} from '@oclif/core'

export default class Category extends Command {
  static args = {}

  static description = 'Manage categories'

  async run(): Promise<void> {
    await this.parse(Category)
  }
}
