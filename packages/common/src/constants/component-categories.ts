export const COMPONENT_CATEGORIES = {
  BASIC: 'basic',
  CONTAINER: 'container',
  FORM: 'form',
  DATA_DISPLAY: 'dataDisplay',
  CHART: 'chart',
  ADVANCED: 'advanced',
} as const

export type ComponentCategory = (typeof COMPONENT_CATEGORIES)[keyof typeof COMPONENT_CATEGORIES]

export const CATEGORY_LABELS: Record<ComponentCategory, string> = {
  basic: '基础组件',
  container: '容器组件',
  form: '表单组件',
  dataDisplay: '数据展示',
  chart: '图表组件',
  advanced: '高级组件',
}
