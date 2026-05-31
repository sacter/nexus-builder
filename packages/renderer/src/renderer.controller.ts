import { Controller, Get, Param, Res, Req, Query } from '@nestjs/common'
import { Response } from 'express'
import { PageRendererService } from './services/page-renderer.service'

@Controller()
export class RendererController {
  constructor(private readonly rendererService: PageRendererService) {}

  /**
   * 运行态页面入口 GET /app/:appId/:pagePath(*)
   * 这是最终用户访问已发布页面的唯一入口
   *
   * 例如: GET /app/app-001/home
   * 会查找 applicationId=app-001, path=/home 的已发布页面
   */
  @Get('app/:appId/:pagePath(*)')
  async servePage(
    @Param('appId') appId: string,
    @Param('pagePath') pagePath: string,
    @Query('format') format: string,
    @Res() res: Response,
  ) {
    if (format === 'json') {
      const data = await this.rendererService.getPublishedPageByPath(appId, pagePath)
      return res.json(data)
    }

    const html = await this.rendererService.renderPageHtml(appId, pagePath)
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.send(html)
  }

  /**
   * 健康检查端点
   */
  @Get('health')
  health() {
    return { status: 'ok', service: 'renderer' }
  }
}
