import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm'

@Entity('workflow_instances')
export class WorkflowInstance {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'workflow_id', length: 36 })
  workflowId: string

  @Column({ name: 'business_key', length: 100, nullable: true })
  businessKey: string

  @Column({
    type: 'enum',
    enum: ['running', 'completed', 'rejected', 'cancelled'],
    default: 'running',
  })
  status: string

  @Column({ name: 'current_node_id', length: 36, nullable: true })
  currentNodeId: string

  @Column({ type: 'json', nullable: true })
  context: Record<string, any>

  @Column({ name: 'started_by', length: 36 })
  startedBy: string

  @CreateDateColumn({ name: 'started_at' })
  startedAt: Date

  @Column({ name: 'completed_at', type: 'datetime', nullable: true })
  completedAt: Date
}
