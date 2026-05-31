import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { IDataSource } from '@lowcode/common'
import request from '@/utils/request'

export const useDatasourceStore = defineStore('datasources', () => {
  const datasources = ref<IDataSource[]>([])
  const loading = ref(false)

  async function fetchByApp(appId: string) {
    loading.value = true
    try {
      datasources.value = await request.get(`/applications/${appId}/datasources`)
    } finally {
      loading.value = false
    }
  }

  async function create(appId: string, dto: { name: string; type: string; config: Record<string, any> }) {
    const ds = await request.post(`/applications/${appId}/datasources`, dto)
    datasources.value.push(ds)
    return ds
  }

  async function update(id: string, dto: { name?: string; type?: string; config?: Record<string, any> }) {
    await request.put(`/datasources/${id}`, dto)
    const idx = datasources.value.findIndex((d) => d.id === id)
    if (idx >= 0) datasources.value[idx] = { ...datasources.value[idx], ...dto }
  }

  async function remove(id: string) {
    await request.delete(`/datasources/${id}`)
    datasources.value = datasources.value.filter((d) => d.id !== id)
  }

  return { datasources, loading, fetchByApp, create, update, remove }
})
