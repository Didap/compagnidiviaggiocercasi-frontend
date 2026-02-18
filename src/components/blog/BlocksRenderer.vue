<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  content: any[]
}>()

const blocks = computed(() => props.content || [])
</script>

<template>
  <div class="prose prose-lg prose-slate max-w-none">
    <template v-for="(block, index) in blocks" :key="index">
      
      <!-- Paragraph -->
      <p v-if="block.type === 'paragraph'" class="mb-6">
        <template v-for="(child, childIndex) in block.children" :key="childIndex">
          <span :class="{
            'font-bold': child.bold,
            'italic': child.italic,
            'underline': child.underline,
            'line-through': child.strikethrough,
            'bg-gray-100 px-1 rounded': child.code
          }">
            {{ child.text }}
          </span>
        </template>
      </p>

      <!-- Headings -->
      <h1 v-else-if="block.type === 'heading' && block.level === 1" class="text-4xl font-black mb-6 mt-12 text-primary">
        {{ block.children[0].text }}
      </h1>
      <h2 v-else-if="block.type === 'heading' && block.level === 2" class="text-3xl font-bold mb-5 mt-10 text-primary">
        {{ block.children[0].text }}
      </h2>
      <h3 v-else-if="block.type === 'heading' && block.level === 3" class="text-2xl font-bold mb-4 mt-8 text-secondary">
        {{ block.children[0].text }}
      </h3>
      <h4 v-else-if="block.type === 'heading' && block.level === 4" class="text-xl font-bold mb-3 mt-6">
        {{ block.children[0].text }}
      </h4>
      <h5 v-else-if="block.type === 'heading' && block.level === 5" class="text-lg font-bold mb-2 mt-4">
        {{ block.children[0].text }}
      </h5>
      <h6 v-else-if="block.type === 'heading' && block.level === 6" class="text-base font-bold mb-2 mt-4">
        {{ block.children[0].text }}
      </h6>

      <!-- Lists -->
      <ul v-else-if="block.type === 'list' && block.format === 'unordered'" class="list-disc pl-6 mb-6 space-y-2">
        <li v-for="(item, itemIndex) in block.children" :key="itemIndex">
          <template v-for="(child, childIndex) in item.children" :key="childIndex">
             <span :class="{
            'font-bold': child.bold,
            'italic': child.italic,
            'underline': child.underline,
            'line-through': child.strikethrough,
            'bg-gray-100 px-1 rounded': child.code
          }">
            {{ child.text }}
          </span>
          </template>
        </li>
      </ul>

      <ol v-else-if="block.type === 'list' && block.format === 'ordered'" class="list-decimal pl-6 mb-6 space-y-2">
        <li v-for="(item, itemIndex) in block.children" :key="itemIndex">
          <template v-for="(child, childIndex) in item.children" :key="childIndex">
             <span :class="{
            'font-bold': child.bold,
            'italic': child.italic,
            'underline': child.underline,
            'line-through': child.strikethrough,
            'bg-gray-100 px-1 rounded': child.code
          }">
            {{ child.text }}
          </span>
          </template>
        </li>
      </ol>

      <!-- Quote -->
      <blockquote v-else-if="block.type === 'quote'" class="border-l-4 border-secondary pl-6 italic text-gray-600 my-8 py-2 bg-gray-50 rounded-r-lg">
        <p v-for="(child, childIndex) in block.children" :key="childIndex">
          {{ child.text }}
        </p>
      </blockquote>

      <!-- Code -->
      <pre v-else-if="block.type === 'code'" class="bg-gray-900 text-white p-6 rounded-xl overflow-x-auto mb-6">
        <code>{{ block.children[0].text }}</code>
      </pre>

      <!-- Image -->
      <div v-else-if="block.type === 'image'" class="my-8">
        <img :src="block.image.url" :alt="block.image.alternativeText || ''" class="rounded-xl shadow-lg w-full h-auto" />
        <p v-if="block.image.caption" class="text-center text-sm text-gray-500 mt-2">{{ block.image.caption }}</p>
      </div>

    </template>
  </div>
</template>
