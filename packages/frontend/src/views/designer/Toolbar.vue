<script setup lang="ts">
import { useEditorStore } from '@/stores/editor'
import { useRoute, useRouter } from 'vue-router'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'
import { ArrowLeft, RefreshRight, RefreshLeft, Setting } from '@element-plus/icons-vue'

const props = defineProps<{ pageId: string }>()
const editor = useEditorStore()
const route = useRoute()
const router = useRouter()
const appId = route.params.appId as string

async function save() {
  try {
    await request.post(`/pages/${props.pageId}/schema`, {
      schema: { version: '1.0', components: editor.componentTree },
    })
    ElMessage.success('保存成功')
  } catch {
    ElMessage.error('保存失败')
  }
}

async function publish() {
  try {
    await request.post(`/pages/${props.pageId}/publish`)
    ElMessage.success('发布成功')
  } catch {
    ElMessage.error('发布失败')
  }
}

function backToProject() {
  router.push(`/designer/${appId}/pages`)
}

function handlePreview() {
  window.open(`/preview/${props.pageId}`, '_blank')
}
</script>

<template>
  <div class="designer-toolbar">
    <!-- 左侧：返回 + 应用名 + 状态 -->
    <div class="toolbar-left">
      <button class="back-btn" @click="backToProject">
        <el-icon :size="16"><ArrowLeft /></el-icon>
        <span>项目</span>
      </button>
      <div class="app-identity">
        <span class="app-icon">N</span>
        <span class="app-name">CRM 管理后台</span>
      </div>
      <el-dropdown trigger="click">
        <span class="status-badge">
          草稿
          <el-icon :size="10"><svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><path d="M512 714.667c-17.067 0-32.853-6.4-44.8-19.2L181.333 409.6c-25.6-25.6-25.6-66.133 0-91.733s66.133-25.6 91.733 0L512 556.8l238.933-238.933c25.6-25.6 66.133-25.6 91.733 0s25.6 66.133 0 91.733L556.8 695.467c-11.947 12.8-27.733 19.2-44.8 19.2z" fill="currentColor"/></svg></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>草稿</el-dropdown-item>
            <el-dropdown-item>已发布</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!-- 中间：工具栏 -->
    <div class="toolbar-center">
      <button
        class="tool-btn"
        :disabled="editor.past.length === 0"
        title="撤销"
        @click="editor.undo()"
      >
        <el-icon :size="14"><RefreshLeft /></el-icon>
      </button>
      <button
        class="tool-btn"
        :disabled="editor.future.length === 0"
        title="重做"
        @click="editor.redo()"
      >
        <el-icon :size="14"><RefreshRight /></el-icon>
      </button>

      <div class="tool-divider" />

      <button class="tool-btn" title="选择">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/><path d="M13 13l6 6"/></svg>
      </button>
      <button class="tool-btn" title="添加">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>
      <button class="tool-btn" title="网格">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
      </button>
      <button class="tool-btn" title="文本">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9.5" y1="20" x2="14.5" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
      </button>
      <button class="tool-btn" title="图片">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
      </button>

      <div class="tool-divider" />

      <button class="tool-btn zoom-btn" @click="editor.zoom = Math.max(0.5, editor.zoom - 0.1)">-</button>
      <span class="zoom-value">{{ Math.round(editor.zoom * 100) }}%</span>
      <button class="tool-btn zoom-btn" @click="editor.zoom = Math.min(2, editor.zoom + 0.1)">+</button>
    </div>

    <!-- 右侧：操作按钮 -->
    <div class="toolbar-right">
      <button class="action-btn ai-btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        AI 生成
      </button>
      <button class="action-btn" @click="handlePreview">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        预览
      </button>
      <button class="action-btn publish-btn" @click="publish">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
        发布
      </button>
      <button class="tool-btn settings-btn" @click="save">
        <el-icon :size="16"><Setting /></el-icon>
      </button>
    </div>
  </div>
</template>

<style scoped>
.designer-toolbar {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  background: var(--nx-surface);
  border-bottom: 1px solid var(--nx-border);
  gap: 12px;
  flex-shrink: 0;
}

/* ─── 左侧 ─── */
.toolbar-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: var(--nx-text-muted);
  cursor: pointer;
  font-size: 13px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
}
.back-btn:hover {
  color: var(--nx-accent);
  background: var(--nx-hover);
}
.app-identity {
  display: flex;
  align-items: center;
  gap: 6px;
}
.app-icon {
  width: 22px;
  height: 22px;
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
}
.app-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--nx-text);
}
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  color: var(--nx-text-subtle);
  background: var(--nx-hover);
  padding: 2px 8px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s;
}
.status-badge:hover {
  background: var(--nx-border);
}

/* ─── 中间工具栏 ─── */
.toolbar-center {
  display: flex;
  align-items: center;
  gap: 2px;
}
.tool-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: none;
  background: none;
  color: var(--nx-text-muted);
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.15s;
  font-size: 13px;
}
.tool-btn:hover:not(:disabled) {
  background: var(--nx-hover);
  color: var(--nx-text);
}
.tool-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.tool-btn.active {
  background: rgba(59, 130, 246, 0.12);
  color: var(--nx-accent);
}
.zoom-btn {
  font-size: 14px;
  font-weight: 500;
}
.zoom-value {
  font-size: 12px;
  color: var(--nx-text-muted);
  min-width: 36px;
  text-align: center;
}
.tool-divider {
  width: 1px;
  height: 20px;
  background: var(--nx-border);
  margin: 0 6px;
}

/* ─── 右侧操作 ─── */
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 6px;
}
.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  font-size: 12px;
  border: 1px solid var(--nx-border);
  border-radius: 6px;
  background: var(--nx-surface);
  color: var(--nx-text-muted);
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.action-btn:hover {
  border-color: var(--nx-accent);
  color: var(--nx-accent);
}
.publish-btn {
  background: var(--nx-accent);
  border-color: var(--nx-accent);
  color: #fff;
}
.publish-btn:hover {
  opacity: 0.9;
  color: #fff;
}
.ai-btn {
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  border-color: transparent;
  color: #fff;
}
.ai-btn:hover {
  opacity: 0.9;
  color: #fff;
}
.settings-btn {
  margin-left: 4px;
}
</style>
