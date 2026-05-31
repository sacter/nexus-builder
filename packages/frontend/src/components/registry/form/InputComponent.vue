<script setup lang="ts">
defineProps<{ node: { props: Record<string, any>; style: Record<string, string> } }>()
</script>

<template>
  <el-input :placeholder="node.props?.placeholder ?? '请输入'" :style="node.style" />
</template>
