<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import Card from '@/components/ui/card/Card.vue'
import CardContent from '@/components/ui/card/CardContent.vue'
import Badge from '@/components/ui/badge/Badge.vue'
import { Star, Trash2, Loader2 } from 'lucide-vue-next'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import { useToast } from '@/composables/useToast'
import { CardListSkeleton } from '@/components/ui/skeleton'

const { token } = useAuth()
const apiUrl = import.meta.env.VITE_API_URL
const toast = useToast()

const reviews = ref<any[]>([])
const loading = ref(true)
const deleting = ref<string | null>(null)

// Confirm Modal State
const showConfirm = ref(false)
const confirmMessage = ref('')
const itemToDelete = ref<any>(null)

const fetchReviews = async () => {
    loading.value = true
    try {
        const res = await fetch(
            `${apiUrl}/api/reviews?populate[trip][fields]=title&populate[user][fields]=username&sort=createdAt:desc`,
            { headers: { Authorization: `Bearer ${token.value}` } }
        )
        const data = await res.json()
        reviews.value = data.data || []
    } catch (err) {
        console.error('Error:', err)
    } finally {
        loading.value = false
    }
}

const deleteReview = (review: any) => {
    itemToDelete.value = review
    confirmMessage.value = `Sei sicuro di voler eliminare questa recensione?`
    showConfirm.value = true
}

const confirmDelete = async () => {
    if (!itemToDelete.value) return
    const review = itemToDelete.value
    showConfirm.value = false

    const docId = review.documentId || review.id
    deleting.value = docId
    try {
        const res = await fetch(`${apiUrl}/api/reviews/${docId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token.value}` },
        })
        if (!res.ok) throw new Error('Errore nella cancellazione')
        reviews.value = reviews.value.filter((r: any) => (r.documentId || r.id) !== docId)
        toast.success('Recensione eliminata con successo')
    } catch (err) {
        console.error('Delete error:', err)
        toast.error('Errore nella cancellazione')
    } finally {
        deleting.value = null
        itemToDelete.value = null
    }
}

const getTripTitle = (review: any) => {
    return review.trip?.title || review.trip?.data?.attributes?.title || '—'
}

onMounted(fetchReviews)
</script>

<template>
    <div class="p-6 lg:p-10">
        <!-- Header -->
        <div class="mb-8">
            <h1 class="text-2xl font-black text-slate-900">Recensioni</h1>
            <p class="text-slate-500 text-sm font-medium">Modera le recensioni della piattaforma</p>
        </div>

        <!-- Loading -->
        <CardListSkeleton v-if="loading" :count="3" />

        <!-- Empty -->
        <Card v-else-if="reviews.length === 0" class="rounded-2xl border-none shadow-sm">
            <CardContent class="p-12 text-center">
                <Star class="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p class="text-lg font-bold text-slate-600">Nessuna recensione</p>
                <p class="text-sm text-slate-400 mt-1">Le recensioni appariranno qui quando gli utenti le scriveranno
                </p>
            </CardContent>
        </Card>

        <!-- Reviews List -->
        <div v-else class="space-y-4">
            <Card v-for="review in reviews" :key="review.documentId || review.id"
                class="rounded-2xl border-none shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <CardContent class="p-6">
                    <div class="flex items-start justify-between gap-4">
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-3 mb-2 flex-wrap">
                                <span class="font-bold text-slate-800">{{ review.authorName }}</span>
                                <Badge
                                    class="bg-primary/10 text-primary border-none font-bold hover:bg-primary/10 cursor-default text-xs">
                                    {{ getTripTitle(review) }}
                                </Badge>
                            </div>
                            <!-- Stars -->
                            <div class="flex items-center gap-0.5 mb-3">
                                <Star v-for="i in 5" :key="i" :class="[
                                    'w-4 h-4',
                                    i <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                                ]" />
                                <span class="ml-2 text-xs font-bold text-slate-500">{{ review.rating }}/5</span>
                            </div>
                            <p v-if="review.content" class="text-sm text-slate-600 leading-relaxed">{{ review.content }}
                            </p>
                            <p v-if="review.travelPeriod" class="text-xs text-slate-400 mt-2">
                                Periodo: {{ review.travelPeriod }}
                            </p>
                        </div>
                        <button @click="deleteReview(review)" :disabled="deleting === (review.documentId || review.id)"
                            class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors flex-shrink-0 disabled:opacity-50">
                            <Loader2 v-if="deleting === (review.documentId || review.id)"
                                class="w-4 h-4 animate-spin" />
                            <Trash2 v-else class="w-4 h-4" />
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>

    <!-- Confirm Dialog -->
    <ConfirmDialog :isOpen="showConfirm" title="Elimina Recensione" :message="confirmMessage"
        confirmText="Elimina definitivamente" variant="danger" @close="showConfirm = false" @confirm="confirmDelete" />
</template>
