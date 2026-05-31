import { PageStatus, ApplicationStatus } from '../types'

export const PAGE_STATUS_LABELS: Record<PageStatus, string> = {
  [PageStatus.DRAFT]: '草稿',
  [PageStatus.PUBLISHED]: '已发布',
  [PageStatus.ARCHIVED]: '已归档',
}

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  [ApplicationStatus.DRAFT]: '草稿',
  [ApplicationStatus.PUBLISHED]: '已发布',
  [ApplicationStatus.ARCHIVED]: '已归档',
}

export const ALL_PERMISSION_ACTIONS = ['create', 'read', 'update', 'delete', 'publish'] as const
export const ALL_PERMISSION_RESOURCES = [
  'application',
  'page',
  'datasource',
  'workflow',
  'user',
  'role',
  'media',
] as const
