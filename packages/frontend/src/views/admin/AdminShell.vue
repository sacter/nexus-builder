<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
</script>

<template>
  <div class="admin-shell">
    <header class="admin-header">
      <el-button text @click="router.push('/dashboard')">← 返回工作台</el-button>
      <el-menu mode="horizontal" :default-active="route.path" @select="(key: string) => router.push(key)" class="admin-menu">
        <el-menu-item index="/admin/users">用户管理</el-menu-item>
        <el-menu-item index="/admin/roles">角色管理</el-menu-item>
      </el-menu>
    </header>
    <main class="admin-body">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.admin-shell { height: 100%; display: flex; flex-direction: column; background: var(--nx-bg); }
.admin-header { background: var(--nx-surface); border-bottom: 1px solid var(--nx-border); display: flex; align-items: center; padding: 0 16px; height: 48px; }
.admin-menu { border-bottom: none !important; }
.admin-menu .el-menu-item { height: 48px; line-height: 48px; }
.admin-body { flex: 1; overflow: auto; padding: 16px; }
</style>
