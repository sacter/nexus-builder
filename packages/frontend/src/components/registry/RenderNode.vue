<script setup lang="ts">
import { computed, defineAsyncComponent, shallowRef } from 'vue'
import type { IComponentNode } from '@lowcode/common'
import { resolveComponentLoader } from './index'

const props = defineProps<{ node: IComponentNode }>()

const compLoader = computed(() => resolveComponentLoader(props.node.componentType))

const dynamicComponent = computed(() => {
  if (!compLoader.value) {
    return defineAsyncComponent(() => import('./basic/TextComponent.vue'))
  }
  return defineAsyncComponent(compLoader.value)
})
</script>

<template>
  <component
    :is="dynamicComponent"
    :node="node"
    :style="node.style"
    :class="['render-node']"
  />
  <template v-if="node.children && node.children.length > 0">
    <RenderNode
      v-for="child in node.children"
      :key="child.id"
      :node="child"
    />
  </template>
</template>

<style scoped>
.render-node {
  position: relative;
}
</style>
