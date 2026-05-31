import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type ThemeMode = 'light' | 'dark'

export const useThemeStore = defineStore('theme', () => {
  const mode = ref<ThemeMode>(getInitialTheme())
  const isDark = computed(() => mode.value === 'dark')

  function getInitialTheme(): ThemeMode {
    const stored = localStorage.getItem('theme') as ThemeMode | null
    if (stored === 'light' || stored === 'dark') return stored
    // 跟随系统偏好
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark'
    return 'light'
  }

  function applyTheme(m: ThemeMode) {
    const html = document.documentElement
    if (m === 'dark') {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
  }

  function toggle() {
    mode.value = mode.value === 'dark' ? 'light' : 'dark'
    applyTheme(mode.value)
    localStorage.setItem('theme', mode.value)
  }

  function init() {
    applyTheme(mode.value)
    // 监听系统主题变化
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        mode.value = e.matches ? 'dark' : 'light'
        applyTheme(mode.value)
      }
    })
  }

  return { mode, isDark, toggle, init }
})
