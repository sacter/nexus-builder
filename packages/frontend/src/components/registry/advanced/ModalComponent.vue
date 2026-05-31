<script setup lang="ts">
defineProps<{ node: { props: Record<string, any>; style: Record<string, string> } }>()
</script>

<template>
  <div :style="node.style" class="modal-render">
    <div class="modal-backdrop" />
    <div class="modal-dialog">
      <div class="modal-header">
        <span>弹窗标题</span>
        <span class="modal-close">✕</span>
      </div>
      <div class="modal-body">弹窗内容区域</div>
      <div class="modal-footer">
        <span class="modal-btn">取消</span>
        <span class="modal-btn primary">确定</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-render { position: relative; min-height: 160px; }
.modal-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,0.3); border-radius: 6px; }
.modal-dialog { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 70%; background: #1e293b; border: 1px solid #374151; border-radius: 8px; overflow: hidden; }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border-bottom: 1px solid #374151; font-size: 13px; color: rgba(255,255,255,0.7); }
.modal-close { font-size: 12px; color: rgba(255,255,255,0.4); cursor: pointer; }
.modal-body { padding: 16px 14px; font-size: 12px; color: rgba(255,255,255,0.4); }
.modal-footer { display: flex; justify-content: flex-end; gap: 8px; padding: 10px 14px; border-top: 1px solid #374151; }
.modal-btn { padding: 4px 14px; border: 1px solid #374151; border-radius: 4px; font-size: 12px; color: rgba(255,255,255,0.5); }
.modal-btn.primary { background: #3b82f6; border-color: #3b82f6; color: #fff; }
</style>
