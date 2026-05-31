<script setup lang="ts">
defineProps<{ node: { props: Record<string, any>; style: Record<string, string> } }>()
</script>

<template>
  <div :style="node.style" class="upload-render">
    <div class="upload-zone">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
      <span>点击或拖拽上传</span>
    </div>
  </div>
</template>

<style scoped>
.upload-render { border: 1px dashed #4b5563; border-radius: 6px; background: rgba(255,255,255,0.02); }
.upload-zone { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 24px; color: rgba(255,255,255,0.35); font-size: 12px; }
</style>
