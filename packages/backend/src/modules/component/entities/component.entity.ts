import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm'

@Entity('components')
export class Component {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ unique: true, length: 100 })
  type: string

  @Column({ name: 'display_name', length: 100 })
  displayName: string

  @Column({ length: 50 })
  category: string

  @Column({ length: 100, nullable: true })
  icon: string

  @Column({ name: 'default_props', type: 'json', nullable: true })
  defaultProps: Record<string, any>

  @Column({ name: 'property_schema', type: 'json', nullable: true })
  propertySchema: Record<string, any>

  @Column({ length: 500, nullable: true })
  thumbnail: string

  @Column({ length: 20, default: '1.0.0' })
  version: string

  @Column({ type: 'enum', enum: ['active', 'deprecated'], default: 'active' })
  status: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date
}
