import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { ComponentService } from './component.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'

@Controller('components')
@UseGuards(JwtAuthGuard)
export class ComponentController {
  constructor(private componentService: ComponentService) {}

  @Get()
  findAll(@Query('category') category?: string) {
    return this.componentService.findAll(category)
  }

  @Post()
  create(@Body() dto: any) {
    return this.componentService.create(dto)
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.componentService.update(id, dto)
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.componentService.delete(id)
  }
}
