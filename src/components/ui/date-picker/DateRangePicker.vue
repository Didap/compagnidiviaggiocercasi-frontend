<script setup lang="ts">
import { ref, watch } from 'vue'
import { Calendar as CalendarIcon } from 'lucide-vue-next'
import type { DateRange } from 'radix-vue'
import { RangeCalendar } from '@/components/ui/range-calendar'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import {
    DateFormatter,
    getLocalTimeZone,
} from '@internationalized/date'

const df = new DateFormatter('it-IT', {
    dateStyle: 'medium',
})

const props = defineProps<{
    modelValue?: DateRange
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', payload: DateRange): void
}>()

const value = ref<DateRange | undefined>(props.modelValue)

watch(() => props.modelValue, (newVal) => {
    value.value = newVal
})

watch(value, (newVal) => {
    if (newVal) {
        emit('update:modelValue', newVal as any)
    }
})
</script>

<template>
    <div :class="cn('grid gap-2', $attrs.class ?? '')">
        <Popover>
            <PopoverTrigger as-child>
                <Button id="date" :variant="'outline'" :class="cn(
                    'w-full justify-start text-left font-normal',
                    !value && 'text-muted-foreground',
                )">
                    <CalendarIcon class="mr-2 h-4 w-4" />
                    <template v-if="value?.start">
                        <template v-if="value.end">
                            {{ df.format(value.start.toDate(getLocalTimeZone())) }} - {{
                                df.format(value.end.toDate(getLocalTimeZone())) }}
                        </template>
                        <template v-else>
                            {{ df.format(value.start.toDate(getLocalTimeZone())) }}
                        </template>
                    </template>
                    <template v-else>
                        <span>Seleziona date</span>
                    </template>
                </Button>
            </PopoverTrigger>
            <PopoverContent class="w-auto p-0" align="start">
                <RangeCalendar :model-value="value as any" @update:model-value="(v) => value = v as any" initial-focus
                    :number-of-months="2" />
            </PopoverContent>
        </Popover>
    </div>
</template>
