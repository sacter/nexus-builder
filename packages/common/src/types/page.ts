import type { IDataBinding, IEventHandler } from './datasource'

export interface IPage {
  id: string
  applicationId: string
  name: string
  path: string
  description?: string
  layoutType: PageLayoutType
  status: PageStatus
  createdAt: string
  updatedAt: string
}

export enum PageLayoutType {
  FREE = 'free',
  FLOW = 'flow',
}

export enum PageStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export interface IPageSchema {
  version: string
  components: IComponentNode[]
  styles?: IStyleConfig
  datasources?: IDataBinding[]
  events?: IEventHandler[]
}

export interface IComponentNode {
  id: string
  componentType: string
  props: Record<string, any>
  style: Record<string, string>
  children?: IComponentNode[]
  events?: IEventHandler[]
  bindings?: IDataBinding[]
  slot?: string
}

export interface IStyleConfig {
  width?: string
  minHeight?: string
  backgroundColor?: string
  padding?: string
  gap?: string
}

export interface IPageSchemaRecord {
  id: string
  pageId: string
  version: number
  schema: IPageSchema
  isPublished: boolean
  publishedAt?: string
  createdBy?: string
  createdAt: string
}
