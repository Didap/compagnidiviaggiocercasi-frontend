<script setup lang="ts">
import { type HTMLAttributes } from 'vue'
import {
    RangeCalendarCell,
    RangeCalendarCellTrigger,
    RangeCalendarGrid,
    RangeCalendarGridBody,
    RangeCalendarGridHead,
    RangeCalendarGridRow,
    RangeCalendarHeadCell,
    RangeCalendarHeader,
    RangeCalendarHeading,
    RangeCalendarNext,
    RangeCalendarPrev,
    RangeCalendarRoot,
    type RangeCalendarRootEmits,
    type RangeCalendarRootProps,
    useForwardPropsEmits,
} from 'radix-vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

const props = defineProps<RangeCalendarRootProps & { class?: HTMLAttributes['class'] }>()
const emits = defineEmits<RangeCalendarRootEmits>()

const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
    <RangeCalendarRoot v-slot="{ grid, weekDays }" :class="cn('p-3', props.class)" v-bind="forwarded" locale="it">
        <RangeCalendarHeader class="flex items-center justify-between px-1 pb-4">
            <RangeCalendarPrev
                class="h-8 w-8 bg-transparent p-0 text-slate-400 hover:text-primary transition-colors flex items-center justify-center rounded-xl hover:bg-slate-50">
                <ChevronLeft class="h-5 w-5" />
            </RangeCalendarPrev>
            <RangeCalendarHeading class="text-sm font-bold text-slate-900 capitalize" />
            <RangeCalendarNext
                class="h-8 w-8 bg-transparent p-0 text-slate-400 hover:text-primary transition-colors flex items-center justify-center rounded-xl hover:bg-slate-50">
                <ChevronRight class="h-5 w-5" />
            </RangeCalendarNext>
        </RangeCalendarHeader>

        <div class="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
            <RangeCalendarGrid v-for="month in grid" :key="month.value.toString()"
                class="w-full border-collapse space-y-1">
                <RangeCalendarGridHead>
                    <RangeCalendarGridRow class="flex">
                        <RangeCalendarHeadCell v-for="day in weekDays" :key="day"
                            class="text-slate-400 rounded-md w-9 font-medium text-[0.75rem] uppercase">
                            {{ day }}
                        </RangeCalendarHeadCell>
                    </RangeCalendarGridRow>
                </RangeCalendarGridHead>
                <RangeCalendarGridBody>
                    <RangeCalendarGridRow v-for="week in month.rows" :key="week.toString()" class="flex w-full mt-2">
                        <RangeCalendarCell v-for="day in week" :key="day.toString()" :date="day" class="calendar-cell">
                            <RangeCalendarCellTrigger :day="day" :month="month.value" class="calendar-trigger">
                                {{ day.day }}
                            </RangeCalendarCellTrigger>
                        </RangeCalendarCell>
                    </RangeCalendarGridRow>
                </RangeCalendarGridBody>
            </RangeCalendarGrid>
        </div>
    </RangeCalendarRoot>
</template>

<style scoped>
.calendar-cell {
    position: relative;
    padding: 0;
    text-align: center;
    font-size: 0.875rem;
    width: 2.25rem;
    height: 2.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Base selection background for cells in range */
/* We target both data-selected and aria-selected for robustness */
/* Base selection background for cells in range */
.calendar-cell[data-selected],
.calendar-cell[aria-selected="true"],
.calendar-cell:has([aria-selected="true"]) {
    background-color: rgba(234, 88, 12, 0.25) !important;
}

/* Rounding for start of selection (target cell containing the start trigger) */
/* Solid Orange ONLY for the actual start date */
.calendar-cell:has([data-selection-start]) {
    background-color: #ea580c !important;
    border-top-left-radius: 0.75rem;
    border-bottom-left-radius: 0.75rem;
    opacity: 1 !important;
}

/* Rounding for first child of row (if selected but NOT start) - Light Orange */
.calendar-cell:first-child[data-selected]:not(:has([data-selection-start])),
.calendar-cell:first-child:has([aria-selected="true"]):not(:has([data-selection-start])) {
    border-top-left-radius: 0.75rem;
    border-bottom-left-radius: 0.75rem;
}

/* Rounding for end of selection (target cell containing the end trigger) */
/* Solid Orange ONLY for the actual end date */
.calendar-cell:has([data-selection-end]) {
    background-color: #ea580c !important;
    border-top-right-radius: 0.75rem;
    border-bottom-right-radius: 0.75rem;
    opacity: 1 !important;
}

/* Rounding for last child of row (if selected but NOT end) - Light Orange */
.calendar-cell:last-child[data-selected]:not(:has([data-selection-end])),
.calendar-cell:last-child:has([aria-selected="true"]):not(:has([data-selection-end])) {
    border-top-right-radius: 0.75rem;
    border-bottom-right-radius: 0.75rem;
}

/* Hide outside days to prevent duplication in multi-month view */
/* We target multiple potential attributes and elements for robustness */
.calendar-cell[data-outside-month],
.calendar-cell[data-outside-view],
.calendar-cell:has([data-outside-month]),
.calendar-cell:has([data-outside-view]),
.calendar-trigger[data-outside-month],
.calendar-trigger[data-outside-view] {
    opacity: 0 !important;
    pointer-events: none !important;
    visibility: hidden !important;
}

/* Ensure intermediate cells within the row have no rounding */
.calendar-cell[data-selected]:not(:first-child):not(:last-child):not(:has([data-selection-start])):not(:has([data-selection-end])) {
    border-radius: 0;
}

.calendar-trigger {
    height: 2.25rem;
    width: 2.25rem;
    padding: 0;
    font-weight: 500;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.75rem;
    cursor: pointer;
    background: transparent;
    border: none;
    color: inherit;
    position: relative;
    z-index: 10;
}

/* Styling for start/end triggers */
.calendar-trigger[data-selection-start],
.calendar-trigger[data-selection-end] {
    background-color: #ea580c !important;
    color: white !important;
    border-radius: 0.75rem;
    z-index: 20;
}

.calendar-trigger:hover:not([data-selection-start]):not([data-selection-end]) {
    background-color: rgba(234, 88, 12, 0.1);
    color: #ea580c;
}

.calendar-trigger[data-today] {
    color: #ea580c;
    font-weight: 900;
}

.calendar-trigger[disabled] {
    opacity: 0.3;
    cursor: default;
}
</style>
