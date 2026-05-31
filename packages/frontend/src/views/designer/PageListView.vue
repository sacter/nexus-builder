<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import request from '@/utils/request'

interface PageItem {
  id: string
  name: string
  path: string
  status: string
  updatedAt: string
}

const route = useRoute()
const router = useRouter()
const appId = route.params.appId as string
const pages = ref<PageItem[]>([])
const dialogVisible = ref(false)
const newPage = ref({ name: '', path: '', description: '' })

onMounted(async () => {
  pages.value = await request.get(`/applications/${appId}/pages`)
})

async function createPage() {
  await request.post(`/applications/${appId}/pages`, newPage.value)
  dialogVisible.value = false
  newPage.value = { name: '', path: '', description: '' }
  pages.value = await request.get(`/applications/${appId}/pages`)
}

async function deletePage(id: string) {
  await request.delete(`/pages/${id}`)
  pages.value = pages.value.filter((p) => p.id !== id)
}

function editPage(pageId: string) {
  router.push(`/designer/${appId}/page/${pageId}/edit`)
}

function previewPage(pageId: string) {
  window.open(`/preview/${pageId}`, '_blank')
}
</script>

<template>
  <div class="page-list">
    <div class="toolbar">
      <el-button type="primary" @click="dialogVisible = true">创建页面</el-button>
    </div>
    <el-table :data="pages" stripe>
      <el-table-column prop="name" label="页面名称" />
      <el-table-column prop="path" label="路由路径" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 'published' ? 'success' : 'info'">{{ row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="updatedAt" label="更新时间" width="180" />
      <el-table-column label="操作" width="220">
        <template #default="{ row }">
          <el-button size="small" @click="editPage(row.id)">编辑</el-button>
          <el-button size="small" @click="previewPage(row.id)">预览</el-button>
          <el-button size="small" type="danger" @click="deletePage(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" title="创建页面" width="500px">
      <el-form>
        <el-form-item label="页面名称">
          <el-input v-model="newPage.name" placeholder="请输入页面名称" />
        </el-form-item>
        <el-form-item label="路由路径">
          <el-input v-model="newPage.path" placeholder="/page1" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="newPage.description" type="textarea" placeholder="可选" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="createPage">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.page-list { padding: 16px; }
.toolbar { margin-bottom: 16px; }
</style>
