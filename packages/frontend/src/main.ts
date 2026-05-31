import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { registerBuiltInComponents } from '@/components/registry'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import './styles/global.css'
import './styles/theme.css'
import { useThemeStore } from '@/stores/theme'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)

// Pinia 安装后才能调用 store
const theme = useThemeStore()
theme.init()

registerBuiltInComponents()

app.mount('#app')
