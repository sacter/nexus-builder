<script setup lang="ts">
const props = defineProps<{ node: { props: Record<string, any>; style: Record<string, string> } }>()
</script>

<template>
  <el-button :type="node.props?.type ?? 'primary'" :style="node.style">
    {{ node.props?.text ?? '按钮' }}
  </el-button>
</template>
