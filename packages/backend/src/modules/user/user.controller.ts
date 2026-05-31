import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { UserService } from './user.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  findAll(@Query('page') page = 1, @Query('pageSize') pageSize = 20) {
    return this.userService.findAll(+page, +pageSize)
  }

  @Post()
  create(@Body() dto: { username: string; password: string; email?: string }) {
    return this.userService.create(dto)
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: { email?: string; avatarUrl?: string; status?: number }) {
    return this.userService.update(id, dto)
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.userService.delete(id)
  }

  @Put(':id/roles')
  assignRoles(@Param('id') id: string, @Body('roleIds') roleIds: string[]) {
    return this.userService.assignRoles(id, roleIds)
  }
}
