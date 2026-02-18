<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBlog } from '@/composables/useBlog'
import Button from '@/components/ui/button/Button.vue'
import { ArrowLeft, Loader2 } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'

const route = useRoute()
const router = useRouter()
const { createPost, updatePost, getAllPosts } = useBlog()
const { addToast } = useToast()

const isEditing = computed(() => route.params.id !== 'new')
const isLoading = ref(false)
const isSaving = ref(false)

const formData = ref({
    title: '',
    slug: '',
    excerpt: '',
    category: '',
    content: '' // We will treat this as a simple string for editing, and convert to blocks on save
})

// Helper to convert blocks to string (very basic)
const blocksToString = (blocks: any[]) => {
    if (!blocks) return ''
    return blocks
        .map(block => {
            if (block.type === 'paragraph') {
                return block.children.map((c: any) => c.text).join('')
            }
            return ''
        })
        .join('\n\n')
}

// Helper to convert string to blocks (very basic)
const stringToBlocks = (text: string) => {
    return text.split('\n\n').map(para => ({
        type: 'paragraph',
        children: [{ type: 'text', text: para.trim() }]
    })).filter(b => b.children?.[0]?.text)
}

const generateSlug = (title: string) => {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
}

const handleTitleInput = () => {
    if (!isEditing.value) {
        formData.value.slug = generateSlug(formData.value.title)
    }
}

onMounted(async () => {
    if (isEditing.value) {
        isLoading.value = true
        try {
            // We need to find the post by documentId, but our composable only has getPostBySlug or getAllPosts.
            // For now, let's fetch all and find by ID, or if we had a getById.
            // Wait, my composable has deletePost(documentId) but getPostBySlug.
            // I should use getAllPosts and find it, or fetching by ID would be better.
            // Since I don't want to update composable right now, I'll fetch all.
            const allPosts = await getAllPosts()
            const post = allPosts.find(p => p.documentId === route.params.id)
            
            if (post) {
                formData.value = {
                    title: post.title,
                    slug: post.slug,
                    excerpt: post.excerpt,
                    category: post.category || '',
                    content: blocksToString(post.content)
                }
            } else {
                addToast({ title: 'Errore', message: 'Articolo non trovato', type: 'error' })
                router.push('/dashboard/posts')
            }
        } catch (e) {
            addToast({ title: 'Errore', message: 'Impossibile caricare l\'articolo', type: 'error' })
        } finally {
            isLoading.value = false
        }
    }
})

const handleSubmit = async () => {
    isSaving.value = true
    try {
        const payload = {
            title: formData.value.title,
            slug: formData.value.slug,
            excerpt: formData.value.excerpt,
            category: formData.value.category,
            content: stringToBlocks(formData.value.content)
        }

        if (isEditing.value) {
            await updatePost(route.params.id as string, payload)
            addToast({ title: 'Successo', message: 'Articolo aggiornato con successo', type: 'success' })
        } else {
            await createPost(payload)
            addToast({ title: 'Successo', message: 'Articolo creato con successo', type: 'success' })
        }
        router.push('/dashboard/posts')
    } catch (e) {
        addToast({ title: 'Errore', message: 'Si è verificato un errore durante il salvataggio', type: 'error' })
    } finally {
        isSaving.value = false
    }
}
</script>

<template>
    <div class="space-y-6 max-w-4xl mx-auto">
        <div class="flex items-center gap-4">
            <Button variant="ghost" size="icon" @click="router.back()">
                <ArrowLeft class="w-5 h-5" />
            </Button>
            <div>
                <h1 class="text-2xl font-bold text-primary">
                    {{ isEditing ? 'Modifica Articolo' : 'Nuovo Articolo' }}
                </h1>
            </div>
        </div>

        <div v-if="isLoading" class="flex justify-center py-20">
            <Loader2 class="w-8 h-8 animate-spin text-primary" />
        </div>

        <form v-else @submit.prevent="handleSubmit" class="space-y-8 bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm">
            
            <!-- Title -->
            <div class="space-y-2">
                <label class="text-sm font-bold text-gray-700">Titolo</label>
                <input v-model="formData.title" @input="handleTitleInput" type="text" required
                    class="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
            </div>

            <!-- Slug -->
            <div class="space-y-2">
                <label class="text-sm font-bold text-gray-700">Slug (URL)</label>
                <input v-model="formData.slug" type="text" required
                    class="w-full px-4 py-2 rounded-lg border border-slate-300 bg-slate-50 text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
            </div>

            <!-- Category -->
            <div class="space-y-2">
                <label class="text-sm font-bold text-gray-700">Categoria</label>
                <input v-model="formData.category" type="text" placeholder="Es. Esperienze, Consigli..."
                    class="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
            </div>

            <!-- Excerpt -->
            <div class="space-y-2">
                <label class="text-sm font-bold text-gray-700">Breve Descrizione</label>
                <textarea v-model="formData.excerpt" rows="2" required
                    class="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"></textarea>
                <p class="text-xs text-gray-500">Apparrà nelle anteprime.</p>
            </div>

            <!-- Content -->
            <div class="space-y-2">
                <label class="text-sm font-bold text-gray-700">Contenuto (Paragrafi)</label>
                <div class="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm mb-2">
                    <strong>Nota:</strong> Questa è una modalità di modifica semplificata. Ogni doppio a capo creerà un nuovo paragrafo. Per formattazione avanzata (immagini, titoli), usa il pannello Admin di Strapi.
                </div>
                <textarea v-model="formData.content" rows="15" required
                    class="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono text-sm"></textarea>
            </div>

            <!-- Actions -->
            <div class="flex items-center justify-end gap-4 pt-4 border-t border-slate-100">
                <Button type="button" variant="ghost" @click="router.back()">
                    Annulla
                </Button>
                <Button type="submit" :disabled="isSaving" class="min-w-[120px]">
                    <Loader2 v-if="isSaving" class="w-4 h-4 animate-spin mr-2" />
                    {{ isSaving ? 'Salvataggio...' : 'Salva Articolo' }}
                </Button>
            </div>
        </form>
    </div>
</template>
