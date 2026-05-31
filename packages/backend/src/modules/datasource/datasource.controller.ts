import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common'
import { DatasourceService } from './datasource.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'

@Controller()
@UseGuards(JwtAuthGuard)
export class DatasourceController {
  constructor(private datasourceService: DatasourceService) {}

  @Get('applications/:appId/datasources')
  findByApp(@Param('appId') appId: string) {
    return this.datasourceService.findByApplicationId(appId)
  }

  @Post('applications/:appId/datasources')
  create(@Param('appId') appId: string, @Body() dto: { name: string; type: string; config: Record<string, any> }) {
    return this.datasourceService.create({ ...dto, applicationId: appId })
  }

  @Put('datasources/:id')
  update(@Param('id') id: string, @Body() dto: { name?: string; type?: string; config?: Record<string, any> }) {
    return this.datasourceService.update(id, dto)
  }

  @Delete('datasources/:id')
  delete(@Param('id') id: string) {
    return this.datasourceService.delete(id)
  }

  @Post('datasources/:id/test')
  async test(@Param('id') id: string) {
    const ds = await this.datasourceService.findById(id)
    return this.datasourceService.testConnection(ds!)
  }
}
