<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import request from '@/utils/request'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import ThemeToggle from '@/components/ThemeToggle.vue'

/* ───── 类型 ───── */
interface ProjectItem {
  id: string
  name: string
  description: string
  status: 'published' | 'draft'
  updatedAt: string
  pages: number
  members: number
  tags: string[]
  starred: boolean
}

/* ───── 基础 ───── */
const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const theme = useThemeStore()
const sidebarCollapsed = ref(false)

/* ───── 侧边栏菜单 ───── */
const menuItems = [
  { icon: '➕', label: '新建项目', action: 'new', highlight: true },
  { icon: '📌', label: '工作台', route: '/dashboard' },
  { icon: '📁', label: '我的项目', route: '/projects', active: true },
  { icon: '🛠', label: '编辑器', route: '' },
  { icon: '🧩', label: '组件库', route: '' },
  { icon: '👥', label: '团队协作', route: '' },
  { icon: '💡', label: 'AI 助手已就绪', action: 'ai', purple: true },
  { icon: '⚙️', label: '系统设置', route: '/admin' },
]

/* ───── 搜索/筛选/视图 ───── */
const searchQuery = ref('')
const sortBy = ref('recent')
const viewMode = ref<'grid' | 'list'>('grid')
const dialogVisible = ref(false)
const newApp = ref({ name: '', description: '' })

/* ───── 项目数据 ───── */
const projects = ref<ProjectItem[]>([])

/* ───── 统计 ───── */
const totalApps = computed(() => projects.value.length)
const publishedCount = computed(() => projects.value.filter(p => p.status === 'published').length)

/* ───── 筛选后的列表 ───── */
const filteredProjects = computed(() => {
  let list = [...projects.value]
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
  }
  if (sortBy.value === 'recent') {
    list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  } else if (sortBy.value === 'name') {
    list.sort((a, b) => a.name.localeCompare(b.name, 'zh'))
  }
  return list
})

/* ───── 通知 ───── */
const notificationCount = ref(4)

/* ───── 生命周期 ───── */
onMounted(async () => {
  await auth.fetchProfile()
  try {
    const data = await request.get('/applications') as any
    const items = data?.items ?? data ?? []
    projects.value = items.map((a: any, idx: number) => ({
      id: a.id ?? String(idx),
      name: a.name ?? '未命名应用',
      description: a.description ?? '暂无描述',
      status: a.status ?? 'draft',
      updatedAt: a.updatedAt ?? '2026-05-30',
      pages: a.pages ?? Math.floor(Math.random() * 15) + 1,
      members: Math.floor(Math.random() * 8) + 1,
      tags: generateTags(a.name ?? '', idx),
      starred: idx < 2,
    }))
  } catch {
    projects.value = [
      { id: '1', name: 'CRM 管理后台', description: '企业级客户关系管理系统，涵盖客户管理、销售漏斗、数据分析等核心模块', status: 'published', updatedAt: '2026-05-28', pages: 12, members: 5, tags: ['CRM', '企业级'], starred: true },
      { id: '2', name: '电商订单平台', description: '全渠道电商订单管理平台，支持多店铺、多仓库、智能分单', status: 'draft', updatedAt: '2026-05-26', pages: 8, members: 3, tags: ['电商', '全渠道'], starred: true },
      { id: '3', name: 'HR 招聘系统', description: '一站式人力资源招聘管理，从简历筛选到入职全流程数字化', status: 'published', updatedAt: '2026-05-24', pages: 15, members: 7, tags: ['HR', '招聘'], starred: false },
      { id: '4', name: '数据分析门户', description: 'BI 数据可视化门户，多维度报表、实时大屏、智能告警', status: 'draft', updatedAt: '2026-05-22', pages: 6, members: 4, tags: ['BI', '可视化'], starred: false },
      { id: '5', name: '内容管理系统', description: '企业级CMS内容管理，支持多站点、多语言、SEO优化', status: 'published', updatedAt: '2026-05-20', pages: 10, members: 3, tags: ['CMS', '多站点'], starred: false },
      { id: '6', name: '运营工作台', description: '运营人员日常工作的统一入口，集成数据看板、任务管理、审批流', status: 'draft', updatedAt: '2026-05-18', pages: 5, members: 2, tags: ['运营', '工作台'], starred: false },
    ]
  }
})

/* ───── 辅助方法 ───── */
function generateTags(name: string, idx: number): string[] {
  const tagPool = [
    ['CRM', '企业级'], ['电商', '全渠道'], ['HR', '招聘'],
    ['BI', '可视化'], ['CMS', '多站点'], ['运营', '工作台'],
  ]
  return tagPool[idx % tagPool.length]
}

