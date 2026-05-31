<script setup lang="ts">
defineProps<{ node: { props: Record<string, any>; style: Record<string, string> } }>()
</script>

<template>
  <div :style="node.style" class="bar-chart-render">
    <svg viewBox="0 0 200 80" class="chart-svg">
      <rect x="20" y="50" width="24" height="30" rx="2" fill="#8b5cf6" opacity="0.7" />
      <rect x="60" y="25" width="24" height="55" rx="2" fill="#8b5cf6" opacity="0.7" />
      <rect x="100" y="40" width="24" height="40" rx="2" fill="#8b5cf6" opacity="0.7" />
      <rect x="140" y="15" width="24" height="65" rx="2" fill="#8b5cf6" opacity="0.7" />
    </svg>
    <div class="chart-label">柱状图</div>
  </div>
</template>

<style scoped>
.bar-chart-render { border: 1px solid #374151; border-radius: 6px; padding: 16px; background: rgba(255,255,255,0.03); }
.chart-svg { width: 100%; height: auto; }
.chart-label { text-align: center; font-size: 12px; color: rgba(255,255,255,0.4); margin-top: 8px; }
</style>
