import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity('workflows')
export class Workflow {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'application_id', length: 36 })
  applicationId: string

  @Column({ length: 100 })
  name: string

  @Column({ type: 'text', nullable: true })
  description: string

  @Column({ type: 'json' })
  definition: Record<string, any>

  @Column({ type: 'enum', enum: ['draft', 'published', 'archived'], default: 'draft' })
  status: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
}
