<script setup lang="ts">
import { onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useEditorStore } from '@/stores/editor'
import { createEmptySchema } from '@/utils/schema'
import request from '@/utils/request'
import ComponentPanel from './ComponentPanel.vue'
import CanvasPanel from './CanvasPanel.vue'
import PropertyPanel from './PropertyPanel.vue'
import Toolbar from './Toolbar.vue'

const route = useRoute()
const editor = useEditorStore()
const pageId = route.params.pageId as string

onMounted(async () => {
  let schema = await request.get(`/pages/${pageId}/schema`)
  if (schema) {
    editor.loadSchema(schema.schema?.components ?? schema.components ?? [])
  } else {
    editor.loadSchema(createEmptySchema().components)
  }
})

onBeforeUnmount(() => {
  editor.reset()
})

watch(() => editor.componentTree, () => {
  editor.refreshSelectedNode()
}, { deep: true })
</script>

<template>
  <div class="designer-view">
    <Toolbar :page-id="pageId" />
    <div class="designer-body">
      <ComponentPanel />
      <CanvasPanel />
      <PropertyPanel />
    </div>
  </div>
</template>

<style scoped>
.designer-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #0f172a;
}
.designer-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}
</style>
