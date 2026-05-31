<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import request from '@/utils/request'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import ThemeToggle from '@/components/ThemeToggle.vue'

/* ───── 类型 ───── */
interface AppItem {
  id: string
  name: string
  description?: string
  status: string
  updatedAt: string
  pages?: number
}

interface Activity {
  icon: string
  user: string
  action: string
  target: string
  time: string
}

interface TeamMember {
  name: string
  role: string
  avatar?: string
  online: boolean
}

/* ───── 基础 ───── */
const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const theme = useThemeStore()
const apps = ref<AppItem[]>([])
const dialogVisible = ref(false)
const newApp = ref({ name: '', description: '' })
const sidebarCollapsed = ref(false)

/* ───── 侧边栏菜单 ───── */
const menuItems = [
  { icon: '➕', label: '新建项目', action: 'new', highlight: true },
  { icon: '📌', label: '工作台', route: '/dashboard' },
  { icon: '📁', label: '我的项目', route: '/projects' },
  { icon: '🛠', label: '编辑器', route: '/designer' },
  { icon: '🧩', label: '组件库', route: '' },
  { icon: '👥', label: '团队协作', route: '' },
  { icon: '💡', label: 'AI 助手已就绪', action: 'ai', purple: true },
  { icon: '⚙️', label: '系统设置', route: '/admin' },
]

/* ───── 当前菜单高亮 ───── */
const currentRoute = computed(() => route.path)
function isMenuActive(item: any): boolean {
  if (item.route) return currentRoute.value === item.route
  return !!item.active
}

