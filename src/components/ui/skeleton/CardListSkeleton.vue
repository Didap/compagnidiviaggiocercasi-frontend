<script setup lang="ts">
import Skeleton from './Skeleton.vue'
import Card from '@/components/ui/card/Card.vue'

interface Props {
    count?: number
}

withDefaults(defineProps<Props>(), {
    count: 3
})
</script>

<template>
    <div class="space-y-4">
        <Card v-for="i in count" :key="i" class="rounded-2xl border-none shadow-sm overflow-hidden">
            <div class="p-6 flex items-start justify-between gap-4">
                <div class="flex-1 space-y-3">
                    <div class="flex items-center gap-3">
                        <Skeleton class="h-5 w-32" /> <!-- Name -->
                        <Skeleton class="h-6 w-24 rounded-full" /> <!-- Badge -->
                    </div>
                    <div class="flex items-center gap-1">
                        <Skeleton class="h-4 w-4 rounded-full" /> <!-- Star -->
                        <Skeleton class="h-4 w-4 rounded-full" /> <!-- Star -->
                        <Skeleton class="h-4 w-4 rounded-full" /> <!-- Star -->
                        <Skeleton class="h-4 w-4 rounded-full" /> <!-- Star -->
                        <Skeleton class="h-4 w-4 rounded-full" /> <!-- Star -->
                        <Skeleton class="h-3 w-8 ml-2" /> <!-- Rating -->
                    </div>
                    <Skeleton class="h-4 w-full" /> <!-- Content Line 1 -->
                    <Skeleton class="h-4 w-2/3" /> <!-- Content Line 2 -->
                </div>
                <!-- Delete Button -->
                <Skeleton class="h-10 w-10 rounded-xl flex-shrink-0" />
            </div>
        </Card>
    </div>
</template>
