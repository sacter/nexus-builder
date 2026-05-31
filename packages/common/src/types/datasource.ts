export interface IDataSource {
  id: string
  applicationId: string
  name: string
  type: DataSourceType
  config: IDataSourceConfig
  createdAt: string
  updatedAt: string
}

export enum DataSourceType {
  HTTP = 'http',
  DATABASE = 'database',
  MOCK = 'mock',
}

export interface IDataSourceConfig {
  // HTTP type
  url?: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  queryParams?: Record<string, string>

  // Database type
  connectionString?: string
  sqlTemplate?: string

  // Mock type
  mockData?: any
}

export interface IDataBinding {
  componentId: string
  propName: string
  datasourceId: string
  paramsMapping?: Record<string, string>
  transform?: string
  loading?: boolean
}

export interface IEventHandler {
  type: string
  action: string
  params?: Record<string, any>
}
