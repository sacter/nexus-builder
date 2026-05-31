<script setup lang="ts">
defineProps<{ node: { props: Record<string, any>; style: Record<string, string> } }>()
</script>

<template>
  <div :style="node.style" class="datepicker-render">
    <div class="dp-icon">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
    </div>
    <span class="dp-text">{{ node.props?.placeholder ?? '选择日期范围' }}</span>
  </div>
</template>

<style scoped>
.datepicker-render { display: flex; align-items: center; gap: 8px; padding: 8px 12px; border: 1px solid #374151; border-radius: 6px; background: rgba(255,255,255,0.03); }
.dp-icon { color: rgba(255,255,255,0.4); }
.dp-text { font-size: 13px; color: rgba(255,255,255,0.4); }
</style>
