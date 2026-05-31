import { DataSourceType } from '../types'

export const DATASOURCE_TYPE_LABELS: Record<DataSourceType, string> = {
  [DataSourceType.HTTP]: 'HTTP API',
  [DataSourceType.DATABASE]: '数据库直连',
  [DataSourceType.MOCK]: 'Mock 数据',
}
