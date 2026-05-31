<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'
import JSEncrypt from 'jsencrypt'
import request from '@/utils/request'

const router = useRouter()
const auth = useAuthStore()

// ========== 表单模式 ==========
const isLogin = ref(true) // true=登录, false=注册

// ========== 登录表单 ==========
const username = ref('')
const password = ref('')
const showPwd = ref(false)
const loading = ref(false)
const captchaCode = ref('')
const captchaId = ref('')
const captchaSvg = ref('')

// ========== 注册表单 ==========
const regUsername = ref('')
const regEmail = ref('')
const regPassword = ref('')
const regConfirmPwd = ref('')
const regShowPwd = ref(false)
const regLoading = ref(false)

// ========== RSA 公钥 ==========
const publicKey = ref('')

// ========== 验证码 ==========
async function fetchCaptcha() {
  try {
    const data = await request.get('/auth/captcha') as any
    captchaId.value = data.captchaId
    captchaSvg.value = data.svg
    captchaCode.value = ''
  } catch {
    ElMessage.error('获取验证码失败')
  }
}

// ========== RSA 加密密码 ==========
function encryptPassword(raw: string): string {
  if (!publicKey.value) return raw
  const encrypt = new JSEncrypt()
  encrypt.setPublicKey(publicKey.value)
  const encrypted = encrypt.encrypt(raw)
  return encrypted || raw
}

// ========== 初始化 ==========
onMounted(async () => {
  // 获取 RSA 公钥
  try {
    const data = await request.get('/auth/public-key') as any
    console.log(data)
    publicKey.value = data.publicKey
  } catch (error) {
    console.log(error);
    console.warn('获取 RSA 公钥失败，将使用明文传输')
  }
  // 获取验证码
  fetchCaptcha()
})

// ========== 登录 ==========
async function handleSignIn() {
  if (!username.value) {
    ElMessage.warning('请输入用户名')
    return
  }
  if (!password.value) {
    ElMessage.warning('请输入密码')
    return
  }
  if (!captchaCode.value) {
    ElMessage.warning('请输入验证码')
    return
  }

  loading.value = true
  try {
    const encryptedPwd = encryptPassword(password.value)
    await auth.login(username.value, encryptedPwd, captchaId.value, captchaCode.value)
    ElMessage.success('欢迎回来！正在进入工作台...')
    router.push('/dashboard')
  } catch {
    // 登录失败刷新验证码
    fetchCaptcha()
  } finally {
    loading.value = false
  }
}

// ========== 注册 ==========
async function handleRegister() {
  if (!regUsername.value) {
    ElMessage.warning('请输入用户名')
    return
  }
  if (!regEmail.value) {
    ElMessage.warning('请输入邮箱')
    return
  }
  if (!/^[^@]+@[^@]+\.[^@]+$/.test(regEmail.value)) {
    ElMessage.warning('请输入有效的邮箱地址')
    return
  }
  if (!regPassword.value) {
    ElMessage.warning('请输入密码')
    return
  }
  if (regPassword.value.length < 6) {
    ElMessage.warning('密码长度不能少于6位')
    return
  }
  if (regPassword.value !== regConfirmPwd.value) {
    ElMessage.warning('两次密码输入不一致')
    return
  }

  regLoading.value = true
  try {
    const encryptedPwd = encryptPassword(regPassword.value)
    await auth.register(regUsername.value, encryptedPwd, regEmail.value)
    ElMessage.success('注册成功！正在进入工作台...')
    router.push('/dashboard')
  } finally {
    regLoading.value = false
  }
}

// ========== 切换模式 ==========
function switchMode() {
  isLogin.value = !isLogin.value
}

// ========== OAuth 跳转 ==========
function gotoWechat() {
  window.location.href = '/api/auth/wechat'
}

function gotoGithub() {
  window.location.href = '/api/auth/github'
}

