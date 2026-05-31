import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { WorkflowService } from './workflow.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { CurrentUser } from '../../common/decorators/current-user.decorator'

@Controller('workflows')
@UseGuards(JwtAuthGuard)
export class WorkflowController {
  constructor(private workflowService: WorkflowService) {}

  @Get()
  findAll(@Query('applicationId') appId?: string, @Query('page') page = 1, @Query('pageSize') pageSize = 20) {
    return this.workflowService.findAll(appId, +page, +pageSize)
  }

  @Post()
  create(@Body() dto: { applicationId: string; name: string; description?: string; definition: Record<string, any> }) {
    return this.workflowService.create(dto)
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.workflowService.update(id, dto)
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.workflowService.delete(id)
  }

  @Post(':id/execute')
  execute(@Param('id') id: string, @CurrentUser('id') userId: string, @Body() body: { context?: Record<string, any> }) {
    return this.workflowService.execute(id, userId, body.context)
  }

  @Get(':id/instances')
  instances(@Param('id') id: string) {
    return this.workflowService.findInstances(id)
  }
}
