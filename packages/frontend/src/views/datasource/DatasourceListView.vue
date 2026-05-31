<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import request from '@/utils/request'

interface DSItem { id: string; name: string; type: string; updatedAt: string }

const route = useRoute()
const appId = route.params.appId as string
const datasources = ref<DSItem[]>([])
const dialogVisible = ref(false)
const form = ref({ name: '', type: 'http', config: '{}' })

onMounted(async () => {
  datasources.value = await request.get(`/applications/${appId}/datasources`)
})

async function create() {
  await request.post(`/applications/${appId}/datasources`, {
    ...form.value,
    config: JSON.parse(form.value.config),
  })
  dialogVisible.value = false
  datasources.value = await request.get(`/applications/${appId}/datasources`)
}

async function remove(id: string) {
  await request.delete(`/datasources/${id}`)
  datasources.value = datasources.value.filter((d) => d.id !== id)
}
</script>

<template>
  <div class="datasource-list">
    <div class="toolbar">
      <el-button type="primary" @click="dialogVisible = true">添加数据源</el-button>
    </div>
    <el-table :data="datasources" stripe>
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="type" label="类型" width="120" />
      <el-table-column prop="updatedAt" label="更新时间" width="180" />
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button size="small" type="danger" @click="remove(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" title="添加数据源" width="500px">
      <el-form>
        <el-form-item label="名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="类型">
          <el-select v-model="form.type">
            <el-option label="HTTP API" value="http" />
            <el-option label="数据库" value="database" />
            <el-option label="Mock" value="mock" />
          </el-select>
        </el-form-item>
        <el-form-item label="配置 JSON"><el-input v-model="form.config" type="textarea" rows="5" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="create">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.datasource-list { padding: 16px; }
.toolbar { margin-bottom: 16px; }
</style>
