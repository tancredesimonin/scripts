/* eslint-disable camelcase */
import {Args, Command} from '@oclif/core'
import {existsSync, mkdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs'
import path from 'node:path'
import {z} from 'zod'

export default class Validate extends Command {
  static override args = {
    folder: Args.string({
      default: 'ghost_data',
      description: 'folder to read',
    }),
    file: Args.string({
      default: 'data.json',
      description: 'file to read',
    }),
  }

  static override description = 'validate the given ghost data file'

  public async run(): Promise<void> {
    const {args} = await this.parse(Validate)

    const {folder, file} = args

    const filePath = path.join(process.cwd(), folder, file)
    this.validateFileExists(filePath)

    const ghostDB = this.parseAndValidateFileContent(filePath)

    this.forceCreateCleanExportFolder()

    this.exportBlogPosts(ghostDB.posts)
  }

  /** =======================
   *  PRIVATE METHODS
   * ======================= */

  private validateFileExists(filePath: string): void {
    if (existsSync(filePath)) {
      this.log('✅ ghost data file found')
    } else {
      this.error(`❌ File ${filePath} not found`)
    }
  }

  private parseAndValidateFileContent(filePath: string): GhostDBData {
    const rawData = readFileSync(filePath, 'utf8')
    const raw = JSON.parse(rawData)

    const {data, error, success} = ghostDBSchema.safeParse(raw)

    if (!success && error) {
      this.error(`❌ Invalid ghost data file: ${error}`)
    }

    if (data.db.length !== 1) {
      this.error('❌ Invalid ghost data file: db array should have only one element')
    }

    this.log('✅ ghost data file is valid')

    return data.db[0].data
  }

  private exportBlogPosts(posts: GhostPost[]): void {
    this.log(`ℹ️  found posts total: ${posts.length}`)

    const publishedPages = posts.filter((post) => post.type === 'page' && post.status === 'published')
    const unpublishedPages = posts.filter((post) => post.type === 'page' && post.status !== 'published')
    const publishedPosts = posts.filter((post) => post.type === 'post' && post.status === 'published')
    const unpublishedPosts = posts.filter((post) => post.type === 'post' && post.status !== 'published')

    this.log(`ℹ️  found unpublished pages: ${unpublishedPages.length}`)
    this.log(`ℹ️  found published pages: ${publishedPages.length}`)
    this.log(`ℹ️  found unpublished posts: ${unpublishedPosts.length}`)
    this.log(`ℹ️  found published posts: ${publishedPosts.length}`)

    const listToExport = publishedPosts

    this.log(`ℹ️  exporting ${listToExport.length} published posts - ignoring pages and unpublished posts`)

    for (const post of listToExport) {
      this.writePostToMarkdown(post)
    }
  }

  private forceCreateCleanExportFolder(): void {
    const postsFolder = path.join(process.cwd(), 'export')

    if (existsSync(postsFolder)) {
      this.log(`📁 Folder ${postsFolder} already exists, deleting all its content`)
      rmSync(postsFolder, {recursive: true})
    }

    if (!existsSync(postsFolder)) {
      this.log(`📁 Creating folder ${postsFolder}`)
      mkdirSync(postsFolder)
    }
  }

  private writePostToMarkdown(post: GhostPost): void {
    const {title, slug, plaintext, created_at, updated_at, published_at} = post

    const postContent = `---
title: ${title}
catchline:
description:
updatedAt: ${updated_at}
publishedAt: ${published_at}
category:
tags:
---

${plaintext}
    `

    const formattedDate = created_at.split('T')[0]
    const locale = 'fr'

    const postsFolder = path.join(process.cwd(), 'export')
    const postFileName = `${formattedDate}-${slug}.${locale}.mdx`
    const postFilePath = path.join(postsFolder, postFileName)

    writeFileSync(postFilePath, postContent)

    this.log(`✅ exported post to ${postFilePath}`)
  }
}

const ghostDBSchema = z.object({
  db: z.array(
    z.object({
      data: z.object({
        posts: z.array(
          z.object({
            title: z.string(),
            slug: z.string(),
            plaintext: z.string(),
            status: z.string(),
            type: z.string(),
            created_at: z.string(),
            updated_at: z.string(),
            published_at: z.string().nullable(),
          }),
        ),
      }),
    }),
  ),
})

type GhostDBData = z.infer<typeof ghostDBSchema>['db'][0]['data']
type GhostPost = z.infer<typeof ghostDBSchema>['db'][0]['data']['posts'][0]
