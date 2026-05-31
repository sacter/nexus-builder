import { Entity, Column, PrimaryGeneratedColumn, Unique } from 'typeorm'

@Entity('permissions')
@Unique(['resource', 'action'])
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ length: 50 })
  resource: string

  @Column({ length: 50 })
  action: string
}
