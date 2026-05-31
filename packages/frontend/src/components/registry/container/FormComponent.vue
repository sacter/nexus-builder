<script setup lang="ts">
defineProps<{ node: { props: Record<string, any>; style: Record<string, string> } }>()
</script>

<template>
  <div :style="node.style" class="form-render">
    <div class="form-fields">
      <div class="form-field">
        <label>字段标签</label>
        <div class="field-input">输入框</div>
      </div>
      <div class="form-field">
        <label>字段标签</label>
        <div class="field-input">输入框</div>
      </div>
      <div class="form-field">
        <label>字段标签</label>
        <div class="field-input">输入框</div>
      </div>
    </div>
    <div class="form-actions">
      <span class="btn-submit">提交</span>
      <span class="btn-reset">重置</span>
    </div>
  </div>
</template>

<style scoped>
.form-render { border: 1px dashed #4b5563; border-radius: 6px; padding: 16px; background: rgba(255,255,255,0.02); }
.form-fields { display: flex; flex-direction: column; gap: 12px; }
.form-field label { display: block; font-size: 12px; color: rgba(255,255,255,0.5); margin-bottom: 4px; }
.field-input { padding: 6px 10px; border: 1px solid #374151; border-radius: 4px; font-size: 12px; color: rgba(255,255,255,0.3); background: rgba(255,255,255,0.03); }
.form-actions { display: flex; gap: 8px; margin-top: 16px; }
.btn-submit { padding: 4px 16px; background: #3b82f6; color: #fff; border-radius: 4px; font-size: 12px; }
.btn-reset { padding: 4px 16px; border: 1px solid #374151; border-radius: 4px; font-size: 12px; color: rgba(255,255,255,0.5); }
</style>
