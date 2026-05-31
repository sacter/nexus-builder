<script setup lang="ts">
defineProps<{ node: { props: Record<string, any>; style: Record<string, string> } }>()
</script>

<template>
  <el-select :placeholder="node.props?.placeholder ?? '请选择'" :style="node.style">
    <el-option
      v-for="opt in (node.props?.options ?? [])"
      :key="opt.value"
      :label="opt.label"
      :value="opt.value"
    />
  </el-select>
</template>