// ========== 浮动节点/功能徽章/统计 ==========
const floatingNodes = [
  { top: '18%', left: '12%', size: 8, delay: '0s', color: '#3b82f6' },
  { top: '42%', left: '8%', size: 6, delay: '1.2s', color: '#14b8a6' },
  { top: '65%', left: '18%', size: 10, delay: '0.6s', color: '#8b5cf6' },
  { top: '25%', left: '78%', size: 7, delay: '0.3s', color: '#3b82f6' },
  { top: '58%', left: '85%', size: 9, delay: '1.5s', color: '#14b8a6' },
  { top: '78%', left: '70%', size: 5, delay: '0.9s', color: '#f59e0b' },
  { top: '12%', left: '55%', size: 6, delay: '1.8s', color: '#8b5cf6' },
  { top: '88%', left: '40%', size: 8, delay: '0.4s', color: '#3b82f6' },
]

const features = [
  { icon: 'zap', label: '可视化拖拽构建' },
  { icon: 'cpu', label: 'AI 智能生成' },
  { icon: 'shield', label: '企业级权限管控' },
]

const stats = [
  { value: '47+', label: '应用模板' },
  { value: '1,284', label: '活跃用户' },
  { value: '99.7%', label: '平台可用率' },
]
</script>

<template>
  <div class="login-page">
    <!-- 左上角品牌标识（固定定位，不受面板顺序影响） -->
    <div class="brand-header">
      <div class="brand-icon">
        <!-- LayersIcon -->
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      </div>
      <div class="brand-text">
        <span class="brand-bold">NEXUS</span>
        <span class="brand-light">BUILDER</span>
      </div>
    </div>

    <!-- ── 左侧面板：品牌可视化（原右侧，现移到左边） ── -->
    <div class="left-panel left-side">
      <!-- 网格背景 -->
      <div class="grid-bg" />

      <!-- 浮动节点 -->
      <div
        v-for="(node, i) in floatingNodes"
        :key="i"
        class="floating-node"
        :style="{
          top: node.top,
          left: node.left,
          width: node.size + 'px',
          height: node.size + 'px',
          backgroundColor: node.color,
          animationDelay: node.delay,
          animationDuration: (3 + i * 0.4) + 's',
          boxShadow: '0 0 ' + node.size * 2 + 'px ' + node.color + '80',
        }"
      />

      <!-- 连接线 SVG -->
      <svg class="connection-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
        <line x1="12" y1="18" x2="50" y2="50" stroke="#3b82f6" stroke-width="0.2" />
        <line x1="8" y1="42" x2="50" y2="50" stroke="#14b8a6" stroke-width="0.2" />
        <line x1="18" y1="65" x2="50" y2="50" stroke="#8b5cf6" stroke-width="0.2" />
        <line x1="78" y1="25" x2="50" y2="50" stroke="#3b82f6" stroke-width="0.2" />
        <line x1="85" y1="58" x2="50" y2="50" stroke="#14b8a6" stroke-width="0.2" />
        <line x1="70" y1="78" x2="50" y2="50" stroke="#f59e0b" stroke-width="0.2" />
      </svg>

      <!-- 中心 Logo 区域 -->
      <div class="hero-center">
        <!-- 脉冲环 -->
        <div class="pulse-ring pulse-ring-1" />
        <div class="pulse-ring pulse-ring-2" />

        <!-- 主图标容器 -->
        <div class="hero-icon-float">
          <div class="hero-icon-outer">
            <div class="hero-icon-inner">
              <!-- LayersIcon -->
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
            </div>
          </div>
        </div>

        <h2 class="hero-title">
          构建未来，
          <!-- <br /> -->
          <span class="hero-title-gradient">更快一步</span>
        </h2>
        <p class="hero-subtitle">低代码创新平台 · 企业级应用构建引擎</p>

        <!-- 功能徽章 -->
        <div class="feature-badges">
          <div
            v-for="(feat, i) in features"
            :key="i"
            class="feature-badge"
            :style="{ animationDelay: i * 0.15 + 's' }"
          >
            <div class="feature-badge-icon">
              <!-- ZapIcon -->
              <svg v-if="feat.icon === 'zap'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--nx-accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              <!-- CpuIcon -->
              <svg v-else-if="feat.icon === 'cpu'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--nx-accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="4" y="4" width="16" height="16" rx="2" />
                <rect x="9" y="9" width="6" height="6" />
                <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
              </svg>
              <!-- ShieldIcon -->
              <svg v-else-if="feat.icon === 'shield'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--nx-accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <span class="feature-badge-text">{{ feat.label }}</span>
          </div>
        </div>
      </div>

      <!-- 底部统计栏 -->
      <div class="stats-bar">
        <div v-for="(s, i) in stats" :key="i" class="stat-item">
          <span class="stat-value">{{ s.value }}</span>
          <span class="stat-label">{{ s.label }}</span>
        </div>
      </div>
    </div>

    <!-- ── 右侧面板：登录/注册表单（原左侧，现移到右边） ── -->
    <div class="right-panel right-side">
      <!-- 表单区域 -->
      <div class="form-area">
        <div class="form-container">
          <!-- ========== 登录表单 ========== -->
          <template v-if="isLogin">
            <div class="form-header">
              <h1 class="form-title">欢迎回来</h1>
              <p class="form-subtitle">登录您的低代码工作台，继续构建出色的应用</p>
            </div>

            <form class="login-form" @submit.prevent="handleSignIn">
              <!-- 用户名 -->
              <div class="field-group">
                <label class="field-label">用户名</label>
                <div class="input-wrapper">
                  <!-- UserIcon -->
                  <svg class="input-icon-left" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <input
                    v-model="username"
                    type="text"
                    placeholder="请输入用户名"
                    class="nx-input"
                  />
                </div>
              </div>

              <!-- 密码 -->
              <div class="field-group">
                <div class="field-label-row">
                  <label class="field-label">密码</label>
                  <button type="button" class="forgot-btn">忘记密码？</button>
                </div>
                <div class="input-wrapper">
                  <!-- LockIcon -->
                  <svg class="input-icon-left" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                  <input
                    v-model="password"
                    :type="showPwd ? 'text' : 'password'"
                    placeholder="输入您的密码"
                    class="nx-input nx-input-pwd"
                  />
                  <button type="button" class="pwd-toggle" @click="showPwd = !showPwd">
                    <!-- EyeIcon -->
                    <svg v-if="!showPwd" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    <!-- EyeOffIcon -->
                    <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- 验证码 -->
              <div class="field-group">
                <label class="field-label">验证码</label>
                <div class="captcha-row">
                  <div class="input-wrapper captcha-input-wrapper">
                    <!-- ShieldCheckIcon -->
                    <svg class="input-icon-left" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <input
                      v-model="captchaCode"
                      type="text"
                      placeholder="请输入验证码"
                      class="nx-input"
                      maxlength="4"
                    />
                  </div>
                  <div class="captcha-img" @click="fetchCaptcha" v-html="captchaSvg" />
                </div>
              </div>

              <!-- 登录按钮 -->
              <button
                type="submit"
                class="glow-btn"
                :disabled="loading"
                :style="{
                  background: loading
                    ? 'linear-gradient(135deg, rgba(59,130,246,0.5), rgba(139,92,246,0.5))'
                    : 'linear-gradient(135deg, #3b82f6, #6366f1)',
                  opacity: loading ? 0.8 : 1,
                }"
              >
                <span v-if="loading" class="btn-spinner" />
                <template v-else>
                  <span>登录工作台</span>
                  <!-- ArrowRightIcon -->
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </template>
                <span v-if="loading" class="loading-text">验证中...</span>
              </button>

              <!-- 分隔线 -->
              <div class="divider">
                <span class="divider-line" />
                <span class="divider-text">或通过以下方式</span>
                <span class="divider-line" />
              </div>

              <!-- OAuth -->
              <div class="oauth-row">
                <button type="button" class="oauth-btn" @click="gotoWechat">
                  <!-- WeChatIcon -->
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#07c160">
                    <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05a6.13 6.13 0 0 1-.248-1.753c0-3.694 3.452-6.692 7.706-6.692.256 0 .507.02.756.044C16.708 4.858 13.073 2.188 8.691 2.188zm-2.93 4.08a1.06 1.06 0 1 1 0 2.12 1.06 1.06 0 0 1 0-2.12zm5.713 0a1.06 1.06 0 1 1 0 2.12 1.06 1.06 0 0 1 0-2.12zM16.886 9.3c-3.723 0-6.744 2.578-6.744 5.756 0 3.178 3.021 5.756 6.744 5.756a7.99 7.99 0 0 0 2.284-.33.696.696 0 0 1 .577.078l1.532.896a.262.262 0 0 0 .134.044.237.237 0 0 0 .233-.237c0-.058-.023-.115-.039-.171l-.314-1.19a.475.475 0 0 1 .171-.535c1.475-1.082 2.417-2.686 2.417-4.311 0-3.178-3.021-5.756-6.744-5.756h.749zm-2.426 3.274a.854.854 0 1 1 0 1.708.854.854 0 0 1 0-1.708zm4.853 0a.854.854 0 1 1 0 1.708.854.854 0 0 1 0-1.708z"/>
                  </svg>
                  微信登录
                </button>
                <button type="button" class="oauth-btn" @click="gotoGithub">
                  <!-- GitHubIcon -->
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub 登录
                </button>
              </div>
            </form>
          </template>

          <!-- ========== 注册表单 ========== -->
          <template v-else>
            <div class="form-header">
              <h1 class="form-title">创建账户</h1>
              <p class="form-subtitle">注册低代码工作台，开启应用构建之旅</p>
            </div>

            <form class="login-form" @submit.prevent="handleRegister">
              <!-- 用户名 -->
              <div class="field-group">
                <label class="field-label">用户名</label>
                <div class="input-wrapper">
                  <svg class="input-icon-left" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <input
                    v-model="regUsername"
                    type="text"
                    placeholder="请输入用户名"
                    class="nx-input"
                  />
                </div>
              </div>

              <!-- 邮箱 -->
              <div class="field-group">
                <label class="field-label">邮箱</label>
                <div class="input-wrapper">
                  <svg class="input-icon-left" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="M22 7l-10 5L2 7" />
                  </svg>
                  <input
                    v-model="regEmail"
                    type="email"
                    placeholder="example@company.com"
                    class="nx-input"
                  />
                </div>
              </div>

              <!-- 密码 -->
              <div class="field-group">
                <label class="field-label">密码</label>
                <div class="input-wrapper">
                  <svg class="input-icon-left" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                  <input
                    v-model="regPassword"
                    :type="regShowPwd ? 'text' : 'password'"
                    placeholder="请输入密码（至少6位）"
                    class="nx-input nx-input-pwd"
                  />
                  <button type="button" class="pwd-toggle" @click="regShowPwd = !regShowPwd">
                    <svg v-if="!regShowPwd" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- 确认密码 -->
              <div class="field-group">
                <label class="field-label">确认密码</label>
                <div class="input-wrapper">
                  <svg class="input-icon-left" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                  <input
                    v-model="regConfirmPwd"
                    :type="regShowPwd ? 'text' : 'password'"
                    placeholder="请再次输入密码"
                    class="nx-input"
                  />
                </div>
              </div>

              <!-- 注册按钮 -->
              <button
                type="submit"
                class="glow-btn"
                :disabled="regLoading"
                :style="{
                  background: regLoading
                    ? 'linear-gradient(135deg, rgba(59,130,246,0.5), rgba(139,92,246,0.5))'
                    : 'linear-gradient(135deg, #3b82f6, #6366f1)',
                  opacity: regLoading ? 0.8 : 1,
                }"
              >
                <span v-if="regLoading" class="btn-spinner" />
                <template v-else>
                  <span>立即注册</span>
                </template>
                <span v-if="regLoading" class="loading-text">注册中...</span>
              </button>
            </form>
          </template>

          <!-- 切换登录/注册 -->
          <p class="register-text">
            <template v-if="isLogin">
              还没有账户？
              <button type="button" class="register-link" @click="switchMode">立即申请</button>
            </template>
            <template v-else>
              已有账户？
              <button type="button" class="register-link" @click="switchMode">返回登录</button>
            </template>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ========== CSS 变量 ========== */
