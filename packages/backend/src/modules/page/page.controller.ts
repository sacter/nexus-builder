import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { PageService } from './page.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { CurrentUser } from '../../common/decorators/current-user.decorator'

@Controller()
@UseGuards(JwtAuthGuard)
export class PageController {
  constructor(private pageService: PageService) {}

  @Get('applications/:appId/pages')
  findByApp(@Param('appId') appId: string) {
    return this.pageService.findByApplicationId(appId)
  }

  @Post('applications/:appId/pages')
  create(@Param('appId') appId: string, @Body() dto: { name: string; path: string; description?: string; layoutType?: string }) {
    return this.pageService.create({ ...dto, applicationId: appId })
  }

  @Put('pages/:id')
  update(@Param('id') id: string, @Body() dto: { name?: string; path?: string; description?: string; layoutType?: string }) {
    return this.pageService.update(id, dto)
  }

  @Delete('pages/:id')
  delete(@Param('id') id: string) {
    return this.pageService.delete(id)
  }

  @Get('pages/:id/schema')
  async getSchema(@Param('id') id: string, @Query('version') version?: string) {
    if (version) {
      return this.pageService.getSchemaByVersion(id, +version)
    }
    return this.pageService.getLatestSchema(id)
  }

  @Post('pages/:id/schema')
  saveSchema(@Param('id') id: string, @Body('schema') schema: Record<string, any>, @CurrentUser('id') userId: string) {
    return this.pageService.saveSchema(id, schema, userId)
  }

  @Get('pages/:id/schema/versions')
  getVersions(@Param('id') id: string) {
    return this.pageService.getSchemaVersions(id)
  }

  @Post('pages/:id/schema/:versionId/restore')
  restoreSchema(@Param('id') id: string, @Param('versionId') versionId: string, @CurrentUser('id') userId: string) {
    return this.pageService.restoreSchema(id, versionId, userId)
  }

  @Post('pages/:id/publish')
  publish(@Param('id') id: string) {
    return this.pageService.publish(id)
  }

  @Post('pages/:id/unpublish')
  unpublish(@Param('id') id: string) {
    return this.pageService.unpublish(id)
  }
}
