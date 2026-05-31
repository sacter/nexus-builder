<script setup lang="ts">
defineProps<{ node: { props: Record<string, any>; style: Record<string, string> } }>()
</script>

<template>
  <div :style="node.style" class="tabs-render">
    <div class="tab-bar">
      <span class="tab active">标签一</span>
      <span class="tab">标签二</span>
      <span class="tab">标签三</span>
    </div>
    <div class="tab-content">标签页内容区</div>
  </div>
</template>

<style scoped>
.tabs-render { border: 1px solid #374151; border-radius: 6px; overflow: hidden; background: rgba(255,255,255,0.03); }
.tab-bar { display: flex; border-bottom: 1px solid #374151; }
.tab { padding: 8px 16px; font-size: 12px; color: rgba(255,255,255,0.4); cursor: pointer; border-bottom: 2px solid transparent; }
.tab.active { color: #60a5fa; border-bottom-color: #3b82f6; }
.tab-content { padding: 16px; font-size: 12px; color: rgba(255,255,255,0.35); }
</style>
