import type { IComponentNode, IPageSchema } from '@lowcode/common'
import { generateId, deepClone } from '@lowcode/common'

export function createEmptySchema(): IPageSchema {
  return {
    version: '1.0',
    components: [],
    styles: { minHeight: '100vh', backgroundColor: '#f5f5f5', padding: '16px' },
  }
}

export function findNodeById(nodes: IComponentNode[], id: string): IComponentNode | null {
  for (const node of nodes) {
    if (node.id === id) return node
    if (node.children) {
      const found = findNodeById(node.children, id)
      if (found) return found
    }
  }
  return null
}

export function removeNodeById(nodes: IComponentNode[], id: string): boolean {
  const index = nodes.findIndex((n) => n.id === id)
  if (index !== -1) {
    nodes.splice(index, 1)
    return true
  }
  for (const node of nodes) {
    if (node.children && removeNodeById(node.children, id)) return true
  }
  return false
}

export function cloneNode(node: IComponentNode): IComponentNode {
  return {
    ...deepClone(node),
    id: generateId(),
    children: node.children?.map((c) => cloneNode(c)) ?? [],
  }
}
