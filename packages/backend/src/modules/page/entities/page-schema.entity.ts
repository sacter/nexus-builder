import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Unique } from 'typeorm'

@Entity('page_schemas')
@Unique(['pageId', 'version'])
export class PageSchema {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'page_id', length: 36 })
  pageId: string

  @Column({ type: 'int' })
  version: number

  @Column({ type: 'json' })
  schema: Record<string, any>

  @Column({ name: 'is_published', type: 'tinyint', default: 0 })
  isPublished: boolean

  @Column({ name: 'published_at', type: 'datetime', nullable: true })
  publishedAt: Date

  @Column({ name: 'created_by', length: 36, nullable: true })
  createdBy: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date
}
