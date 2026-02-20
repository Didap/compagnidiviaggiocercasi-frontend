<script setup lang="ts">
import { watch, onBeforeUnmount } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import {
    Bold, Italic, List, ListOrdered, Heading3, RemoveFormatting, Undo, Redo,
} from 'lucide-vue-next'

const props = defineProps<{
    modelValue: string
    placeholder?: string
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
}>()

const editor = useEditor({
    content: props.modelValue || '',
    extensions: [
        StarterKit.configure({
            heading: { levels: [3] },
        }),
    ],
    editorProps: {
        attributes: {
            class: 'prose prose-sm max-w-none focus:outline-none min-h-[120px] px-4 py-3 text-sm font-medium text-slate-800',
        },
    },
    onUpdate: ({ editor }) => {
        emit('update:modelValue', editor.getHTML())
    },
})

// Sync external changes into the editor
watch(() => props.modelValue, (newVal) => {
    if (editor.value && editor.value.getHTML() !== newVal) {
        editor.value.commands.setContent(newVal || '')
    }
})

onBeforeUnmount(() => {
    editor.value?.destroy()
})

const toolbarButtons = [
    { action: () => editor.value?.chain().focus().toggleBold().run(), isActive: () => editor.value?.isActive('bold'), icon: Bold, title: 'Grassetto' },
    { action: () => editor.value?.chain().focus().toggleItalic().run(), isActive: () => editor.value?.isActive('italic'), icon: Italic, title: 'Corsivo' },
    { action: () => editor.value?.chain().focus().toggleHeading({ level: 3 }).run(), isActive: () => editor.value?.isActive('heading', { level: 3 }), icon: Heading3, title: 'Titolo' },
    { action: () => editor.value?.chain().focus().toggleBulletList().run(), isActive: () => editor.value?.isActive('bulletList'), icon: List, title: 'Lista puntata' },
    { action: () => editor.value?.chain().focus().toggleOrderedList().run(), isActive: () => editor.value?.isActive('orderedList'), icon: ListOrdered, title: 'Lista numerata' },
    null, // separator
    { action: () => editor.value?.chain().focus().unsetAllMarks().clearNodes().run(), isActive: () => false, icon: RemoveFormatting, title: 'Rimuovi formattazione' },
    { action: () => editor.value?.chain().focus().undo().run(), isActive: () => false, icon: Undo, title: 'Annulla' },
    { action: () => editor.value?.chain().focus().redo().run(), isActive: () => false, icon: Redo, title: 'Ripristina' },
]
</script>

<template>
    <div
        class="rounded-xl border border-slate-200 overflow-hidden transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary">
        <!-- Toolbar -->
        <div class="flex items-center gap-0.5 px-2 py-1.5 bg-slate-50 border-b border-slate-200">
            <template v-for="(btn, i) in toolbarButtons" :key="i">
                <div v-if="!btn" class="w-px h-5 bg-slate-200 mx-1"></div>
                <button v-else type="button" @click="btn.action" :title="btn.title"
                    class="p-1.5 rounded-lg transition-colors"
                    :class="btn.isActive() ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'">
                    <component :is="btn.icon" class="w-4 h-4" />
                </button>
            </template>
        </div>

        <!-- Editor -->
        <EditorContent :editor="editor" />
    </div>
</template>

<style>
/* Tiptap editor content styling */
.ProseMirror {
    min-height: 120px;
}

.ProseMirror p.is-editor-empty:first-child::before {
    content: attr(data-placeholder);
    float: left;
    color: #94a3b8;
    pointer-events: none;
    height: 0;
}

.ProseMirror:focus {
    outline: none;
}

.ProseMirror h3 {
    font-size: 1.1rem;
    font-weight: 700;
    color: #1e293b;
    margin-top: 1rem;
    margin-bottom: 0.5rem;
}

.ProseMirror ul,
.ProseMirror ol {
    padding-left: 1.5rem;
    margin: 0.5rem 0;
}

.ProseMirror li {
    margin: 0.25rem 0;
}

.ProseMirror p {
    margin: 0.25rem 0;
}
</style>
