import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Component } from './entities/component.entity'

@Injectable()
export class ComponentService {
  constructor(@InjectRepository(Component) private repo: Repository<Component>) {}

  findAll(category?: string) {
    const where: any = { status: 'active' }
    if (category) where.category = category
    return this.repo.find({ where, order: { category: 'ASC', displayName: 'ASC' } })
  }

  findById(id: string) {
    return this.repo.findOneBy({ id })
  }

  create(dto: {
    type: string
    displayName: string
    category: string
    icon?: string
    defaultProps?: any
    propertySchema?: any
    thumbnail?: string
  }) {
    return this.repo.save(dto)
  }

  async update(id: string, dto: Record<string, any>) {
    await this.repo.update(id, dto)
    return this.findById(id)
  }

  async delete(id: string) {
    await this.repo.update(id, { status: 'deprecated' })
    return { success: true }
  }
}
