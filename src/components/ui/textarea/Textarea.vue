<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: string
  modelValue?: string | number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const attrs = useAttrs()
const classes = computed(() =>
  cn(
    'flex min-h-[80px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
    props.class,
  ),
)

const handleInput = (event: Event) => {
  emit('update:modelValue', (event.target as HTMLTextAreaElement).value)
}
</script>

<template>
  <textarea
    :class="classes"
    :value="modelValue"
    v-bind="attrs"
    @input="handleInput"
  />
</template>
