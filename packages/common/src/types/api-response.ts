export interface IApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface IPaginatedResponse<T = any> {
  code: number
  message: string
  data: {
    items: T[]
    total: number
    page: number
    pageSize: number
  }
}

export interface IPaginationQuery {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
}
