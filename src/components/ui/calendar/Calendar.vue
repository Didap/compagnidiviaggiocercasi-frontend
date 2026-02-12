<script setup lang="ts">
import { type HTMLAttributes, computed, ref, watch } from 'vue'
import {
    CalendarRoot,
    type CalendarRootEmits,
    type CalendarRootProps,
    useForwardPropsEmits,
    CalendarHeader,
    CalendarHeading,
    CalendarGrid,
    CalendarGridHead,
    CalendarHeadCell,
    CalendarGridBody,
    CalendarGridRow,
    CalendarCell,
    CalendarCellTrigger,
    CalendarPrev,
    CalendarNext
} from 'radix-vue'
import type { DateValue } from '@internationalized/date'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

const props = defineProps<CalendarRootProps & {
    class?: HTMLAttributes['class']
    captionLayout?: 'buttons' | 'dropdown'
}>()
const emits = defineEmits<CalendarRootEmits>()

const forwarded = useForwardPropsEmits(props, emits)

// Internal placeholder to track what month/year is displayed
const internalPlaceholder = ref<DateValue | undefined>(props.defaultPlaceholder || props.placeholder)

// Watch for external placeholder changes
watch(() => props.placeholder, (val) => {
    if (val) internalPlaceholder.value = val
})

const isDropdown = computed(() => props.captionLayout === 'dropdown')

// Month names for dropdown
const months = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
]

// Year range for DOB (100 years back)
const currentYear = new Date().getFullYear()
const years = computed(() => {
    const result: number[] = []
    for (let y = currentYear; y >= currentYear - 100; y--) {
        result.push(y)
    }
    return result
})

const onMonthChange = (val: string, currentDate: DateValue) => {
    const newMonth = parseInt(val)
    const updated = currentDate.set({ month: newMonth })
    internalPlaceholder.value = updated
    emits('update:placeholder', updated)
}

const onYearChange = (val: string, currentDate: DateValue) => {
    const newYear = parseInt(val)
    const updated = currentDate.set({ year: newYear })
    internalPlaceholder.value = updated
    emits('update:placeholder', updated)
}
</script>

<template>
    <CalendarRoot v-slot="{ grid, weekDays, date }" :class="cn('p-3', props.class)" v-bind="forwarded"
        v-model:placeholder="(internalPlaceholder as any)">
        <CalendarHeader class="flex items-center justify-between px-1 pb-4">
            <CalendarPrev
                class="h-8 w-8 bg-transparent p-0 text-slate-400 hover:text-primary transition-colors flex items-center justify-center rounded-xl hover:bg-slate-50">
                <ChevronLeft class="h-5 w-5" />
            </CalendarPrev>

            <!-- Dropdown mode: month + year selects -->
            <div v-if="isDropdown" class="flex items-center gap-2">
                <Select :model-value="date.month.toString()" @update:model-value="(val) => onMonthChange(val, date)">
                    <SelectTrigger
                        class="h-8 border-none bg-transparent hover:bg-slate-100 transition-colors rounded-lg px-3 py-1 text-sm font-bold text-slate-900 focus:ring-0 focus:ring-offset-0">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent
                        class="max-h-[200px] scrollbar-tiny rounded-xl border-white/60 backdrop-blur-md bg-white/90">
                        <SelectItem v-for="(name, idx) in months" :key="idx" :value="(idx + 1).toString()"
                            class="rounded-lg focus:bg-primary focus:text-white transition-colors">
                            {{ name }}
                        </SelectItem>
                    </SelectContent>
                </Select>

                <Select :model-value="date.year.toString()" @update:model-value="(val) => onYearChange(val, date)">
                    <SelectTrigger
                        class="h-8 border-none bg-transparent hover:bg-slate-100 transition-colors rounded-lg px-3 py-1 text-sm font-bold text-slate-900 focus:ring-0 focus:ring-offset-0 min-w-[75px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent
                        class="max-h-[200px] scrollbar-tiny rounded-xl border-white/60 backdrop-blur-md bg-white/90">
                        <SelectItem v-for="y in years" :key="y" :value="y.toString()"
                            class="rounded-lg focus:bg-primary focus:text-white transition-colors">
                            {{ y }}
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <!-- Default mode: just a heading -->
            <CalendarHeading v-else class="text-sm font-bold text-slate-900 capitalize" />

            <CalendarNext
                class="h-8 w-8 bg-transparent p-0 text-slate-400 hover:text-primary transition-colors flex items-center justify-center rounded-xl hover:bg-slate-50">
                <ChevronRight class="h-5 w-5" />
            </CalendarNext>
        </CalendarHeader>

        <div class="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
            <CalendarGrid v-for="month in grid" :key="month.value.toString()" class="w-full border-collapse space-y-1">
                <CalendarGridHead>
                    <CalendarGridRow class="flex">
                        <CalendarHeadCell v-for="day in weekDays" :key="day"
                            class="text-slate-400 rounded-md w-9 font-medium text-[0.75rem] uppercase">
                            {{ day }}
                        </CalendarHeadCell>
                    </CalendarGridRow>
                </CalendarGridHead>
                <CalendarGridBody>
                    <CalendarGridRow v-for="week in month.rows" :key="week.toString()" class="flex w-full mt-2">
                        <CalendarCell v-for="day in week" :key="day.toString()" :date="day"
                            class="relative p-0 text-center text-sm focus-within:z-20">
                            <CalendarCellTrigger :day="day" :month="month.value"
                                class="h-9 w-9 p-0 font-medium aria-selected:opacity-100 rounded-xl transition-all hover:bg-primary/5 hover:text-primary data-[selected]:bg-primary data-[selected]:text-primary-foreground data-[today]:text-primary data-[today]:font-black focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-30 disabled:hover:bg-transparent">
                                {{ day.day }}
                            </CalendarCellTrigger>
                        </CalendarCell>
                    </CalendarGridRow>
                </CalendarGridBody>
            </CalendarGrid>
        </div>
    </CalendarRoot>
</template>
