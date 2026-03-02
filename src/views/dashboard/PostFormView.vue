<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBlog } from '@/composables/useBlog'
import Button from '@/components/ui/button/Button.vue'
import Card from '@/components/ui/card/Card.vue'
import CardContent from '@/components/ui/card/CardContent.vue'
import { ArrowLeft, Loader2, Image as ImageIcon, Save, Upload } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'
import RichTextEditor from '@/components/dashboard/RichTextEditor.vue'

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

const route = useRoute()
const router = useRouter()
const { createPost, updatePost, getAllPosts, uploadFile } = useBlog()
const { addToast } = useToast()

const isEditing = computed(() => !!route.params.id && route.params.id !== 'new')
const isLoading = ref(false)
const isSaving = ref(false)

const coverFile = ref<File | null>(null)
const coverPreview = ref<string | null>(null)

const formData = ref({
    title: '',
    slug: '',
    excerpt: '',
    category: '',
    cover: null as any,
    content: ''
})

onMounted(async () => {
    if (!isEditing.value) return

    isLoading.value = true
    try {
        const allPosts = await getAllPosts()
        const post = allPosts.find(p => p.documentId === route.params.id)

        if (post) {
            formData.value = {
                title: post.title,
                slug: post.slug,
                excerpt: post.excerpt,
                category: post.category || '',
                cover: post.cover || null,
                content: blocksToString(post.content)
            }
            if (post.cover?.url) {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:1337'
                coverPreview.value = `${API_URL}${post.cover.url}`
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
})

const handleImageChange = (event: Event) => {
    const input = event.target as HTMLInputElement
    if (input.files && input.files.length > 0) {
        const file = input.files[0]
        if (file) {
            coverFile.value = file
            coverPreview.value = URL.createObjectURL(file)
        }
    }
}

const removeImage = () => {
    coverFile.value = null
    coverPreview.value = null
    formData.value.cover = null
}

const handleSubmit = async () => {
    isSaving.value = true
    try {
        let coverId = formData.value.cover?.id

        if (coverFile.value) {
            const uploadedFile = await uploadFile(coverFile.value)
            coverId = uploadedFile.id
        }

        const payload = {
            title: formData.value.title,
            slug: formData.value.slug,
            excerpt: formData.value.excerpt,
            category: formData.value.category,
            cover: coverId,
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
    <div class="p-6 lg:p-10 max-w-4xl">
        <!-- Header -->
        <div class="flex items-center gap-4 mb-8">
            <button @click="router.push('/dashboard/posts')"
                class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                <ArrowLeft class="w-5 h-5" />
            </button>
            <div>
                <h1 class="text-2xl font-black text-slate-900">
                    <span v-if="isEditing">Modifica Articolo</span>
                    <span v-else>Crea Nuovo Articolo</span>
                </h1>
                <p class="text-sm text-slate-500 font-medium">
                    <span v-if="isEditing">Modifica i dettagli del post esistente</span>
                    <span v-else>Compila i campi per creare un nuovo post per il blog</span>
                </p>
            </div>
        </div>

        <!-- Loading state -->
        <div v-if="isLoading" class="flex justify-center py-20">
            <div class="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
        </div>

        <!-- Content -->
        <form v-else @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Basic Info -->
            <Card class="rounded-2xl border-none shadow-sm overflow-hidden">
                <CardContent class="p-6 space-y-5">
                    <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider">Informazioni Base</h3>

                    <div>
                        <label class="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Titolo *</label>
                        <input v-model="formData.title" type="text"
                            class="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            placeholder="Es. Le migliori spiagge da visitare..." required />
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Slug (URL)</label>
                            <input v-model="formData.slug" type="text"
                                class="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-slate-50"
                                placeholder="Lascia vuoto per generare in automatico..." />
                        </div>
                        <div>
                            <label class="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Categoria</label>
                            <input v-model="formData.category" type="text"
                                class="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                placeholder="Es. Esperienze, Consigli..." />
                        </div>
                    </div>

                    <div>
                        <label class="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Breve Descrizione
                            (Riassunto)</label>
                        <textarea v-model="formData.excerpt" rows="3"
                            class="w-full p-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            placeholder="Scrivi un breve riassunto dell'articolo..."></textarea>
                    </div>
                </CardContent>
            </Card>

            <!-- Cover Image -->
            <Card class="rounded-2xl border-none shadow-sm overflow-hidden">
                <CardContent class="p-6 space-y-4">
                    <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider">Immagine di Copertina</h3>

                    <div class="flex flex-col sm:flex-row items-start gap-4">
                        <!-- Preview -->
                        <div
                            class="relative w-full sm:w-64 aspect-video rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                            <img v-if="coverPreview" :src="coverPreview" alt="Cover Preview"
                                class="w-full h-full object-cover" />
                            <div v-else class="w-full h-full flex flex-col items-center justify-center text-slate-400">
                                <ImageIcon class="w-8 h-8 mb-2 opacity-50" />
                                <span class="text-xs font-medium">Nessuna immagine</span>
                            </div>
                            <!-- Remove button overlay -->
                            <button v-if="coverPreview" type="button" @click="removeImage"
                                class="absolute top-2 right-2 bg-red-500/90 text-white p-1.5 rounded-full hover:bg-red-600 shadow-sm transition-colors backdrop-blur-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
                                    stroke-linejoin="round">
                                    <path d="M18 6 6 18" />
                                    <path d="m6 6 12 12" />
                                </svg>
                            </button>
                        </div>

                        <!-- Upload controls -->
                        <div class="flex-1 w-full space-y-3">
                            <label
                                class="cursor-pointer inline-flex items-center justify-center sm:justify-start gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 rounded-xl text-sm font-bold text-slate-700 transition-all w-full sm:w-auto shadow-sm">
                                <Upload class="w-4 h-4" />
                                {{ coverPreview ? 'Cambia Immagine' : 'Carica Immagine' }}
                                <input type="file" class="hidden" accept="image/*" @change="handleImageChange" />
                            </label>
                            <p class="text-xs text-slate-400 leading-relaxed text-center sm:text-left">
                                Formati supportati: JPG, PNG, WEBP.<br>
                                Dimensione massima consigliata: 5MB.<br>
                                Rapporto di forma consigliato: 16:9.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <!-- Editor -->
            <Card class="rounded-2xl border-none shadow-sm overflow-hidden">
                <CardContent class="p-6 space-y-4">
                    <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider">Contenuto dell'Articolo</h3>
                    <div class="border border-slate-200 rounded-xl overflow-hidden bg-white">
                        <RichTextEditor v-model="formData.content"
                            placeholder="Inizia a scrivere il tuo articolo qui..." />
                    </div>
                </CardContent>
            </Card>

            <!-- Actions -->
            <div class="flex items-center gap-3 pt-2">
                <Button @click="router.push('/dashboard/posts')" variant="outline" type="button"
                    class="rounded-2xl px-6 h-12 font-bold border-slate-200">
                    Annulla
                </Button>
                <Button type="submit" :disabled="isSaving"
                    class="rounded-2xl px-8 h-12 font-bold shadow-lg hover:shadow-primary/30 transition-all gap-2">
                    <Loader2 v-if="isSaving" class="w-4 h-4 animate-spin" />
                    <Save v-else class="w-4 h-4" />
                    {{ isEditing ? 'Salva Modifiche' : 'Pubblica Articolo' }}
                </Button>
            </div>
        </form>
    </div>
</template>
