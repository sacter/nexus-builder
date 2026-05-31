import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity('datasources')
export class Datasource {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'application_id', length: 36 })
  applicationId: string

  @Column({ length: 100 })
  name: string

  @Column({ type: 'enum', enum: ['http', 'database', 'mock'] })
  type: string

  @Column({ type: 'json' })
  config: Record<string, any>

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
}