.login-page {
  --nx-bg: #0C1020;
  --nx-surface: #1c2840;
  --nx-text: #ffffff;
  --nx-text-muted: rgba(255, 255, 255, 0.6);
  --nx-text-subtle: rgba(255, 255, 255, 0.35);
  --nx-accent: #3b82f6;
  --nx-border: rgba(255, 255, 255, 0.1);
}

/* ========== 页面布局 ========== */
.login-page {
  display: flex;
  min-height: 100dvh;
  background-color: var(--nx-bg);
  /* background: linear-gradient(135deg, rgba(0, 212, 255, 0.08) 0%, rgba(123, 47, 255, 0.08) 100%); */
  font-family: 'Outfit', 'Helvetica Neue', Helvetica, 'PingFang SC', Arial, sans-serif;
  overflow: hidden;
  position: relative;
}

/* ── 品牌头部（固定左上角） ── */
.brand-header {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 28px 40px;
  z-index: 100;
}

.brand-icon {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
}

.brand-text {
  display: flex;
  align-items: baseline;
}

.brand-bold {
  font-weight: 700;
  font-size: 15px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--nx-text);
}

.brand-light {
  /* font-weight: 300; */
  font-size: 15px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--nx-text-muted);
  margin-left: 4px;
}

/* ========== 右侧面板：登录表单 ========== */
.right-panel {
  display: flex;
  flex-direction: column;
  background-color: var(--nx-surface);
  /* background: linear-gradient(135deg, #0a0e27 0%, #0d1137 50%, #0a0e27 100%); */
  width: 100%;
}

