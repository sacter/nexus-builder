<script setup lang="ts">
import { ref, onMounted } from 'vue'
import request from '@/utils/request'

const roles = ref<any[]>([])
const dialogVisible = ref(false)
const form = ref({ name: '', description: '' })

onMounted(async () => {
  roles.value = await request.get('/roles')
})

async function create() {
  await request.post('/roles', form.value)
  dialogVisible.value = false
  form.value = { name: '', description: '' }
  roles.value = await request.get('/roles')
}

async function remove(id: string) {
  await request.delete(`/roles/${id}`)
  roles.value = roles.value.filter((r: any) => r.id !== id)
}
</script>

<template>
  <div>
    <div class="toolbar">
      <el-button type="primary" @click="dialogVisible = true">创建角色</el-button>
    </div>
    <el-table :data="roles" stripe>
      <el-table-column prop="name" label="角色名" />
      <el-table-column prop="description" label="描述" />
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button size="small" type="danger" @click="remove(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" title="创建角色" width="400px">
      <el-form>
        <el-form-item label="角色名"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="描述"><el-input v-model="form.description" /></el-form-item>
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