function getThumbGradient(name: string): string {
  const gradients = [
    'linear-gradient(135deg, #3b82f6, #6366f1)',
    'linear-gradient(135deg, #10b981, #14b8a6)',
    'linear-gradient(135deg, #8b5cf6, #a78bfa)',
    'linear-gradient(135deg, #f59e0b, #fb923c)',
    'linear-gradient(135deg, #ef4444, #f97316)',
    'linear-gradient(135deg, #06b6d4, #3b82f6)',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return gradients[Math.abs(hash) % gradients.length]
}

function statusLabel(s: string) {
  if (s === 'published') return '已发布'
  if (s === 'draft') return '草稿'
  return s
}

function statusType(s: string) {
  return s === 'published' ? 'success' : 'warning'
}

function toggleStar(p: ProjectItem) {
  p.starred = !p.starred
}

function enterDesigner(appId: string) {
  router.push(`/designer/${appId}/pages`)
}

function logout() {
  auth.logout()
  router.push('/login')
}

async function createApp() {
  await request.post('/applications', newApp.value)
  dialogVisible.value = false
  newApp.value = { name: '', description: '' }
  const data = await request.get('/applications') as any
  const items = data?.items ?? data ?? []
  projects.value = items.map((a: any, idx: number) => ({
    id: a.id ?? String(idx),
    name: a.name ?? '未命名应用',
    description: a.description ?? '暂无描述',
    status: a.status ?? 'draft',
    updatedAt: a.updatedAt ?? '2026-05-30',
    pages: a.pages ?? Math.floor(Math.random() * 15) + 1,
    members: Math.floor(Math.random() * 8) + 1,
    tags: generateTags(a.name ?? '', idx),
    starred: false,
  }))
}

function handleMenuClick(item: any) {
  if (item.action === 'new') {
    dialogVisible.value = true
  } else if (item.route) {
    router.push(item.route)
  }
}
</script>

<template>
  <div class="projects-page">
    <!-- ====== 侧边栏 ====== -->
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sidebar-logo">
        <div class="logo-icon">N</div>
        <div v-if="!sidebarCollapsed" class="logo-text">
          <span class="logo-name">NEXUS BUILDER</span>
          <span class="logo-version">v2.4.1</span>
        </div>
      </div>
      <nav class="sidebar-menu">
        <div
          v-for="(item, i) in menuItems"
          :key="i"
          class="menu-item"
          :class="{
            active: item.active,
            highlight: item.highlight,
            purple: item.purple,
          }"
          @click="handleMenuClick(item)"
        >
          <span class="menu-icon">{{ item.icon }}</span>
          <span v-if="!sidebarCollapsed" class="menu-label">{{ item.label }}</span>
        </div>
      </nav>
      <div class="sidebar-user" v-if="!sidebarCollapsed">
        <div class="user-avatar">
          {{ (auth.user?.username || 'U')[0].toUpperCase() }}
          <span class="online-dot"></span>
        </div>
        <div class="user-info">
          <div class="user-name">{{ auth.user?.username || '用户' }}</div>
          <div class="user-role">平台架构师</div>
        </div>
      </div>
    </aside>

    <!-- ====== 右侧主区域 ====== -->
    <div class="main-area">
      <!-- 顶部 Header -->
      <header class="top-header">
        <div class="header-left">
          <button class="collapse-btn" @click="sidebarCollapsed = !sidebarCollapsed">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
        <div class="header-center">
          <ThemeToggle />
          <div class="notification-bell">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span v-if="notificationCount" class="bell-badge">{{ notificationCount }}</span>
          </div>
          <div class="header-avatar">
            {{ (auth.user?.username || 'U')[0].toUpperCase() }}
            <span class="online-dot"></span>
          </div>
        </div>
      </header>

      <!-- 内容区 -->
      <div class="content-scroll">
        <!-- 页面标题区 -->
        <div class="page-title-row">
          <div class="page-title-left">
            <h1 class="page-title">我的项目</h1>
            <span class="page-subtitle">{{ totalApps }}个应用 · {{ publishedCount }}个已发布</span>
          </div>
          <button class="btn-primary" @click="dialogVisible = true">+ 新建项目</button>
        </div>

        <!-- 工具栏：搜索 + 筛选 + 视图切换 -->
        <div class="toolbar">
          <div class="toolbar-left">
            <div class="search-box">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input v-model="searchQuery" type="text" placeholder="搜索项目..." />
            </div>
            <el-select v-model="sortBy" size="default" style="width: 140px">
              <el-option label="最近更新" value="recent" />
              <el-option label="按名称" value="name" />
            </el-select>
          </div>
          <div class="toolbar-right">
            <div class="view-toggle">
              <button
                class="toggle-btn"
                :class="{ active: viewMode === 'grid' }"
                @click="viewMode = 'grid'"
                title="网格视图"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
                </svg>
              </button>
              <button
                class="toggle-btn"
                :class="{ active: viewMode === 'list' }"
                @click="viewMode = 'list'"
                title="列表视图"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- 网格视图 -->
        <div v-if="viewMode === 'grid'" class="projects-grid">
          <div
            v-for="p in filteredProjects"
            :key="p.id"
            class="project-card"
            @click="enterDesigner(p.id)"
          >
            <!-- 卡片顶部缩略图 -->
            <div class="card-thumb" :style="{ background: getThumbGradient(p.name) }">
              <span class="thumb-letter">{{ p.name[0] }}</span>
              <el-tag
                size="small"
                :type="statusType(p.status)"
                effect="dark"
                round
                class="card-status-tag"
              >
                {{ statusLabel(p.status) }}
              </el-tag>
              <button class="star-btn" :class="{ starred: p.starred }" @click.stop="toggleStar(p)">
                <svg width="16" height="16" viewBox="0 0 24 24" :fill="p.starred ? '#fbbf24' : 'none'" :stroke="p.starred ? '#fbbf24' : 'rgba(255,255,255,0.7)'" stroke-width="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </button>
            </div>
            <!-- 卡片内容 -->
            <div class="card-body">
              <h3 class="card-title">{{ p.name }}</h3>
              <p class="card-desc">{{ p.description }}</p>
              <div class="card-tags">
                <span v-for="tag in p.tags" :key="tag" class="card-tag">{{ tag }}</span>
              </div>
              <div class="card-stats">
                <span class="stat-item">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  {{ p.pages }}页
                </span>
                <span class="stat-item">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  {{ p.members }}人
                </span>
                <span class="stat-item">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  {{ p.updatedAt }}
                </span>
              </div>
            </div>
            <!-- 卡片底部操作 -->
            <div class="card-actions">
              <button class="action-btn" title="编辑" @click.stop="enterDesigner(p.id)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button class="action-btn" title="复制" @click.stop>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              </button>
              <button class="action-btn" title="分享" @click.stop>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              </button>
            </div>
          </div>
        </div>

        <!-- 列表视图 -->
        <div v-else class="projects-list">
          <div
            v-for="p in filteredProjects"
            :key="p.id"
            class="list-item"
            @click="enterDesigner(p.id)"
          >
            <div class="list-thumb" :style="{ background: getThumbGradient(p.name) }">
              {{ p.name[0] }}
            </div>
            <div class="list-info">
              <div class="list-name">{{ p.name }}</div>
              <div class="list-desc">{{ p.description }}</div>
            </div>
            <el-tag size="small" :type="statusType(p.status)" effect="dark" round>
              {{ statusLabel(p.status) }}
            </el-tag>
            <div class="list-tags">
              <span v-for="tag in p.tags" :key="tag" class="card-tag">{{ tag }}</span>
            </div>
            <span class="list-meta">{{ p.pages }}页 · {{ p.members }}人 · {{ p.updatedAt }}</span>
            <div class="list-actions">
              <button class="action-btn" title="编辑" @click.stop="enterDesigner(p.id)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button class="action-btn" title="复制" @click.stop>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              </button>
              <button class="action-btn" title="分享" @click.stop>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 新建项目 Dialog -->
    <el-dialog v-model="dialogVisible" title="创建项目" width="500px">
      <el-form>
        <el-form-item label="项目名称">
          <el-input v-model="newApp.name" placeholder="请输入项目名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="newApp.description" type="textarea" placeholder="可选描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="createApp">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
