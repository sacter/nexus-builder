<script setup lang="ts">
defineProps<{ node: { props: Record<string, any>; style: Record<string, string> } }>()
</script>

<template>
  <img :src="node.props?.src" :style="{ ...node.style, objectFit: node.props?.fit ?? 'cover' }" />
</template>
