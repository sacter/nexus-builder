import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Workflow } from './entities/workflow.entity'
import { WorkflowInstance } from './entities/workflow-instance.entity'
import { WorkflowService } from './workflow.service'
import { WorkflowController } from './workflow.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Workflow, WorkflowInstance])],
  controllers: [WorkflowController],
  providers: [WorkflowService],
  exports: [WorkflowService],
})
export class WorkflowModule {}
