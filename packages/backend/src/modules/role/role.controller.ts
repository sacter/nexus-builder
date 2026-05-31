import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common'
import { RoleService } from './role.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'

@Controller('roles')
@UseGuards(JwtAuthGuard)
export class RoleController {
  constructor(private roleService: RoleService) {}

  @Get()
  findAll() {
    return this.roleService.findAll()
  }

  @Post()
  create(@Body() dto: { name: string; description?: string }) {
    return this.roleService.create(dto)
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: { name?: string; description?: string; permissionIds?: string[] }) {
    return this.roleService.update(id, dto)
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.roleService.delete(id)
  }
}
