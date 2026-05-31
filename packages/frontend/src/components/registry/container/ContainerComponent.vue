<script setup lang="ts">
defineProps<{ node: { props: Record<string, any>; style: Record<string, string> } }>()
</script>

<template>
  <div :style="node.style" class="container-render">
    <slot />
  </div>
</template>

<style scoped>
.container-render {
  min-height: 60px;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  padding: 8px;
}
</style>
