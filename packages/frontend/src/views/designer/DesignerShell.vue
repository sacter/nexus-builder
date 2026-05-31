<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const appId = route.params.appId as string

const isEditorMode = computed(() => {
  return route.path.includes('/page/') && route.path.includes('/edit')
})

function backToDashboard() {
  router.push('/dashboard')
}
</script>

<template>
  <div class="designer-shell" :class="{ 'editor-mode': isEditorMode }">
    <header v-if="!isEditorMode" class="shell-header">
      <div class="header-left">
        <el-button text @click="backToDashboard">← 返回</el-button>
        <el-menu mode="horizontal" :default-active="route.path" @select="(key: string) => router.push(key)" class="shell-menu">
          <el-menu-item :index="`/designer/${appId}/pages`">页面管理</el-menu-item>
          <el-menu-item :index="`/designer/${appId}/datasources`">数据源</el-menu-item>
          <el-menu-item :index="`/designer/${appId}/workflows`">流程管理</el-menu-item>
        </el-menu>
      </div>
    </header>
    <main class="shell-body" :class="{ 'editor-body': isEditorMode }">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.designer-shell { height: 100%; display: flex; flex-direction: column; background: var(--nx-bg); }
.designer-shell.editor-mode { background: #0f172a; }
.shell-header { background: var(--nx-surface); border-bottom: 1px solid var(--nx-border); display: flex; align-items: center; padding: 0 16px; height: 48px; }
.header-left { display: flex; align-items: center; }
.shell-menu { border-bottom: none !important; }
.shell-menu .el-menu-item { height: 48px; line-height: 48px; }
.shell-body { flex: 1; overflow: auto; }
.shell-body.editor-body { overflow: hidden; }
</style>
