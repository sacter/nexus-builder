<script setup lang="ts">
import { computed } from 'vue'
import { useEditorStore } from '@/stores/editor'

const editor = useEditorStore()

const selectedNode = computed(() => {
  if (!editor.selectedNodeId) return null
  return editor.selectedNode
})

const nodeProps = computed({
  get: () => selectedNode.value?.props ?? {},
  set: () => {},
})

function onPropChange(key: string, value: any) {
  if (!editor.selectedNodeId) return
  editor.updateComponentProps(editor.selectedNodeId, { [key]: value })
}

const styleEntries = computed(() => {
  if (!selectedNode.value?.style) return []
  return Object.entries(selectedNode.value.style)
})
</script>

<template>
  <aside class="property-panel">
    <!-- 面板头部 -->
    <div class="panel-header">
      <div class="header-left">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
        <span>属性面板</span>
      </div>
      <button class="header-action" title="设置">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
      </button>
    </div>

    <!-- 空状态 -->
    <div v-if="!selectedNode" class="empty-state">
      <div class="empty-icon">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/><path d="M13 13l6 6"/></svg>
      </div>
      <span class="empty-title">未选中任何元素</span>
      <span class="empty-desc">点击画布上的元素以编辑属性</span>
    </div>

    <!-- 选中组件属性 -->
    <div v-else class="props-form">
      <div class="section">
        <div class="section-title">组件信息</div>
        <div class="info-row">
          <span>类型</span><span>{{ selectedNode.componentType }}</span>
        </div>
        <div class="info-row">
          <span>ID</span><span class="id-text">{{ selectedNode.id }}</span>
        </div>
      </div>

      <div class="section" v-if="Object.keys(nodeProps).length > 0">
        <div class="section-title">属性</div>
        <div v-for="(value, key) in nodeProps" :key="key" class="prop-row">
          <label>{{ key }}</label>
          <el-input
            v-if="typeof value === 'string' || typeof value === 'number'"
            :model-value="value"
            size="small"
            @update:model-value="(v: any) => onPropChange(key as string, v)"
          />
          <el-switch
            v-else-if="typeof value === 'boolean'"
            :model-value="value"
            @update:model-value="(v: boolean) => onPropChange(key as string, v)"
          />
        </div>
      </div>

      <div class="section">
        <div class="section-title">样式</div>
        <div v-for="[key, value] in styleEntries" :key="key" class="prop-row">
          <label>{{ key }}</label>
          <el-input size="small" :model-value="value" @update:model-value="(v: string) => editor.updateComponentStyle(selectedNode!.id, { [key]: v })" />
        </div>
        <div class="prop-row">
          <el-select size="small" placeholder="添加样式" style="width:100%">
            <el-option label="宽度" value="width" />
            <el-option label="高度" value="height" />
            <el-option label="背景色" value="backgroundColor" />
            <el-option label="边距" value="margin" />
            <el-option label="内边距" value="padding" />
          </el-select>
        </div>
      </div>

      <div class="section">
        <el-button type="danger" size="small" @click="editor.removeComponent(selectedNode.id)">
          删除组件
        </el-button>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.property-panel {
  width: 280px;
  min-width: 280px;
  border-left: 1px solid var(--nx-border);
  background: var(--nx-surface);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

/* ─── 面板头部 ─── */
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-bottom: 1px solid var(--nx-border);
}
.header-left {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--nx-text);
}
.header-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border: none;
  background: none;
  color: var(--nx-text-subtle);
  cursor: pointer;
  border-radius: 4px;
}
.header-action:hover {
  background: var(--nx-hover);
  color: var(--nx-text);
}

/* ─── 空状态 ─── */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 40px 24px;
}
.empty-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--nx-hover);
  border-radius: 50%;
  color: var(--nx-text-subtle);
}
.empty-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--nx-text-muted);
}
.empty-desc {
  font-size: 12px;
  color: var(--nx-text-subtle);
  text-align: center;
}

/* ─── 属性表单 ─── */
.props-form {
  padding: 12px 14px;
}
.section {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--nx-border);
}
.section-title {
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--nx-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  padding: 4px 0;
  color: var(--nx-text-subtle);
}
.id-text {
  font-family: monospace;
  font-size: 11px;
}
.prop-row {
  margin-bottom: 8px;
}
.prop-row label {
  display: block;
  font-size: 12px;
  color: var(--nx-text-subtle);
  margin-bottom: 4px;
}
</style>
