<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import request from '@/utils/request'
import type { IComponentNode } from '@lowcode/common'
import RenderNode from '@/components/registry/RenderNode.vue'

const route = useRoute()
const pageId = route.params.pageId as string
const components = ref<IComponentNode[]>([])
const pageName = ref('')

onMounted(async () => {
  const schema = await request.get(`/pages/${pageId}/schema`)
  if (schema) {
    components.value = schema.schema?.components ?? schema.components ?? []
    pageName.value = schema.pageName ?? 'Preview'
  }
})
</script>

<template>
  <div class="preview-container">
    <h2 v-if="pageName" class="page-title">{{ pageName }}</h2>
    <div class="preview-content">
      <RenderNode v-for="node in components" :key="node.id" :node="node" />
    </div>
  </div>
</template>

<style scoped>
.preview-container { min-height: 100vh; background: var(--nx-bg); }
.page-title { text-align: center; padding: 16px; color: var(--nx-text); }
.preview-content { max-width: 1200px; margin: 0 auto; padding: 16px; }
</style>
