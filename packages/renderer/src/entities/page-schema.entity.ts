import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm'

@Entity('page_schemas')
export class PageSchema {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'page_id', length: 36 })
  pageId: string

  @Column({ type: 'int' })
  version: number

  @Column({ type: 'json' })
  schema: Record<string, any>

  @Column({ name: 'is_published', type: 'tinyint' })
  isPublished: boolean

  @Column({ name: 'published_at', type: 'datetime', nullable: true })
  publishedAt: Date

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date
}
