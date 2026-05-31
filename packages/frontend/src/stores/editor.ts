import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { IComponentNode } from '@lowcode/common'
import { generateId, deepClone } from '@lowcode/common'
import { findNodeById, removeNodeById } from '@/utils/schema'

interface Snapshot {
  componentTree: IComponentNode[]
  selectedNodeId: string | null
}

export const useEditorStore = defineStore('editor', () => {
  const componentTree = ref<IComponentNode[]>([])
  const selectedNodeId = ref<string | null>(null)
  const past = ref<Snapshot[]>([])
  const future = ref<Snapshot[]>([])
  const zoom = ref(1)

  function selectNode(nodeId: string | null) {
    selectedNodeId.value = nodeId
  }

  const selectedNode = ref<IComponentNode | null>(null)

  function refreshSelectedNode() {
    if (!selectedNodeId.value) {
      selectedNode.value = null
      return
    }
    selectedNode.value = findNodeById(componentTree.value, selectedNodeId.value)
  }

  function saveSnapshot() {
    past.value.push({
      componentTree: deepClone(componentTree.value),
      selectedNodeId: selectedNodeId.value,
    })
    future.value = []
  }

  function addComponent(parentId: string | null, componentType: string, defaultProps?: Record<string, any>) {
    saveSnapshot()
    const node: IComponentNode = {
      id: generateId(),
      componentType,
      props: defaultProps ?? {},
      style: {},
      children: [],
    }
    if (parentId) {
      const parent = findNodeById(componentTree.value, parentId)
      parent?.children?.push(node)
    } else {
      componentTree.value.push(node)
    }
    selectedNodeId.value = node.id
  }

  function removeComponent(nodeId: string) {
    saveSnapshot()
    removeNodeById(componentTree.value, nodeId)
    if (selectedNodeId.value === nodeId) {
      selectedNodeId.value = null
    }
  }

  function updateComponentProps(nodeId: string, props: Record<string, any>) {
    saveSnapshot()
    const node = findNodeById(componentTree.value, nodeId)
    if (node) node.props = { ...node.props, ...props }
  }

  function updateComponentStyle(nodeId: string, style: Record<string, string>) {
    saveSnapshot()
    const node = findNodeById(componentTree.value, nodeId)
    if (node) node.style = { ...node.style, ...style }
  }

  function undo() {
    if (past.value.length === 0) return
    future.value.push({
      componentTree: deepClone(componentTree.value),
      selectedNodeId: selectedNodeId.value,
    })
    const snapshot = past.value.pop()!
    componentTree.value = snapshot.componentTree
    selectedNodeId.value = snapshot.selectedNodeId
  }

  function redo() {
    if (future.value.length === 0) return
    past.value.push({
      componentTree: deepClone(componentTree.value),
      selectedNodeId: selectedNodeId.value,
    })
    const snapshot = future.value.pop()!
    componentTree.value = snapshot.componentTree
    selectedNodeId.value = snapshot.selectedNodeId
  }

  function loadSchema(components: IComponentNode[]) {
    componentTree.value = deepClone(components)
    selectedNodeId.value = null
    past.value = []
    future.value = []
  }

  function reset() {
    componentTree.value = []
    selectedNodeId.value = null
    past.value = []
    future.value = []
    zoom.value = 1
  }

  return {
    componentTree,
    selectedNodeId,
    selectedNode,
    zoom,
    past,
    future,
    selectNode,
    refreshSelectedNode,
    addComponent,
    removeComponent,
    updateComponentProps,
    updateComponentStyle,
    undo,
    redo,
    loadSchema,
    reset,
  }
})
