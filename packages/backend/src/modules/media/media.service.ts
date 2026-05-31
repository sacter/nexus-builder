import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Media } from './entities/media.entity'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media) private repo: Repository<Media>,
    private config: ConfigService,
  ) {}

  findAll(page = 1, pageSize = 20) {
    return this.repo.findAndCount({
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    })
  }

  findById(id: string) {
    return this.repo.findOneBy({ id })
  }

  async create(file: Express.Multer.File, uploadedBy?: string) {
    const uploadDir = this.config.get('UPLOAD_DIR', './uploads')
    return this.repo.save({
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: `/uploads/${file.filename}`,
      uploadedBy,
    })
  }

  async delete(id: string) {
    await this.repo.delete(id)
    return { success: true }
  }
}
