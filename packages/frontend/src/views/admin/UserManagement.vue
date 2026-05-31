<script setup lang="ts">
import { ref, onMounted } from 'vue'
import request from '@/utils/request'

const users = ref<any[]>([])
const dialogVisible = ref(false)
const form = ref({ username: '', password: '', email: '' })

onMounted(async () => {
  const data = await request.get('/users')
  users.value = data?.items ?? data ?? []
})

async function create() {
  await request.post('/users', form.value)
  dialogVisible.value = false
  form.value = { username: '', password: '', email: '' }
  const data = await request.get('/users')
  users.value = data?.items ?? data ?? []
}

async function remove(id: string) {
  await request.delete(`/users/${id}`)
  users.value = users.value.filter((u: any) => u.id !== id)
}
</script>

<template>
  <div>
    <div class="toolbar">
      <el-button type="primary" @click="dialogVisible = true">创建用户</el-button>
    </div>
    <el-table :data="users" stripe>
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="status" label="状态" width="100" />
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button size="small" type="danger" @click="remove(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" title="创建用户" width="400px">
      <el-form>
        <el-form-item label="用户名"><el-input v-model="form.username" /></el-form-item>
        <el-form-item label="密码"><el-input v-model="form.password" type="password" /></el-form-item>
        <el-form-item label="邮箱"><el-input v-model="form.email" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="create">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.toolbar { margin-bottom: 16px; }
</style>
