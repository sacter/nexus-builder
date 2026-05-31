import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Role } from './entities/role.entity'

@Injectable()
export class RoleService {
  constructor(@InjectRepository(Role) private repo: Repository<Role>) {}

  findAll() {
    return this.repo.find({ relations: ['permissions'] })
  }

  findById(id: string) {
    return this.repo.findOne({ where: { id }, relations: ['permissions'] })
  }

  create(dto: { name: string; description?: string }) {
    return this.repo.save(dto)
  }

  async update(id: string, dto: { name?: string; description?: string; permissionIds?: string[] }) {
    const role = await this.repo.findOne({ where: { id }, relations: ['permissions'] })
    if (!role) return null
    if (dto.name) role.name = dto.name
    if (dto.description !== undefined) role.description = dto.description
    if (dto.permissionIds) {
      role.permissions = dto.permissionIds.map((id) => ({ id } as any))
    }
    return this.repo.save(role)
  }

  async delete(id: string) {
    await this.repo.delete(id)
    return { success: true }
  }
}
