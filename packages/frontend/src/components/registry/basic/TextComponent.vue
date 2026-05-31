<script setup lang="ts">
defineProps<{ node: { props: Record<string, any>; style: Record<string, string> } }>()
</script>

<template>
  <span :style="node.style">{{ node.props?.text ?? '文本' }}</span>
</template>
