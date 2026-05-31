<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

onMounted(() => {
  const { accessToken, refreshToken, user, error } = route.query

  if (error) {
    ElMessage.error('第三方登录失败，请重试')
    router.replace('/login')
    return
  }

  if (accessToken && user) {
    try {
      const userData = JSON.parse(decodeURIComponent(user as string))
      auth.oauthLogin(accessToken as string, refreshToken as string, userData)
      ElMessage.success('登录成功！正在进入工作台...')
      router.push('/dashboard')
    } catch {
      ElMessage.error('登录信息解析失败，请重试')
      router.replace('/login')
    }
  } else {
    ElMessage.error('登录参数缺失，请重试')
    router.replace('/login')
  }
})
</script>

<template>
  <div class="oauth-callback-page">
    <div class="loading-container">
      <div class="spinner" />
      <p>正在处理登录，请稍候...</p>
    </div>
  </div>
</template>

<style scoped>
.oauth-callback-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100dvh;
  background-color: var(--nx-bg);
  color: var(--nx-text-muted);
  font-family: 'Outfit', 'Helvetica Neue', Helvetica, 'PingFang SC', Arial, sans-serif;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--nx-border);
  border-top-color: var(--nx-accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
