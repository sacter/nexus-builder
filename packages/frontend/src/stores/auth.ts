import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { IUser } from '@lowcode/common'
import request from '@/utils/request'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<IUser | null>(null)
  const token = ref(localStorage.getItem('token') || '')

  const isLoggedIn = computed(() => !!token.value)

  async function login(username: string, password: string, captchaId: string, captchaCode: string) {
    const data = await request.post('/auth/login', { username, password, captchaId, captchaCode }) as any
    token.value = data.accessToken
    user.value = data.user
    localStorage.setItem('token', data.accessToken)
    return data
  }

  async function register(username: string, password: string, email: string) {
    const data = await request.post('/auth/register', { username, password, email }) as any
    token.value = data.accessToken
    user.value = data.user
    localStorage.setItem('token', data.accessToken)
    return data
  }

  function oauthLogin(accessToken: string, refreshToken: string, userData: any) {
    token.value = accessToken
    user.value = userData
    localStorage.setItem('token', accessToken)
  }

  async function fetchProfile() {
    user.value = await request.get('/auth/profile') as any
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
  }

  return { user, token, isLoggedIn, login, register, oauthLogin, fetchProfile, logout }
})
