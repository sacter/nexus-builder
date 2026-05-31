import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm'

@Entity('media')
export class Media {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ length: 255 })
  filename: string

  @Column({ name: 'original_name', length: 255 })
  originalName: string

  @Column({ name: 'mime_type', length: 100, nullable: true })
  mimeType: string

  @Column({ type: 'int', nullable: true })
  size: number

  @Column({ length: 500 })
  url: string

  @Column({ name: 'uploaded_by', length: 36, nullable: true })
  uploadedBy: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date
}