.right-panel.right-side {
  flex: 2;
}

@media (min-width: 768px) {
  .right-panel {
    width: 52%;
  }
}

/* ── 表单区域 ── */
.form-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 40px 48px;
}

.form-container {
  width: 100%;
  max-width: 480px;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.form-header {
  margin-bottom: 32px;
}

.form-title {
  font-size: 34px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--nx-text);
  margin: 0 0 8px;
}

.form-subtitle {
  font-size: 14px;
  color: var(--nx-text-muted);
  margin: 0;
}

/* ── 表单字段 ── */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-size: 14px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--nx-text-muted);
}

.field-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.forgot-btn {
  font-size: 14px;
  font-weight: 500;
  color: var(--nx-accent);
  background: none;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s;
}

.forgot-btn:hover {
  opacity: 0.8;
}

/* ── 输入框 ── */
.input-wrapper {
  position: relative;
}

.input-icon-left {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--nx-text-subtle);
  pointer-events: none;
}

.nx-input {
  width: 100%;
  height: 44px;
  padding: 0 16px 0 44px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--nx-border);
  border-radius: 12px;
  color: var(--nx-text);
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.nx-input::placeholder {
  color: var(--nx-text-subtle);
}

.nx-input:focus {
  border-color: var(--nx-accent);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.nx-input-pwd {
  padding-right: 44px;
}

.pwd-toggle {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--nx-text-subtle);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  transition: color 0.2s;
}

