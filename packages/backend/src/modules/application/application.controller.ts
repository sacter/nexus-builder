import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { ApplicationService } from './application.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { CurrentUser } from '../../common/decorators/current-user.decorator'

@Controller('applications')
@UseGuards(JwtAuthGuard)
export class ApplicationController {
  constructor(private applicationService: ApplicationService) {}

  @Get()
  findAll(@CurrentUser('id') userId: string, @Query('page') page = 1, @Query('pageSize') pageSize = 20) {
    return this.applicationService.findAll(userId, +page, +pageSize)
  }

  @Post()
  create(@Body() dto: { name: string; description?: string; icon?: string }, @CurrentUser('id') userId: string) {
    return this.applicationService.create({ ...dto, ownerId: userId })
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: { name?: string; description?: string; icon?: string; status?: string; config?: any }) {
    return this.applicationService.update(id, dto)
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.applicationService.delete(id)
  }
}
