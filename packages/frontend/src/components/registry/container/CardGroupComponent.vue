<script setup lang="ts">
defineProps<{ node: { props: Record<string, any>; style: Record<string, string> } }>()
</script>

<template>
  <div :style="node.style" class="card-group-render">
    <div class="metric-card">
      <div class="metric-icon" style="background: rgba(59,130,246,0.15); color: #60a5fa;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>
      </div>
      <div class="metric-info">
        <span class="metric-value">1,234</span>
        <span class="metric-label">统计指标</span>
      </div>
    </div>
    <div class="metric-card">
      <div class="metric-icon" style="background: rgba(16,185,129,0.15); color: #34d399;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
      </div>
      <div class="metric-info">
        <span class="metric-value">56.8%</span>
        <span class="metric-label">增长率</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-group-render { display: flex; gap: 12px; }
.metric-card { flex: 1; display: flex; align-items: center; gap: 12px; padding: 14px; background: rgba(255,255,255,0.03); border: 1px solid #374151; border-radius: 8px; }
.metric-icon { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.metric-info { display: flex; flex-direction: column; gap: 2px; }
.metric-value { font-size: 18px; font-weight: 700; color: rgba(255,255,255,0.85); }
.metric-label { font-size: 11px; color: rgba(255,255,255,0.4); }
</style>
