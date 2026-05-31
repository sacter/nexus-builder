<script setup lang="ts">
import { ref, computed } from 'vue'
import { useComponentStore, type ComponentConfig } from '@/stores/components'

const store = useComponentStore()

type FilterKey = 'all' | 'basic' | 'dataDisplay' | 'chart' | 'container' | 'form'
const activeFilter = ref<FilterKey>('all')

const filterTabs: { key: FilterKey; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'basic', label: '基础' },
  { key: 'dataDisplay', label: '数据' },
  { key: 'chart', label: '图表' },
  { key: 'container', label: '布局' },
]

const categories = computed(() => store.categories)

const filteredItems = computed(() => {
  if (activeFilter.value === 'all') {
    return categories.value.flatMap((cat) => cat.items)
  }
  return categories.value
    .filter((cat) => cat.key === activeFilter.value)
    .flatMap((cat) => cat.items)
})

function onDragStart(comp: ComponentConfig) {
  store.setDragging(comp.type)
}
function onDragEnd() {
  store.setDragging(null)
}

/* 组件图标颜色映射 */
const iconColors: Record<string, string> = {
  ElButton: '#3b82f6',
  ElInput: '#10b981',
  ElTable: '#f59e0b',
  ElLineChart: '#f97316',
  ElBarChart: '#8b5cf6',
  ElForm: '#3b82f6',
  ElCardGroup: '#8b5cf6',
  ElSelect: '#14b8a6',
  ElDatePicker: '#6366f1',
  ElUpload: '#ec4899',
  ElTabs: '#f59e0b',
  ElModal: '#ef4444',
  ElText: '#64748b',
  ElImage: '#06b6d4',
  ElContainer: '#64748b',
}

/* 组件图标 SVG 映射 */
function getIconSvg(type: string): string {
  const icons: Record<string, string> = {
    ElButton: '<rect x="3" y="8" width="18" height="8" rx="2"/>',
    ElInput: '<rect x="3" y="6" width="18" height="12" rx="2"/><line x1="7" y1="10" x2="13" y2="10"/>',
    ElTable: '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="12" y1="3" x2="12" y2="21"/>',
    ElLineChart: '<polyline points="3 17 9 11 13 15 21 7"/><line x1="3" y1="21" x2="21" y2="21"/>',
    ElBarChart: '<rect x="3" y="12" width="4" height="9"/><rect x="10" y="7" width="4" height="14"/><rect x="17" y="3" width="4" height="18"/>',
    ElForm: '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="7" y1="8" x2="17" y2="8"/><line x1="7" y1="12" x2="14" y2="12"/><line x1="7" y1="16" x2="11" y2="16"/>',
    ElCardGroup: '<rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="8" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/><rect x="13" y="13" width="8" height="8" rx="2"/>',
    ElSelect: '<rect x="3" y="6" width="18" height="12" rx="2"/><polyline points="15 11 12 14 9 11"/>',
    ElDatePicker: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
    ElUpload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
    ElTabs: '<line x1="3" y1="6" x2="21" y2="6"/><rect x="3" y="6" width="6" height="3" fill="currentColor" rx="0"/><line x1="3" y1="9" x2="21" y2="9"/><rect x="3" y="9" width="18" height="12" rx="0"/>',
    ElModal: '<rect x="3" y="5" width="18" height="14" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="8" y1="7" x2="8" y2="7.01"/><rect x="7" y="13" width="10" height="3" rx="1"/>',
  }
  return icons[type] || '<rect x="4" y="4" width="16" height="16" rx="2"/>'
}
</script>

<template>
  <aside class="component-panel">
    <div class="panel-header">
      <span class="panel-title">组件库</span>
      <button class="panel-collapse-btn" title="折叠">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="11 17 6 12 11 7"/><polyline points="18 17 13 12 18 7"/></svg>
      </button>
    </div>

    <!-- 分类筛选 -->
    <div class="filter-tabs">
      <button
        v-for="tab in filterTabs"
        :key="tab.key"
        class="filter-tab"
        :class="{ active: activeFilter === tab.key }"
        @click="activeFilter = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- 组件列表 -->
    <div class="component-list">
      <div
        v-for="comp in filteredItems"
        :key="comp.type"
        class="component-item"
        draggable="true"
        @dragstart="onDragStart(comp)"
        @dragend="onDragEnd"
      >
        <div class="comp-icon" :style="{ color: iconColors[comp.type] || '#64748b' }">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" v-html="getIconSvg(comp.type)" />
        </div>
        <div class="comp-info">
          <span class="comp-name">{{ comp.displayName }}</span>
          <span class="comp-desc">{{ comp.defaultProps?._desc ?? '' }}</span>
        </div>
      </div>
    </div>

    <div v-if="filteredItems.length === 0" class="empty-hint">
      暂无组件，请先在系统管理中注册组件
    </div>
  </aside>
</template>

<style scoped>
.component-panel {
  width: 260px;
  min-width: 260px;
  border-right: 1px solid var(--nx-border);
  background: var(--nx-surface);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 12px 8px;
}
.panel-title {
  font-weight: 600;
  font-size: 14px;
  color: var(--nx-text);
}
.panel-collapse-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: none;
  color: var(--nx-text-subtle);
  cursor: pointer;
  border-radius: 4px;
}
.panel-collapse-btn:hover {
  background: var(--nx-hover);
  color: var(--nx-text);
}

/* ─── 分类筛选 ─── */
.filter-tabs {
  display: flex;
  gap: 2px;
  padding: 0 12px 10px;
}
.filter-tab {
  padding: 3px 10px;
  font-size: 12px;
  border: none;
  background: none;
  color: var(--nx-text-subtle);
  cursor: pointer;
  border-radius: 10px;
  transition: all 0.15s;
}
.filter-tab:hover {
  color: var(--nx-text-muted);
  background: var(--nx-hover);
}
.filter-tab.active {
  background: rgba(59, 130, 246, 0.1);
  color: var(--nx-accent);
  font-weight: 500;
}

/* ─── 组件列表 ─── */
.component-list {
  flex: 1;
  padding: 0 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.component-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: grab;
  transition: all 0.15s;
}
.component-item:hover {
  background: var(--nx-hover);
}
.component-item:active {
  cursor: grabbing;
  opacity: 0.7;
}
.comp-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--nx-hover);
  border-radius: 6px;
}
.comp-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.comp-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--nx-text);
}
.comp-desc {
  font-size: 11px;
  color: var(--nx-text-subtle);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.empty-hint {
  font-size: 12px;
  color: var(--nx-text-subtle);
  text-align: center;
  margin-top: 40px;
  padding: 0 12px;
}
</style>
