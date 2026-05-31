import { Injectable, ConflictException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcryptjs'
import { User } from './entities/user.entity'

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  findById(id: string) {
    return this.repo.findOne({ where: { id }, relations: ['roles', 'roles.permissions'] })
  }

  findByUsername(username: string) {
    return this.repo.findOne({ where: { username }, relations: ['roles', 'roles.permissions'] })
  }

  findAll(page = 1, pageSize = 20) {
    return this.repo.findAndCount({
      relations: ['roles'],
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    })
  }

  async create(dto: { username: string; password: string; email?: string }) {
    const existing = await this.repo.findOneBy({ username: dto.username })
    if (existing) throw new ConflictException('用户名已存在')

    const passwordHash = await bcrypt.hash(dto.password, 10)
    return this.repo.save({ username: dto.username, passwordHash, email: dto.email })
  }

  async update(id: string, dto: { email?: string; avatarUrl?: string; status?: number }) {
    await this.repo.update(id, dto)
    return this.findById(id)
  }

  async delete(id: string) {
    await this.repo.delete(id)
    return { success: true }
  }

  async assignRoles(userId: string, roleIds: string[]) {
    const user = await this.repo.findOne({ where: { id: userId }, relations: ['roles'] })
    if (!user) return null
    user.roles = roleIds.map((id) => ({ id } as any))
    return this.repo.save(user)
  }
}
