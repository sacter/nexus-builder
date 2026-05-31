<script setup lang="ts">
import { computed } from 'vue'
import { useEditorStore } from '@/stores/editor'
import { useComponentStore } from '@/stores/components'
import RenderNode from '@/components/registry/RenderNode.vue'

const editor = useEditorStore()
const compStore = useComponentStore()

const zoomStyle = computed(() => ({
  transform: `scale(${editor.zoom})`,
  transformOrigin: 'top center',
}))

function handleDrop(e: DragEvent) {
  e.preventDefault()
  editor.addComponent(null, compStore.draggingType ?? 'ElText')
  compStore.setDragging(null)
}

function handleDragOver(e: DragEvent) {
  e.preventDefault()
}

function handleCanvasClick() {
  editor.selectNode(null)
}
</script>

<template>
  <div class="canvas-wrapper" @click.self="handleCanvasClick" @drop="handleDrop" @dragover="handleDragOver">
    <div class="canvas" :style="zoomStyle">
      <!-- 画布顶部：macOS 窗口控制 + URL 栏 -->
      <div class="canvas-chrome">
        <div class="window-controls">
          <span class="dot dot-red" />
          <span class="dot dot-yellow" />
          <span class="dot dot-green" />
        </div>
        <div class="url-bar">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          <span>app.nexusbuilder.io/crm</span>
        </div>
        <div class="canvas-size">
          1440 × 900
        </div>
      </div>

      <!-- 画布内容区 -->
      <div class="canvas-body" @click.self="handleCanvasClick">
        <div v-if="editor.componentTree.length === 0" class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          <span>从左侧拖拽组件到此处，或点击组件添加</span>
        </div>
        <RenderNode
          v-for="node in editor.componentTree"
          :key="node.id"
          :node="node"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.canvas-wrapper {
  flex: 1;
  overflow: auto;
  background: #0f172a;
  padding: 24px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}
.canvas {
  width: 100%;
  max-width: 1440px;
  min-height: 900px;
  background: #1e293b;
  border-radius: 10px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ─── 画布顶部 Chrome ─── */
.canvas-chrome {
  display: flex;
  align-items: center;
  padding: 10px 14px;
  gap: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
.window-controls {
  display: flex;
  gap: 6px;
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.dot-red { background: #ff5f57; }
.dot-yellow { background: #febc2e; }
.dot-green { background: #28c840; }
.url-bar {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(0, 0, 0, 0.25);
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  max-width: 360px;
}
.canvas-size {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.3);
  white-space: nowrap;
}

/* ─── 画布内容 ─── */
.canvas-body {
  flex: 1;
  padding: 24px;
  min-height: 500px;
}
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  height: 400px;
  color: rgba(255, 255, 255, 0.25);
  font-size: 14px;
  border: 2px dashed rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}
</style>
