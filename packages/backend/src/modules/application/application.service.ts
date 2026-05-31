import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Application } from './entities/application.entity'

@Injectable()
export class ApplicationService {
  constructor(@InjectRepository(Application) private repo: Repository<Application>) {}

  findAll(ownerId?: string, page = 1, pageSize = 20) {
    const where: any = {}
    if (ownerId) where.ownerId = ownerId
    return this.repo.findAndCount({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { updatedAt: 'DESC' },
    })
  }

  findById(id: string) {
    return this.repo.findOneBy({ id })
  }

  create(dto: { name: string; description?: string; icon?: string; ownerId: string }) {
    return this.repo.save(dto)
  }

  async update(id: string, dto: { name?: string; description?: string; icon?: string; status?: string; config?: any }) {
    await this.repo.update(id, dto)
    return this.findById(id)
  }

  async delete(id: string) {
    await this.repo.delete(id)
    return { success: true }
  }
}
