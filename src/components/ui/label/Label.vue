<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: string
  for?: string
}>()
const classes = computed(() =>
  cn(
    'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
    props.class,
  ),
)
</script>

<template>
  <label :class="classes" :for="props.for">
    <slot />
  </label>
</template>