/* ───── 日期与问候 ───── */
const today = computed(() => {
  const d = new Date()
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日，${weekdays[d.getDay()]}`
})

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 6) return '凌晨好'
  if (h < 12) return '早上好'
  if (h < 14) return '中午好'
  if (h < 18) return '下午好'
  return '晚上好'
})

/* ───── 指标卡 ───── */
const metrics = ref([
  { title: '应用总数', value: 47, unit: '', trend: '↑6 本月', up: true, color: 'var(--nx-metric-blue)' },
  { title: '活跃用户', value: 1284, unit: '', trend: '↑18.3%', up: true, color: 'var(--nx-metric-teal)' },
  { title: '页面发布量', value: 312, unit: '', trend: '↑41 本周', up: true, color: 'var(--nx-metric-purple)' },
  { title: 'API 调用次数', value: 2.87, unit: 'M', trend: '↓2.7%', up: false, color: 'var(--nx-metric-orange)' },
])

/* ───── 最近项目 ───── */
const recentProjects = ref<AppItem[]>([])

/* ───── 柱状图数据 ───── */
const chartData = ref([
  { label: 'CRM', value: 50 },
  { label: '电商', value: 40 },
  { label: 'HR', value: 70 },
  { label: 'BI', value: 30 },
  { label: '运营', value: 45 },
  { label: 'CMS', value: 60 },
])
const chartMax = computed(() => Math.max(...chartData.value.map(d => d.value)))

/* ───── 最新动态 ───── */
const activities = ref<Activity[]>([
  { icon: '✅', user: '林梓桐', action: '发布了', target: 'CRM 管理后台 v2.3', time: '5分钟前' },
  { icon: '✏️', user: '沈思远', action: '修改了', target: '数据分析门户 — 折线图组件', time: '23分钟前' },
  { icon: '📝', user: '方晓宇', action: '新建了', target: '内容管理系统 — 媒体库页面', time: '1小时前' },
  { icon: '💬', user: '吴静雯', action: '评论了', target: '电商订单平台 — 物流追踪', time: '2小时前' },
])

/* ───── 团队成员 ───── */
const teamMembers = ref<TeamMember[]>([
  { name: '沈思远', role: '平台架构师', online: true },
  { name: '林梓桐', role: '产品设计师', online: false },
  { name: '方晓宇', role: '全栈工程师', online: true },
  { name: '吴静雯', role: '数据分析师', online: true },
  { name: '赵泽昊', role: '后端工程师', online: true },
])

/* ───── 通知 ───── */
const notificationCount = ref(4)

/* ───── 生命周期 ───── */
onMounted(async () => {
  await auth.fetchProfile()
  try {
    const data = await request.get('/applications') as any
    const items = data?.items ?? data ?? []
    apps.value = items
    recentProjects.value = items.slice(0, 4).map((a: AppItem) => ({
      ...a,
      pages: a.pages ?? Math.floor(Math.random() * 15) + 1,
    }))
  } catch {
    // 使用模拟数据
    recentProjects.value = [
      { id: '1', name: 'CRM 管理后台', status: 'published', updatedAt: '2025-01-14', pages: 12 },
      { id: '2', name: '电商订单平台', status: 'draft', updatedAt: '2025-01-12', pages: 8 },
      { id: '3', name: 'HR 招聘系统', status: 'published', updatedAt: '2025-01-10', pages: 15 },
      { id: '4', name: '数据分析门户', status: 'draft', updatedAt: '2025-01-09', pages: 6 },
    ]
  }
})

/* ───── 方法 ───── */
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
  apps.value = data?.items ?? data ?? []
}

function handleMenuClick(item: any) {
  if (item.action === 'new') {
    dialogVisible.value = true
  } else if (item.route) {
    router.push(item.route)
  }
}

function formatValue(val: number): string {
  return val >= 1000 ? val.toLocaleString() : String(val)
}

function statusLabel(s: string) {
  if (s === 'published') return '已发布'
  if (s === 'draft') return '草稿'
  return s
}

function statusType(s: string) {
  return s === 'published' ? 'success' : 'warning'
}

function generateSparkline(index: number): string {
  const seeds = [
    [10, 18, 12, 22, 16, 25, 20],
    [15, 12, 20, 18, 25, 22, 28],
    [8, 14, 10, 20, 15, 24, 22],
    [20, 18, 15, 16, 12, 10, 8],
  ]
  const pts = seeds[index % seeds.length]
  return pts.map((y, i) => `${i * (100 / (pts.length - 1))},${30 - y}`).join(' ')
}

function getThumbColor(name: string): string {
  const colors = [
    'linear-gradient(135deg, #3b82f6, #6366f1)',
    'linear-gradient(135deg, #10b981, #14b8a6)',
    'linear-gradient(135deg, #8b5cf6, #a78bfa)',
    'linear-gradient(135deg, #f59e0b, #fb923c)',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}
</script>

<template>
  <div class="dashboard">
    <!-- ====== 侧边栏 ====== -->
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <!-- Logo -->
      <div class="sidebar-logo">
        <div class="logo-icon">N</div>
        <div v-if="!sidebarCollapsed" class="logo-text">
          <span class="logo-name">NEXUS BUILDER</span>
          <span class="logo-version">v2.4.1</span>
        </div>
      </div>

      <!-- 菜单 -->
      <nav class="sidebar-menu">
        <div
          v-for="(item, i) in menuItems"
          :key="i"
          class="menu-item"
          :class="{
            active: isMenuActive(item),
            highlight: item.highlight,
            purple: item.purple,
          }"
          @click="handleMenuClick(item)"
        >
          <span class="menu-icon">{{ item.icon }}</span>
          <span v-if="!sidebarCollapsed" class="menu-label">{{ item.label }}</span>
        </div>
      </nav>

      <!-- 底部用户信息 -->
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
          <div class="header-title">
            <h1>工作台</h1>
            <span class="header-date">{{ today }}</span>
          </div>
        </div>

        <div class="header-center">
          <div class="search-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input type="text" placeholder="搜索项目、组件…" />
          </div>
        </div>

        <div class="header-right">
          <button class="btn-primary" @click="dialogVisible = true">+ 新建应用</button>
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
        <!-- 问候卡片 -->
        <div class="greeting-card">
          <div class="greeting-content">
            <h2>{{ greeting }}，{{ auth.user?.username || '用户' }}</h2>
            <p>今日有 3 个项目待发布审批，AI 已为您生成 2 份优化建议</p>
          </div>
          <a class="greeting-link">AI 建议就绪 →</a>
        </div>

        <!-- 指标卡行 -->
        <div class="metrics-row">
          <div v-for="(m, i) in metrics" :key="i" class="metric-card">
            <div class="metric-header">
              <span class="metric-title">{{ m.title }}</span>
              <span class="metric-trend" :class="{ down: !m.up }">{{ m.trend }}</span>
            </div>
            <div class="metric-value" :style="{ color: m.color }">
              {{ formatValue(m.value) }}<span v-if="m.unit" class="metric-unit">{{ m.unit }}</span>
            </div>
            <!-- 简易趋势线 -->
            <svg class="metric-sparkline" viewBox="0 0 100 30" preserveAspectRatio="none">
              <polyline
                :points="generateSparkline(i)"
                fill="none"
                :stroke="m.color"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
        </div>

        <!-- 中间区域：最近项目 + 柱状图 / 动态 -->
        <div class="middle-row">
          <!-- 左列：最近项目 + 柱状图 -->
          <div class="middle-left">
            <!-- 最近项目 -->
            <div class="section-card">
              <div class="section-header">
                <h3>最近项目</h3>
                <a class="section-link">查看全部 &gt;</a>
              </div>
              <div class="project-list">
                <div
                  v-for="p in recentProjects"
                  :key="p.id"
                  class="project-item"
                  @click="enterDesigner(p.id)"
                >
                  <div class="project-thumb" :style="{ background: getThumbColor(p.name) }">
                    {{ p.name[0] }}
                  </div>
                  <div class="project-info">
                    <div class="project-name">{{ p.name }}</div>
                    <div class="project-meta">{{ p.updatedAt }} · {{ p.pages || 0 }}页</div>
                  </div>
                  <el-tag size="small" :type="statusType(p.status)" effect="dark" round>
                    {{ statusLabel(p.status) }}
                  </el-tag>
                </div>
              </div>
            </div>

            <!-- 柱状图 -->
            <div class="section-card">
              <div class="section-header">
                <h3>各类应用页面数分布</h3>
              </div>
              <div class="chart-container">
                <div class="bar-chart">
                  <div class="bar-y-axis">
                    <span>{{ chartMax }}</span>
                    <span>{{ Math.round(chartMax * 0.5) }}</span>
                    <span>0</span>
                  </div>
                  <div class="bar-area">
                    <div v-for="(d, i) in chartData" :key="i" class="bar-col">
                      <div
                        class="bar"
                        :style="{ height: (d.value / chartMax * 100) + '%', background: 'var(--nx-accent)' }"
                      >
                        <span class="bar-val">{{ d.value }}</span>
                      </div>
                      <span class="bar-label">{{ d.label }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 右列：最新动态 -->
          <div class="middle-right">
            <div class="section-card">
              <div class="section-header">
                <h3>最新动态</h3>
              </div>
              <div class="activity-list">
                <div v-for="(a, i) in activities" :key="i" class="activity-item">
                  <span class="activity-icon">{{ a.icon }}</span>
                  <div class="activity-content">
                    <span class="activity-user">{{ a.user }}</span>
                    <span class="activity-action">{{ a.action }}</span>
                    <span class="activity-target">{{ a.target }}</span>
                  </div>
                  <span class="activity-time">{{ a.time }}</span>
                </div>
              </div>
            </div>

            <!-- 团队成员 -->
            <div class="section-card">
              <div class="section-header">
                <h3>团队成员</h3>
                <a class="section-link">管理团队 →</a>
              </div>
              <div class="team-grid">
                <div v-for="(m, i) in teamMembers" :key="i" class="team-card">
                  <div class="team-avatar" :class="{ offline: !m.online }">
                    {{ m.name[0] }}
                    <span v-if="m.online" class="online-dot"></span>
                  </div>
                  <div class="team-name">{{ m.name }}</div>
                  <div class="team-role">{{ m.role }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 新建应用 Dialog -->
    <el-dialog v-model="dialogVisible" title="创建应用" width="500px">
      <el-form>
        <el-form-item label="应用名称">
          <el-input v-model="newApp.name" placeholder="请输入应用名称" />
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
.dashboard {
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
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--nx-accent);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 16px;
  flex-shrink: 0;
}
.logo-text {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.logo-name {
  font-weight: 700;
  font-size: 14px;
  color: var(--nx-text);
  white-space: nowrap;
}
.logo-version {
  font-size: 11px;
  color: var(--nx-text-subtle);
}

.sidebar-menu {
  flex: 1;
  padding: 12px 8px;
  overflow-y: auto;
}
.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  color: var(--nx-sidebar-text);
  transition: background 0.2s, color 0.2s;
  margin-bottom: 2px;
  white-space: nowrap;
}
.menu-item:hover {
  background: var(--nx-sidebar-hover);
}
.menu-item.active {
  background: var(--nx-sidebar-active);
  color: var(--nx-sidebar-active-text);
  font-weight: 600;
}
.menu-item.highlight {
  color: var(--nx-accent);
  font-weight: 600;
}
.menu-item.purple {
  color: var(--nx-purple);
  font-weight: 500;
}
.menu-icon {
  font-size: 16px;
  flex-shrink: 0;
  width: 20px;
  text-align: center;
}

.sidebar-user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px;
  border-top: 1px solid var(--nx-border);
}
.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--nx-accent);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  position: relative;
  flex-shrink: 0;
}
.online-dot {
  position: absolute;
  bottom: -1px;
  right: -1px;
  width: 10px;
  height: 10px;
  background: var(--nx-success);
  border-radius: 50%;
  border: 2px solid var(--nx-sidebar-bg);
}
.user-info {
  overflow: hidden;
}
.user-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--nx-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.user-role {
  font-size: 11px;
  color: var(--nx-text-subtle);
}

/* ========== 右侧主区域 ========== */
.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}

/* ====== 顶部 Header ====== */
.top-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 24px;
  height: 64px;
  background: var(--nx-surface);
  border-bottom: 1px solid var(--nx-border);
  flex-shrink: 0;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}
.collapse-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--nx-border);
  border-radius: 8px;
  background: transparent;
  color: var(--nx-text-muted);
  cursor: pointer;
  transition: all 0.2s;
}
.collapse-btn:hover {
  color: var(--nx-accent);
  border-color: var(--nx-accent);
}
.header-title {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}
.header-title h1 {
  font-size: 16px;
  font-weight: 700;
  margin: 0;
  color: var(--nx-text);
  line-height: 1.3;
}
.header-date {
  font-size: 12px;
  color: var(--nx-text-subtle);
  line-height: 1.3;
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
  min-width: 0;
}
.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--nx-input-bg);
  border: 1px solid var(--nx-border);
  border-radius: 10px;
  padding: 8px 14px;
  width: 100%;
  max-width: 420px;
  transition: border-color 0.2s;
}
.search-box:focus-within {
  border-color: var(--nx-accent);
}
.search-box svg {
  color: var(--nx-text-subtle);
  flex-shrink: 0;
}
.search-box input {
  border: none;
  outline: none;
  background: transparent;
  color: var(--nx-text);
  font-size: 13px;
  width: 100%;
}
.search-box input::placeholder {
  color: var(--nx-text-subtle);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.btn-primary {
  padding: 8px 16px;
  border-radius: 10px;
  border: none;
  background: var(--nx-accent);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  white-space: nowrap;
}
.btn-primary:hover {
  opacity: 0.85;
}

.notification-bell {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  cursor: pointer;
  color: var(--nx-text-muted);
  transition: background 0.2s;
}
.notification-bell:hover {
  background: var(--nx-hover);
}
.bell-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  background: var(--nx-badge-bg);
  color: var(--nx-badge-text);
  font-size: 10px;
  font-weight: 700;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--nx-accent);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  position: relative;
  cursor: pointer;
}

/* ====== 内容滚动区 ====== */
.content-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

/* ====== 问候卡片 ====== */
.greeting-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--nx-greeting-gradient);
  border-radius: 16px;
  padding: 24px 28px;
  margin-bottom: 20px;
  color: var(--nx-greeting-text);
}
.greeting-card h2 {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 6px;
}
.greeting-card p {
  font-size: 14px;
  opacity: 0.8;
  margin: 0;
}
.greeting-link {
  font-size: 14px;
  font-weight: 600;
  opacity: 0.9;
  cursor: pointer;
  white-space: nowrap;
  transition: opacity 0.2s;
}
.greeting-link:hover {
  opacity: 1;
}

/* ====== 指标卡行 ====== */
.metrics-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}
.metric-card {
  background: var(--nx-card-bg);
  border: 1px solid var(--nx-border);
  border-radius: 14px;
  padding: 18px 20px;
  position: relative;
  overflow: hidden;
}
.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.metric-title {
  font-size: 13px;
  color: var(--nx-text-muted);
}
.metric-trend {
  font-size: 12px;
  font-weight: 600;
  color: var(--nx-success);
  background: rgba(16, 185, 129, 0.1);
  padding: 2px 8px;
  border-radius: 20px;
}
.metric-trend.down {
  color: var(--nx-danger);
  background: rgba(239, 68, 68, 0.1);
}
.metric-value {
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 8px;
}
.metric-unit {
  font-size: 16px;
  font-weight: 600;
}
.metric-sparkline {
  width: 100%;
  height: 30px;
}

/* ====== 中间行 ====== */
.middle-row {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 20px;
}
.middle-left {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.middle-right {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ====== Section 卡片 ====== */
.section-card {
  background: var(--nx-card-bg);
  border: 1px solid var(--nx-border);
  border-radius: 14px;
  padding: 20px;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.section-header h3 {
  font-size: 15px;
  font-weight: 700;
  color: var(--nx-text);
  margin: 0;
}
.section-link {
  font-size: 13px;
  color: var(--nx-accent);
  cursor: pointer;
  transition: opacity 0.2s;
}
.section-link:hover {
  opacity: 0.8;
}

/* ====== 项目列表 ====== */
.project-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.project-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s;
}
.project-item:hover {
  background: var(--nx-hover);
}
.project-thumb {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  font-size: 16px;
  flex-shrink: 0;
}
.project-info {
  flex: 1;
  min-width: 0;
}
.project-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--nx-text);
}
.project-meta {
  font-size: 12px;
  color: var(--nx-text-subtle);
}

/* ====== 柱状图 ====== */
.chart-container {
  padding-top: 8px;
}
.bar-chart {
  display: flex;
  gap: 0;
  height: 180px;
}
.bar-y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-right: 8px;
  font-size: 11px;
  color: var(--nx-text-subtle);
  text-align: right;
  min-width: 28px;
}
.bar-area {
  flex: 1;
  display: flex;
  align-items: flex-end;
  gap: 12px;
  padding-bottom: 24px;
  position: relative;
}
.bar-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  justify-content: flex-end;
  position: relative;
}
.bar {
  width: 70%;
  max-width: 40px;
  border-radius: 6px 6px 0 0;
  min-height: 4px;
  position: relative;
  transition: height 0.5s ease;
}
.bar-val {
  position: absolute;
  top: -18px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 11px;
  font-weight: 600;
  color: var(--nx-text-muted);
}
.bar-label {
  position: absolute;
  bottom: -20px;
  font-size: 11px;
  color: var(--nx-text-subtle);
}

/* ====== 动态列表 ====== */
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.activity-item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}
.activity-icon {
  font-size: 16px;
  flex-shrink: 0;
  margin-top: 2px;
}
.activity-content {
  flex: 1;
  font-size: 13px;
  line-height: 1.5;
}
.activity-user {
  font-weight: 600;
  color: var(--nx-text);
}
.activity-action {
  color: var(--nx-text-muted);
}
.activity-target {
  color: var(--nx-accent);
}
.activity-time {
  font-size: 11px;
  color: var(--nx-text-subtle);
  white-space: nowrap;
  flex-shrink: 0;
  margin-top: 2px;
}

/* ====== 团队成员 ====== */
.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
}
.team-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px 8px;
  border-radius: 12px;
  background: var(--nx-hover);
  transition: background 0.2s;
}
.team-card:hover {
  background: var(--nx-sidebar-hover);
}
.team-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: var(--nx-accent);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  position: relative;
  opacity: 1;
}
.team-avatar.offline {
  opacity: 0.5;
}
.team-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--nx-text);
}
.team-role {
  font-size: 11px;
  color: var(--nx-text-subtle);
}

/* ====== 响应式 ====== */
@media (max-width: 1100px) {
  .metrics-row {
    grid-template-columns: repeat(2, 1fr);
  }
  .middle-row {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 768px) {
  .sidebar {
    display: none;
  }
  .metrics-row {
    grid-template-columns: 1fr;
  }
  .top-header {
    flex-wrap: wrap;
    height: auto;
    padding: 12px 16px;
    gap: 10px;
  }
  .header-center {
    max-width: 100%;
    order: 3;
    width: 100%;
  }
}
</style>
