import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'

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

  @Column({ type: 'text', nullable: true })
  description: string

  @Column({ name: 'layout_type', type: 'enum', enum: ['free', 'flow'], default: 'flow' })
  layoutType: string

  @Column({ type: 'enum', enum: ['draft', 'published', 'archived'], default: 'draft' })
  status: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
}
