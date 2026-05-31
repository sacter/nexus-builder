<script setup lang="ts">
defineProps<{ node: { props: Record<string, any>; style: Record<string, string> } }>()
</script>

<template>
  <div :style="node.style" class="line-chart-render">
    <svg viewBox="0 0 200 80" class="chart-svg">
      <polyline fill="none" stroke="#f97316" stroke-width="2" points="10,60 40,35 70,50 100,20 130,40 160,15 190,30" />
      <polyline fill="none" stroke="rgba(249,115,22,0.2)" stroke-width="0" points="10,60 40,35 70,50 100,20 130,40 160,15 190,30 190,80 10,80" style="fill:rgba(249,115,22,0.08)" />
    </svg>
    <div class="chart-label">折线图</div>
  </div>
</template>

<style scoped>
.line-chart-render { border: 1px solid #374151; border-radius: 6px; padding: 16px; background: rgba(255,255,255,0.03); }
.chart-svg { width: 100%; height: auto; }
.chart-label { text-align: center; font-size: 12px; color: rgba(255,255,255,0.4); margin-top: 8px; }
</style>
