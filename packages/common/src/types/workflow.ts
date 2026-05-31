export interface IWorkflow {
  id: string
  applicationId: string
  name: string
  description?: string
  definition: IWorkflowDefinition
  status: WorkflowStatus
  createdAt: string
  updatedAt: string
}

export enum WorkflowStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export interface IWorkflowDefinition {
  nodes: IWorkflowNode[]
  edges: IWorkflowEdge[]
}

export interface IWorkflowNode {
  id: string
  type: WorkflowNodeType
  label: string
  position: { x: number; y: number }
  config?: Record<string, any>
}

export enum WorkflowNodeType {
  START = 'start',
  END = 'end',
  APPROVAL = 'approval',
  CONDITION = 'condition',
  PARALLEL = 'parallel',
  SERVICE = 'service',
  SCRIPT = 'script',
}

export interface IWorkflowEdge {
  id: string
  sourceId: string
  targetId: string
  condition?: string
}

export interface IWorkflowInstance {
  id: string
  workflowId: string
  businessKey?: string
  status: WorkflowInstanceStatus
  currentNodeId?: string
  context: Record<string, any>
  startedBy: string
  startedAt: string
  completedAt?: string
}

export enum WorkflowInstanceStatus {
  RUNNING = 'running',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}
