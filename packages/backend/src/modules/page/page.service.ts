import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Page } from './entities/page.entity'
import { PageSchema } from './entities/page-schema.entity'

@Injectable()
export class PageService {
  constructor(
    @InjectRepository(Page) private repo: Repository<Page>,
    @InjectRepository(PageSchema) private schemaRepo: Repository<PageSchema>,
  ) {}

  findByApplicationId(applicationId: string) {
    return this.repo.find({ where: { applicationId }, order: { updatedAt: 'DESC' } })
  }

  findById(id: string) {
    return this.repo.findOneBy({ id })
  }

  create(dto: { applicationId: string; name: string; path: string; description?: string; layoutType?: string }) {
    return this.repo.save(dto)
  }

  async update(id: string, dto: { name?: string; path?: string; description?: string; layoutType?: string }) {
    await this.repo.update(id, dto)
    return this.findById(id)
  }

  async delete(id: string) {
    await this.schemaRepo.delete({ pageId: id })
    await this.repo.delete(id)
    return { success: true }
  }

  // Schema management
  async getLatestSchema(pageId: string) {
    return this.schemaRepo.findOne({ where: { pageId }, order: { version: 'DESC' } })
  }

  async getSchemaByVersion(pageId: string, version: number) {
    return this.schemaRepo.findOne({ where: { pageId, version } })
  }

  async getSchemaVersions(pageId: string) {
    return this.schemaRepo.find({
      where: { pageId },
      select: ['id', 'version', 'isPublished', 'publishedAt', 'createdBy', 'createdAt'],
      order: { version: 'DESC' },
    })
  }

  async saveSchema(pageId: string, schema: Record<string, any>, createdBy: string) {
    const latest = await this.schemaRepo.findOne({ where: { pageId }, order: { version: 'DESC' } })
    const nextVersion = latest ? latest.version + 1 : 1
    return this.schemaRepo.save({ pageId, version: nextVersion, schema, createdBy })
  }

  async restoreSchema(pageId: string, versionId: string, createdBy: string) {
    const record = await this.schemaRepo.findOneBy({ id: versionId, pageId })
    if (!record) throw new NotFoundException('Schema version not found')
    return this.saveSchema(pageId, record.schema, createdBy)
  }

  async publish(pageId: string) {
    const latest = await this.schemaRepo.findOne({ where: { pageId }, order: { version: 'DESC' } })
    if (!latest) throw new NotFoundException('No schema to publish')
    await this.schemaRepo.update({ pageId, isPublished: true }, { isPublished: false })
    latest.isPublished = true
    latest.publishedAt = new Date()
    await this.schemaRepo.save(latest)
    await this.repo.update(pageId, { status: 'published' })
    return latest
  }

  async unpublish(pageId: string) {
    await this.schemaRepo.update({ pageId, isPublished: true }, { isPublished: false })
    await this.repo.update(pageId, { status: 'draft' })
    return { success: true }
  }

  async getPublishedSchema(pageId: string) {
    return this.schemaRepo.findOne({ where: { pageId, isPublished: true } })
  }
}