/* ========== 全局布局 ========== */
.projects-page {
  display: flex;
  height: 100%;
  background: var(--nx-bg);
  color: var(--nx-text);
  font-family: 'Inter', 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
}

/* ========== 侧边栏 ========== */
.sidebar {
  width: 240px;
  min-width: 240px;
  background: var(--nx-sidebar-bg);
  border-right: 1px solid var(--nx-border);
  display: flex;
  flex-direction: column;
  transition: width 0.3s, min-width 0.3s;
  overflow: hidden;
}
.sidebar.collapsed {
  width: 64px;
  min-width: 64px;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px 16px;
  border-bottom: 1px solid var(--nx-border);
}
.logo-icon {
  width: 36px; height: 36px; border-radius: 10px; background: var(--nx-accent); color: #fff;
  display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 16px; flex-shrink: 0;
}
.logo-text { display: flex; flex-direction: column; overflow: hidden; }
.logo-name { font-weight: 700; font-size: 14px; color: var(--nx-text); white-space: nowrap; }
.logo-version { font-size: 11px; color: var(--nx-text-subtle); }

.sidebar-menu { flex: 1; padding: 12px 8px; overflow-y: auto; }
.menu-item {
  display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px;
  cursor: pointer; font-size: 14px; color: var(--nx-sidebar-text);
  transition: background 0.2s, color 0.2s; margin-bottom: 2px; white-space: nowrap;
}
.menu-item:hover { background: var(--nx-sidebar-hover); }
.menu-item.active { background: var(--nx-sidebar-active); color: var(--nx-sidebar-active-text); font-weight: 600; }
.menu-item.highlight { color: var(--nx-accent); font-weight: 600; }
.menu-item.purple { color: var(--nx-purple); font-weight: 500; }
.menu-icon { font-size: 16px; flex-shrink: 0; width: 20px; text-align: center; }

