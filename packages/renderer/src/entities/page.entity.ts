import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity('pages')
export class Page {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'application_id', length: 36 })
  applicationId: string

  @Column({ length: 100 })
  name: string

  @Column({ length: 200 })
  path: string

  @Column({ type: 'enum', enum: ['draft', 'published', 'archived'] })
  status: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
}
