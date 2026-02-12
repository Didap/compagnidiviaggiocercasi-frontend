<script setup lang="ts">
import { ref, watch, computed } from "vue"
import { DateFormatter, getLocalTimeZone, parseDate } from "@internationalized/date"
import { CalendarIcon } from "lucide-vue-next"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Calendar from "@/components/ui/calendar/Calendar.vue"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const props = defineProps<{
  modelValue?: string
}>()

const emit = defineEmits(['update:modelValue'])

const open = ref(false)
const df = new DateFormatter('it-IT', { dateStyle: 'long' })

// Internal date state (DateValue object)
const dateValue = ref<any>(props.modelValue ? parseDate(props.modelValue) : undefined)

// Display text
const formattedDate = computed(() => {
  if (!dateValue.value) return "Seleziona data"
  return df.format(dateValue.value.toDate(getLocalTimeZone()))
})

// Sync internal state with external modelValue
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    try {
      const parsed = parseDate(newVal)
      if (parsed.toString() !== dateValue.value?.toString()) {
        dateValue.value = parsed
      }
    } catch {
      dateValue.value = undefined
    }
  } else {
    dateValue.value = undefined
  }
})

// Sync external modelValue with internal state
watch(dateValue, (newVal) => {
  emit('update:modelValue', newVal?.toString())
})
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <div class="relative w-full">
        <CalendarIcon
          class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary/60 pointer-events-none z-10" />
        <Button id="date" type="button" variant="outline" :class="cn(
          'w-full justify-start text-left font-normal h-11 pl-10 rounded-xl border-slate-200/80 bg-white/60 hover:bg-white focus:bg-white focus:border-primary/40 transition-all text-base',
          !dateValue && 'text-muted-foreground'
        )">
          {{ formattedDate }}
        </Button>
      </div>
    </PopoverTrigger>
    <PopoverContent class="w-auto p-0 max-w-[95vw] scrollbar-tiny" align="center" :side-offset="8">
      <Calendar v-model="dateValue" mode="single" caption-layout="dropdown" initial-focus locale="it"
        @update:model-value="open = false" />
    </PopoverContent>
  </Popover>
</template>