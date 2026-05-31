<script setup lang="ts">
defineProps<{ node: { props: Record<string, any>; style: Record<string, string> } }>()
</script>

<template>
  <div :style="node.style" class="table-render">
    <div class="table-header">
      <span class="th" v-for="col in 4" :key="col">列 {{ col }}</span>
    </div>
    <div class="table-body">
      <div class="table-row" v-for="row in 3" :key="row">
        <span class="td" v-for="col in 4" :key="col">数据</span>
      </div>
    </div>
    <div class="table-footer">分页 · 共 24 条</div>
  </div>
</template>

<style scoped>
.table-render { border: 1px solid #374151; border-radius: 6px; overflow: hidden; background: rgba(255,255,255,0.03); }
.table-header { display: flex; background: rgba(255,255,255,0.06); }
.th { flex: 1; padding: 8px 12px; font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.6); border-bottom: 1px solid #374151; }
.table-row { display: flex; border-bottom: 1px solid rgba(255,255,255,0.04); }
.td { flex: 1; padding: 8px 12px; font-size: 12px; color: rgba(255,255,255,0.45); }
.table-footer { padding: 8px 12px; font-size: 11px; color: rgba(255,255,255,0.3); text-align: right; }
</style>
