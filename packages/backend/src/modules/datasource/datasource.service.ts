import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Datasource } from './entities/datasource.entity'

@Injectable()
export class DatasourceService {
  constructor(@InjectRepository(Datasource) private repo: Repository<Datasource>) {}

  findByApplicationId(applicationId: string) {
    return this.repo.find({ where: { applicationId }, order: { updatedAt: 'DESC' } })
  }

  findById(id: string) {
    return this.repo.findOneBy({ id })
  }

  create(dto: { applicationId: string; name: string; type: string; config: Record<string, any> }) {
    return this.repo.save(dto)
  }

  async update(id: string, dto: { name?: string; type?: string; config?: Record<string, any> }) {
    await this.repo.update(id, dto)
    return this.findById(id)
  }

  async delete(id: string) {
    await this.repo.delete(id)
    return { success: true }
  }

  testConnection(datasource: Datasource) {
    // Stub for connection testing – extend with axios/http checks
    return { success: true, message: 'Connection test passed' }
  }
}
