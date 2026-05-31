export interface IComponent {
  id: string
  type: string
  displayName: string
  category: string
  icon?: string
  defaultProps?: Record<string, any>
  propertySchema?: IPropertySchema
  thumbnail?: string
  version: string
  status: ComponentStatus
  createdAt: string
}

export enum ComponentStatus {
  ACTIVE = 'active',
  DEPRECATED = 'deprecated',
}

export interface IPropertySchema {
  type: 'object'
  properties: Record<string, IPropertyField>
}

export interface IPropertyField {
  type: 'string' | 'number' | 'boolean' | 'select' | 'color' | 'json'
  label: string
  default?: any
  options?: { label: string; value: any }[]
  required?: boolean
}
