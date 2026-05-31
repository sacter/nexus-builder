import { defineStore } from 'pinia'
import { ref, computed, type Component } from 'vue'
import type { ComponentCategory } from '@lowcode/common'
import { COMPONENT_CATEGORIES, CATEGORY_LABELS } from '@lowcode/common'

export interface ComponentConfig {
  type: string
  displayName: string
  icon: Component
  category: ComponentCategory
  defaultProps: Record<string, any>
  propertySchema?: Record<string, any>
  render: () => Promise<any>
  thumbnail?: string
}

export const useComponentStore = defineStore('components', () => {
  const registry = ref<Map<string, ComponentConfig>>(new Map())
  const draggingType = ref<string | null>(null)

  const categories = computed(() => {
    const map = new Map<ComponentCategory, ComponentConfig[]>()
    for (const comp of registry.value.values()) {
      const list = map.get(comp.category) ?? []
      list.push(comp)
      map.set(comp.category, list)
    }
    return Array.from(map.entries()).map(([key, items]) => ({
      key,
      label: CATEGORY_LABELS[key],
      items,
    }))
  })

  function registerComponent(config: ComponentConfig) {
    registry.value.set(config.type, config)
  }

  function getComponent(type: string) {
    return registry.value.get(type)
  }

  function setDragging(type: string | null) {
    draggingType.value = type
  }

  return { registry, draggingType, categories, registerComponent, getComponent, setDragging }
})