.pwd-toggle:hover {
  color: var(--nx-text-muted);
}

/* ── 验证码 ── */
.captcha-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.captcha-input-wrapper {
  flex: 1;
}

.captcha-img {
  flex-shrink: 0;
  height: 50px;
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--nx-border);
  transition: border-color 0.2s;
}

.captcha-img:hover {
  border-color: var(--nx-accent);
}

.captcha-img :deep(svg) {
  display: block;
}

/* ── 登录按钮 ── */
.glow-btn {
  width: 100%;
  height: 48px;
  border: none;
  border-radius: 12px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.02em;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 8px;
  transition: box-shadow 0.3s, transform 0.2s;
  box-shadow: 0 4px 24px rgba(59, 130, 246, 0.3);
}

.glow-btn:hover:not(:disabled) {
  box-shadow: 0 6px 32px rgba(59, 130, 246, 0.5);
  transform: translateY(-1px);
}

.glow-btn:disabled {
  cursor: not-allowed;
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loading-text {
  font-size: 14px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ── 分隔线 ── */
.divider {
  display: flex;
  align-items: center;
  gap: 12px;
}

.divider-line {
  flex: 1;
  height: 1px;
  background-color: var(--nx-border);
}

.divider-text {
  font-size: 14px;
  color: var(--nx-text-subtle);
  white-space: nowrap;
}

/* ── OAuth 按钮 ── */
.oauth-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.oauth-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 40px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--nx-border);
  color: var(--nx-text-muted);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.oauth-btn:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.2);
}

/* ── 注册提示 ── */
.register-text {
  margin-top: 32px;
  text-align: center;
  font-size: 14px;
  color: var(--nx-text-subtle);
}

