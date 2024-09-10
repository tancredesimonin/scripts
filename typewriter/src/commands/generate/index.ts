import {Args, Command} from '@oclif/core'

export default class Generate extends Command {
  static args = {
    catchline: Args.string({description: 'Generate a catchline for a given blog article', required: true}),
  }

  static description = 'Generate a catchline for a given blog article'

  async run(): Promise<void> {
    await this.parse(Generate)
  }
}
