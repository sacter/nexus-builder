<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import request from '@/utils/request'

interface WFItem { id: string; name: string; status: string; updatedAt: string }

const route = useRoute()
const appId = route.params.appId as string
const workflows = ref<WFItem[]>([])
const dialogVisible = ref(false)
const form = ref({ name: '', description: '', definition: '{"nodes":[],"edges":[]}' })

onMounted(async () => {
  const data = await request.get(`/workflows?applicationId=${appId}`)
  workflows.value = data?.items ?? data ?? []
})

async function create() {
  await request.post('/workflows', {
    applicationId: appId,
    ...form.value,
    definition: JSON.parse(form.value.definition),
  })
  dialogVisible.value = false
  const data = await request.get(`/workflows?applicationId=${appId}`)
  workflows.value = data?.items ?? data ?? []
}

async function remove(id: string) {
  await request.delete(`/workflows/${id}`)
  workflows.value = workflows.value.filter((w) => w.id !== id)
}
</script>

<template>
  <div class="workflow-list">
    <div class="toolbar">
      <el-button type="primary" @click="dialogVisible = true">创建流程</el-button>
    </div>
    <el-table :data="workflows" stripe>
      <el-table-column prop="name" label="流程名称" />
      <el-table-column prop="status" label="状态" width="100" />
      <el-table-column prop="updatedAt" label="更新时间" width="180" />
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button size="small" type="danger" @click="remove(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" title="创建流程" width="500px">
      <el-form>
        <el-form-item label="名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="描述"><el-input v-model="form.description" type="textarea" /></el-form-item>
        <el-form-item label="流程定义 JSON"><el-input v-model="form.definition" type="textarea" rows="5" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="create">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.workflow-list { padding: 16px; }
.toolbar { margin-bottom: 16px; }
</style>