.register-link {
  margin-left: 4px;
  font-weight: 500;
  color: var(--nx-accent);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  transition: opacity 0.2s;
}

.register-link:hover {
  opacity: 0.8;
}

/* ========== 左侧面板：品牌可视化 ========== */
.left-panel {
  display: none;
  flex: 3;
  position: relative;
  overflow: hidden;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(ellipse at 30% 40%, rgba(59, 130, 246, 0.12) 0%, transparent 60%),
    radial-gradient(ellipse at 70% 70%, rgba(139, 92, 246, 0.1) 0%, transparent 60%),
    var(--nx-bg);
}

/* 品牌可视化面板在左侧时始终显示 */
.left-panel.left-side {
  display: flex;
}

@media (max-width: 767px) {
  .left-panel.left-side {
    display: none;
  }
}

@media (min-width: 768px) {
  .left-panel {
    display: flex;
  }
}

/* ── 网格背景 ── */
.grid-bg {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 60px 60px;
  opacity: 0.6;
  pointer-events: none;
}

/* ── 浮动节点 ── */
.floating-node {
  position: absolute;
  border-radius: 50%;
  opacity: 0.5;
  animation: nx-float 3s ease-in-out infinite;
  pointer-events: none;
}

@keyframes nx-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

/* ── 连接线 ── */
.connection-lines {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0.08;
  pointer-events: none;
}

/* ── 中心区域 ── */
.hero-center {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* ── 脉冲环 ── */
.pulse-ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(59, 130, 246, 0.15);
  pointer-events: none;
}

.pulse-ring-1 {
  width: 192px;
  height: 192px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: nx-pulse-ring 2s ease-out infinite;
}

.pulse-ring-2 {
  width: 144px;
  height: 144px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: nx-pulse-ring 2s ease-out 0.7s infinite;
}

@keyframes nx-pulse-ring {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(1.4); opacity: 0; }
}

/* ── 主图标 ── */
.hero-icon-float {
  animation: nx-icon-float 4s ease-in-out infinite;
}

@keyframes nx-icon-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.hero-icon-outer {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32px;
  background: linear-gradient(145deg, rgba(59, 130, 246, 0.2) 0%, rgba(99, 102, 241, 0.3) 50%, rgba(139, 92, 246, 0.2) 100%);
  border: 1px solid rgba(99, 132, 235, 0.3);
  box-shadow: 0 0 60px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.hero-icon-inner {
  width: 72px;
  height: 72px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.4);
}

/* ── 标题 ── */
.hero-title {
  font-size: 40px;
  font-weight: 900;
  letter-spacing: -0.03em;
  color: var(--nx-text);
  text-align: center;
  margin: 0 0 12px;
}

.hero-title-gradient {
  background: linear-gradient(90deg, #3b82f6, #8b5cf6, #14b8a6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 14px;
  color: var(--nx-text-muted);
  text-align: center;
  margin: 0 0 40px;
}

/* ── 功能徽章 ── */
.feature-badges {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.feature-badge {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 24px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(99, 132, 235, 0.12);
  backdrop-filter: blur(10px);
}

.feature-badge-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: rgba(59, 130, 246, 0.12);
}

.feature-badge-text {
  font-size: 14px;
  font-weight: 500;
  color: var(--nx-text-muted);
}

/* ── 底部统计栏 ── */
.stats-bar {
  position: absolute;
  bottom: 32px;
  left: 32px;
  right: 32px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 16px 24px;
  border-radius: 16px;
  background: rgba(17, 24, 39, 0.6);
  border: 1px solid rgba(99, 132, 235, 0.1);
  backdrop-filter: blur(12px);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  font-family: 'JetBrains Mono', 'SF Mono', 'Cascadia Code', monospace;
  color: var(--nx-text);
}

.stat-label {
  font-size: 12px;
  color: var(--nx-text-subtle);
}

/* ========== 响应式 ========== */
@media (max-width: 767px) {
  .form-area {
    padding: 0 24px 32px;
  }
  .brand-header {
    padding: 20px 24px;
  }
  .right-panel.right-side {
    width: 100%;
  }
}
</style>
