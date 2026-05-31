import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Page } from '../entities/page.entity'
import { PageSchema } from '../entities/page-schema.entity'

// 简单的内存缓存，生产环境替换为 Redis
const cache = new Map<string, { data: any; expireAt: number }>()
const CACHE_TTL = 60_000 // 1 分钟

@Injectable()
export class PageRendererService {
  constructor(
    @InjectRepository(Page) private pageRepo: Repository<Page>,
    @InjectRepository(PageSchema) private schemaRepo: Repository<PageSchema>,
  ) {}

  /**
   * 根据应用ID和页面路径获取已发布的页面 schema
   * 这是运行态的核心入口，只读取已发布数据，不做任何写操作
   */
  async getPublishedPageByPath(applicationId: string, pagePath: string): Promise<{
    page: Page
    schema: Record<string, any>
  }> {
    const cacheKey = `page:${applicationId}:${pagePath}`
    const cached = cache.get(cacheKey)
    if (cached && cached.expireAt > Date.now()) {
      return cached.data
    }

    const page = await this.pageRepo.findOne({
      where: { applicationId, path: `/${pagePath}`, status: 'published' },
    })
    if (!page) {
      throw new NotFoundException('Page not found or not published')
    }

    const schemaRecord = await this.schemaRepo.findOne({
      where: { pageId: page.id, isPublished: true },
      order: { version: 'DESC' },
    })
    if (!schemaRecord) {
      throw new NotFoundException('No published schema for this page')
    }

    const result = { page, schema: schemaRecord.schema }
    cache.set(cacheKey, { data: result, expireAt: Date.now() + CACHE_TTL })
    return result
  }

  /**
   * 获取已发布页面的静态 HTML（用于 SSR 或预渲染）
   */
  async renderPageHtml(applicationId: string, pagePath: string): Promise<string> {
    const { page, schema } = await this.getPublishedPageByPath(applicationId, pagePath)

    const componentsJson = JSON.stringify(schema.components ?? [])

    // 返回一个自带渲染能力的 HTML 页面
    // 生产环境可扩展为真正的 SSR（如 Vue SSR）
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${page.name}</title>
  <style>body{font-family:'Helvetica Neue',Helvetica,'PingFang SC','Microsoft YaHei',Arial,sans-serif;margin:0;padding:16px;background:#f5f5f5}</style>
</head>
<body>
  <div id="app" data-page-schema='${this.escapeHtml(componentsJson)}'>
    <div style="max-width:1200px;margin:0 auto">Loading...</div>
  </div>
  <script>
    // 客户端渲染：读取 schema 并动态渲染组件
    // 生产环境应加载完整的运行时 JS bundle
    window.__PAGE_SCHEMA__ = JSON.parse(document.getElementById('app').dataset.pageSchema || '[]');
    console.log('Page schema loaded:', window.__PAGE_SCHEMA__);
  </script>
</body>
</html>`
  }

  private escapeHtml(str: string): string {
    return str.replace(/'/g, "\\'").replace(/"/g, '&quot;')
  }
}
