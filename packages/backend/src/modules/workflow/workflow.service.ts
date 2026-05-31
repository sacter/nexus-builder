import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Workflow } from './entities/workflow.entity'
import { WorkflowInstance } from './entities/workflow-instance.entity'

@Injectable()
export class WorkflowService {
  constructor(
    @InjectRepository(Workflow) private repo: Repository<Workflow>,
    @InjectRepository(WorkflowInstance) private instanceRepo: Repository<WorkflowInstance>,
  ) {}

  findAll(applicationId?: string, page = 1, pageSize = 20) {
    const where: any = {}
    if (applicationId) where.applicationId = applicationId
    return this.repo.findAndCount({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { updatedAt: 'DESC' },
    })
  }

  findById(id: string) {
    return this.repo.findOneBy({ id })
  }

  create(dto: { applicationId: string; name: string; description?: string; definition: Record<string, any> }) {
    return this.repo.save(dto)
  }

  async update(id: string, dto: { name?: string; description?: string; definition?: Record<string, any>; status?: string }) {
    await this.repo.update(id, dto)
    return this.findById(id)
  }

  async delete(id: string) {
    await this.repo.update(id, { status: 'archived' })
    return { success: true }
  }

  async execute(workflowId: string, startedBy: string, context?: Record<string, any>) {
    const workflow = await this.findById(workflowId)
    if (!workflow) throw new NotFoundException('Workflow not found')

    const def = workflow.definition as any
    const startNode = def?.nodes?.find((n: any) => n.type === 'start')
    return this.instanceRepo.save({
      workflowId,
      businessKey: context?.businessKey,
      currentNodeId: startNode?.id ?? null,
      context: context ?? {},
      startedBy,
    })
  }

  findInstances(workflowId: string) {
    return this.instanceRepo.find({ where: { workflowId }, order: { startedAt: 'DESC' } })
  }
}