.sidebar-user { display: flex; align-items: center; gap: 10px; padding: 16px; border-top: 1px solid var(--nx-border); }
.user-avatar {
  width: 36px; height: 36px; border-radius: 10px; background: var(--nx-accent); color: #fff;
  display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px;
  position: relative; flex-shrink: 0;
}
.online-dot {
  position: absolute; bottom: -1px; right: -1px; width: 10px; height: 10px;
  background: var(--nx-success); border-radius: 50%; border: 2px solid var(--nx-sidebar-bg);
}
.user-info { overflow: hidden; }
.user-name { font-size: 13px; font-weight: 600; color: var(--nx-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.user-role { font-size: 11px; color: var(--nx-text-subtle); }

/* ========== 右侧主区域 ========== */
.main-area { flex: 1; display: flex; flex-direction: column; min-width: 0; overflow: hidden; }

/* ====== 顶部 Header ====== */
.top-header {
  display: flex; align-items: center; justify-content: flex-end; gap: 10px;
  padding: 0 24px; height: 56px; background: var(--nx-surface);
  border-bottom: 1px solid var(--nx-border); flex-shrink: 0;
}
.header-left { display: flex; align-items: center; gap: 12px; }
.collapse-btn {
  display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;
  border: 1px solid var(--nx-border); border-radius: 8px; background: transparent;
  color: var(--nx-text-muted); cursor: pointer; transition: all 0.2s;
}
.collapse-btn:hover { color: var(--nx-accent); border-color: var(--nx-accent); }
.header-center { display: flex; align-items: center; gap: 10px; }
.btn-primary {
  padding: 8px 16px; border-radius: 10px; border: none; background: var(--nx-accent);
  color: #fff; font-size: 13px; font-weight: 600; cursor: pointer; transition: opacity 0.2s; white-space: nowrap;
}
.btn-primary:hover { opacity: 0.85; }
.notification-bell {
  position: relative; display: flex; align-items: center; justify-content: center;
  width: 36px; height: 36px; border-radius: 10px; cursor: pointer; color: var(--nx-text-muted); transition: background 0.2s;
}
.notification-bell:hover { background: var(--nx-hover); }
.bell-badge {
  position: absolute; top: 2px; right: 2px; min-width: 16px; height: 16px; padding: 0 4px;
  background: var(--nx-badge-bg); color: var(--nx-badge-text); font-size: 10px; font-weight: 700;
  border-radius: 8px; display: flex; align-items: center; justify-content: center;
}
.header-avatar {
  width: 36px; height: 36px; border-radius: 50%; background: var(--nx-accent); color: #fff;
  display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px;
  position: relative; cursor: pointer;
}

/* ====== 内容滚动区 ====== */
.content-scroll { flex: 1; overflow-y: auto; padding: 24px; }

/* ====== 页面标题行 ====== */
.page-title-row {
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;
}
.page-title-left { display: flex; align-items: baseline; gap: 12px; }
.page-title { font-size: 22px; font-weight: 700; color: var(--nx-text); margin: 0; }
.page-subtitle { font-size: 13px; color: var(--nx-text-subtle); }

/* ====== 工具栏 ====== */
.toolbar {
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; gap: 12px;
}
.toolbar-left { display: flex; align-items: center; gap: 12px; }
.search-box {
  display: flex; align-items: center; gap: 8px; background: var(--nx-input-bg);
  border: 1px solid var(--nx-border); border-radius: 10px; padding: 8px 14px;
  width: 280px; transition: border-color 0.2s;
}
.search-box:focus-within { border-color: var(--nx-accent); }
.search-box svg { color: var(--nx-text-subtle); flex-shrink: 0; }
.search-box input { border: none; outline: none; background: transparent; color: var(--nx-text); font-size: 13px; width: 100%; }
.search-box input::placeholder { color: var(--nx-text-subtle); }

.toolbar-right { display: flex; align-items: center; gap: 8px; }
.view-toggle { display: flex; border: 1px solid var(--nx-border); border-radius: 8px; overflow: hidden; }
.toggle-btn {
  display: flex; align-items: center; justify-content: center; width: 34px; height: 32px;
  border: none; background: transparent; color: var(--nx-text-subtle); cursor: pointer; transition: all 0.2s;
}
.toggle-btn.active { background: var(--nx-accent); color: #fff; }
.toggle-btn:hover:not(.active) { background: var(--nx-hover); color: var(--nx-text); }

/* ====== 网格视图 ====== */
.projects-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;
}
.project-card {
  background: var(--nx-card-bg); border: 1px solid var(--nx-border); border-radius: 16px;
  overflow: hidden; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;
}
.project-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px var(--nx-shadow);
}

/* 卡片缩略图 */
.card-thumb {
  height: 140px; display: flex; align-items: center; justify-content: center;
  position: relative; overflow: hidden;
}
.thumb-letter { font-size: 48px; font-weight: 800; color: rgba(255,255,255,0.3); }
.card-status-tag { position: absolute; top: 12px; left: 12px; }
.star-btn {
  position: absolute; top: 10px; right: 10px; width: 30px; height: 30px;
  border: none; background: rgba(0,0,0,0.25); border-radius: 50%; cursor: pointer;
  display: flex; align-items: center; justify-content: center; transition: background 0.2s;
}
.star-btn:hover { background: rgba(0,0,0,0.45); }
.star-btn.starred { background: rgba(251,191,36,0.2); }

/* 卡片内容 */
.card-body { padding: 16px; }
.card-title {
  font-size: 15px; font-weight: 700; color: var(--nx-text); margin: 0 0 6px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.card-desc {
  font-size: 13px; color: var(--nx-text-subtle); margin: 0 0 10px;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  overflow: hidden; line-height: 1.5; min-height: 39px;
}
.card-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
.card-tag {
  font-size: 11px; padding: 2px 8px; border-radius: 6px;
  background: var(--nx-hover); color: var(--nx-text-muted); font-weight: 500;
}
.card-stats {
  display: flex; gap: 14px; font-size: 12px; color: var(--nx-text-subtle);
}
.stat-item { display: flex; align-items: center; gap: 4px; }

/* 卡片底部操作 */
.card-actions {
  display: flex; align-items: center; gap: 4px; padding: 8px 16px 14px;
}
.action-btn {
  display: flex; align-items: center; justify-content: center; width: 30px; height: 30px;
  border: 1px solid var(--nx-border); border-radius: 8px; background: transparent;
  color: var(--nx-text-subtle); cursor: pointer; transition: all 0.2s;
}
.action-btn:hover {
  color: var(--nx-accent); border-color: var(--nx-accent); background: var(--nx-sidebar-active);
}

/* ====== 列表视图 ====== */
.projects-list { display: flex; flex-direction: column; gap: 8px; }
.list-item {
  display: flex; align-items: center; gap: 14px; padding: 14px 16px;
  background: var(--nx-card-bg); border: 1px solid var(--nx-border); border-radius: 12px;
  cursor: pointer; transition: background 0.2s;
}
.list-item:hover { background: var(--nx-hover); }
.list-thumb {
  width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center;
  justify-content: center; color: #fff; font-weight: 700; font-size: 18px; flex-shrink: 0;
}
.list-info { flex: 1; min-width: 0; }
.list-name { font-size: 14px; font-weight: 600; color: var(--nx-text); }
.list-desc {
  font-size: 12px; color: var(--nx-text-subtle); white-space: nowrap;
  overflow: hidden; text-overflow: ellipsis;
}
.list-tags { display: flex; gap: 4px; flex-shrink: 0; }
.list-meta { font-size: 12px; color: var(--nx-text-subtle); white-space: nowrap; flex-shrink: 0; }
.list-actions { display: flex; gap: 4px; flex-shrink: 0; }

/* ====== 响应式 ====== */
@media (max-width: 1100px) {
  .projects-grid { grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); }
}
@media (max-width: 768px) {
  .sidebar { display: none; }
  .projects-grid { grid-template-columns: 1fr; }
  .page-title-row { flex-direction: column; align-items: flex-start; gap: 12px; }
  .toolbar { flex-direction: column; align-items: stretch; }
  .search-box { width: 100%; }
}
</style>
