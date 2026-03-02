<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useBlog, type Post } from '@/composables/useBlog'
import Button from '@/components/ui/button/Button.vue'
import Card from '@/components/ui/card/Card.vue'
import CardContent from '@/components/ui/card/CardContent.vue'
import Badge from '@/components/ui/badge/Badge.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import { TableSkeleton } from '@/components/ui/skeleton'
import { Plus, Pencil, Trash2, Eye, FileText, Loader2, Search } from 'lucide-vue-next'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'

const router = useRouter()
const { getAllPosts, deletePost } = useBlog()

const posts = ref<Post[]>([])
const loading = ref(true)
const deleting = ref<string | null>(null)
const searchQuery = ref('')

// Confirm Modal State
const showConfirm = ref(false)
const confirmMessage = ref('')
const itemToDelete = ref<Post | null>(null)

const fetchPosts = async () => {
    loading.value = true
    try {
        posts.value = await getAllPosts()
    } catch (e) {
        console.error(e)
    } finally {
        loading.value = false
    }
}

onMounted(fetchPosts)

const confirmDelete = (post: Post) => {
    itemToDelete.value = post
    confirmMessage.value = `Sei sicuro di voler eliminare l'articolo "${post.title}"? Questa azione è irreversibile.`
    showConfirm.value = true
}

const handleDelete = async () => {
    if (!itemToDelete.value) return
    const id = itemToDelete.value.documentId

    deleting.value = id
    showConfirm.value = false

    try {
        await deletePost(id)
        await fetchPosts()
    } catch (e) {
        alert('Errore durante l\'eliminazione')
    } finally {
        deleting.value = null
        itemToDelete.value = null
    }
}

const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: it })
}

const filteredPosts = computed(() => {
    if (!searchQuery.value) return posts.value
    const q = searchQuery.value.toLowerCase()
    return posts.value.filter(p =>
        p.title.toLowerCase().includes(q) ||
        (p.category && p.category.toLowerCase().includes(q))
    )
})
</script>

<template>
    <div class="p-6 lg:p-10">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
                <h1 class="text-2xl font-black text-slate-900">Articoli Blog</h1>
                <p class="text-slate-500 text-sm font-medium">Gestisci le news e le storie.</p>
            </div>
            <RouterLink to="/dashboard/posts/new">
                <Button class="rounded-2xl px-6 h-11 font-bold shadow-md hover:shadow-primary/30 transition-all gap-2">
                    <Plus class="w-4 h-4" /> Nuovo Articolo
                </Button>
            </RouterLink>
        </div>

        <!-- Filters -->
        <Card class="mb-6 rounded-2xl border-none shadow-sm">
            <div class="p-4 flex gap-4">
                <div class="relative flex-1">
                    <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input v-model="searchQuery" type="text" placeholder="Cerca articolo (titolo o categoria)..."
                        class="w-full pl-10 pr-4 h-10 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
            </div>
        </Card>

        <!-- Loading -->
        <TableSkeleton v-if="loading" :rows="5" :columns="5" />

        <!-- Empty -->
        <Card v-else-if="posts.length === 0" class="rounded-2xl border-none shadow-sm">
            <CardContent class="p-12 text-center">
                <FileText class="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p class="text-lg font-bold text-slate-600 mb-2">Nessun articolo trovato</p>
                <p class="text-sm text-slate-400 mb-6">Crea il primo post per il tuo blog</p>
                <RouterLink to="/dashboard/posts/new">
                    <Button class="rounded-2xl px-6 h-11 font-bold gap-2">
                        <Plus class="w-4 h-4" /> Crea Articolo
                    </Button>
                </RouterLink>
            </CardContent>
        </Card>

        <!-- Posts Table -->
        <Card v-else class="rounded-2xl border-none shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead>
                        <tr class="border-b border-slate-100">
                            <th class="text-left py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                Titolo</th>
                            <th
                                class="text-left py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:table-cell">
                                Autore</th>
                            <th
                                class="text-left py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider hidden md:table-cell">
                                Categoria</th>
                            <th
                                class="text-left py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:table-cell">
                                Data</th>
                            <th class="text-right py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                Azioni</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="post in filteredPosts" :key="post.id"
                            class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                            <td class="py-4 px-6">
                                <div class="min-w-0">
                                    <p class="font-bold text-slate-800 truncate">{{ post.title }}</p>
                                    <p class="text-xs text-slate-400 truncate sm:hidden">
                                        {{ formatDate(post.publishedAt) }} • {{ post.category || 'Nessuna cat.' }}
                                    </p>
                                </div>
                            </td>
                            <td class="py-4 px-4 hidden sm:table-cell">
                                <span class="text-sm font-medium text-slate-600">{{ post.author?.username || 'Redazione'
                                    }}</span>
                            </td>
                            <td class="py-4 px-4 hidden md:table-cell">
                                <Badge v-if="post.category"
                                    class="bg-blue-50 text-blue-600 border-none font-medium hover:bg-blue-50 cursor-default">
                                    {{ post.category }}
                                </Badge>
                                <span v-else class="text-gray-400 text-sm">-</span>
                            </td>
                            <td class="py-4 px-4 hidden sm:table-cell">
                                <span class="text-sm text-slate-600">{{ formatDate(post.publishedAt) }}</span>
                            </td>
                            <td class="py-4 px-6">
                                <div class="flex items-center justify-end gap-2">
                                    <button @click="router.push(`/blog/${post.slug}`)"
                                        class="p-2 text-slate-400 hover:text-secondary hover:bg-secondary/10 rounded-xl transition-colors"
                                        title="Vedi nel sito">
                                        <Eye class="w-4 h-4" />
                                    </button>
                                    <RouterLink :to="`/dashboard/posts/${post.documentId}`">
                                        <button
                                            class="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-colors"
                                            title="Modifica">
                                            <Pencil class="w-4 h-4" />
                                        </button>
                                    </RouterLink>
                                    <button @click="confirmDelete(post)" :disabled="deleting === post.documentId"
                                        class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                                        title="Elimina">
                                        <Loader2 v-if="deleting === post.documentId" class="w-4 h-4 animate-spin" />
                                        <Trash2 v-else class="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </Card>
    </div>

    <!-- Confirm Dialog -->
    <ConfirmDialog :isOpen="showConfirm" title="Elimina Articolo" :message="confirmMessage"
        confirmText="Elimina definitivamente" variant="danger" @close="showConfirm = false" @confirm="handleDelete" />
</template>
