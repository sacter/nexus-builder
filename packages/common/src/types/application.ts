export interface IApplication {
  id: string
  name: string
  description?: string
  icon?: string
  ownerId: string
  status: ApplicationStatus
  config?: IApplicationConfig
  createdAt: string
  updatedAt: string
}

export enum ApplicationStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export interface IApplicationConfig {
  theme?: {
    primaryColor?: string
    layout?: 'side' | 'top' | 'mix'
  }
  globalStyles?: Record<string, string>
}
