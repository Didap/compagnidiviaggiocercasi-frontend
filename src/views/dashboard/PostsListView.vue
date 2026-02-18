<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBlog, type Post } from '@/composables/useBlog'
import Button from '@/components/ui/button/Button.vue'
import { Plus, Pencil, Trash2, Eye } from 'lucide-vue-next'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'

const router = useRouter()
const { getAllPosts, deletePost } = useBlog()

const posts = ref<Post[]>([])
const isLoading = ref(true)

const fetchPosts = async () => {
    isLoading.value = true
    try {
        posts.value = await getAllPosts()
    } catch (e) {
        console.error(e)
    } finally {
        isLoading.value = false
    }
}

onMounted(fetchPosts)

const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo articolo?')) return
    try {
        await deletePost(id)
        await fetchPosts()
    } catch (e) {
        alert('Errore durante l\'eliminazione')
    }
}

const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: it })
}
</script>

<template>
    <div class="space-y-6">
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-2xl font-bold text-primary">Articoli Blog</h1>
                <p class="text-gray-500">Gestisci le news e le storie.</p>
            </div>
            <Button @click="router.push('/dashboard/posts/new')" class="gap-2">
                <Plus class="w-4 h-4" /> Nuovo Articolo
            </Button>
        </div>

        <div class="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-sm text-left">
                    <thead class="text-xs text-gray-500 uppercase bg-gray-50 border-b border-slate-200">
                        <tr>
                            <th class="px-6 py-4 font-bold">Titolo</th>
                            <th class="px-6 py-4 font-bold">Autore</th>
                            <th class="px-6 py-4 font-bold">Categoria</th>
                            <th class="px-6 py-4 font-bold">Data</th>
                            <th class="px-6 py-4 font-bold text-right">Azioni</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        <tr v-if="isLoading">
                            <td colspan="5" class="px-6 py-8 text-center text-gray-500">
                                Caricamento...
                            </td>
                        </tr>
                        <tr v-else-if="posts.length === 0">
                            <td colspan="5" class="px-6 py-8 text-center text-gray-500">
                                Nessun articolo trovato.
                            </td>
                        </tr>
                        <tr v-for="post in posts" :key="post.id" class="hover:bg-slate-50/50 transition-colors">
                            <td class="px-6 py-4 font-medium text-gray-900">
                                {{ post.title }}
                            </td>
                            <td class="px-6 py-4 text-gray-600">
                                {{ post.author?.username || 'Redazione' }}
                            </td>
                            <td class="px-6 py-4">
                                <span v-if="post.category" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {{ post.category }}
                                </span>
                                <span v-else class="text-gray-400">-</span>
                            </td>
                            <td class="px-6 py-4 text-gray-600">
                                {{ formatDate(post.publishedAt) }}
                            </td>
                            <td class="px-6 py-4 text-right">
                                <div class="flex items-center justify-end gap-2">
                                    <Button variant="ghost" size="icon" @click="router.push(`/blog/${post.slug}`)" title="Vedi">
                                        <Eye class="w-4 h-4 text-gray-500" />
                                    </Button>
                                    <Button variant="ghost" size="icon" @click="router.push(`/dashboard/posts/${post.documentId}`)" title="Modifica">
                                        <Pencil class="w-4 h-4 text-blue-500" />
                                    </Button>
                                    <Button variant="ghost" size="icon" @click="handleDelete(post.documentId)" title="Elimina">
                                        <Trash2 class="w-4 h-4 text-red-500" />
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>
