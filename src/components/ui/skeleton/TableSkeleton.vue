<script setup lang="ts">
import Skeleton from './Skeleton.vue'
import Card from '@/components/ui/card/Card.vue'

interface Props {
    rows?: number
    columns?: number
}

withDefaults(defineProps<Props>(), {
    rows: 5,
    columns: 5
})
</script>

<template>
    <Card class="rounded-2xl border-none shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full">
                <thead>
                    <tr class="border-b border-slate-100 bg-slate-50/50">
                        <th v-for="i in columns" :key="i" class="py-4 px-6 text-left first:pl-6 last:pr-6">
                            <Skeleton class="h-4 w-24 bg-slate-200" />
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="r in rows" :key="r" class="border-b border-slate-50 last:border-0">
                        <td v-for="c in columns" :key="c" class="py-4 px-6 first:pl-6 last:pr-6">
                            <!-- First column (usually main data with image/avatar) -->
                            <div v-if="c === 1" class="flex items-center gap-4">
                                <Skeleton class="h-10 w-10 rounded-full flex-shrink-0" />
                                <div class="space-y-2">
                                    <Skeleton class="h-4 w-32" />
                                    <Skeleton class="h-3 w-20" />
                                </div>
                            </div>
                            <!-- Last column (usually actions) -->
                            <div v-else-if="c === columns" class="flex justify-end gap-2">
                                <Skeleton class="h-8 w-8 rounded-lg" />
                                <Skeleton class="h-8 w-8 rounded-lg" />
                            </div>
                            <!-- Middle columns -->
                            <div v-else class="flex items-center">
                                <Skeleton class="h-4 w-full max-w-[120px]" />
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </Card>
</template>
