<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import Card from '@/components/ui/card/Card.vue'
import CardContent from '@/components/ui/card/CardContent.vue'
import Badge from '@/components/ui/badge/Badge.vue'
import { Star, Trash2, Loader2, Eye, EyeOff, X } from 'lucide-vue-next'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import { useToast } from '@/composables/useToast'
import { CardListSkeleton } from '@/components/ui/skeleton'

const { token } = useAuth()
const apiUrl = import.meta.env.VITE_API_URL
const toast = useToast()

const reviews = ref<any[]>([])
const loading = ref(true)
const deleting = ref<string | null>(null)
const selectedReview = ref<any>(null)

// Confirm Modal State
const showConfirm = ref(false)
const confirmMessage = ref('')
const itemToDelete = ref<any>(null)

const fetchReviews = async () => {
    loading.value = true
    try {
        const res = await fetch(
            `${apiUrl}/api/reviews?populate[trip][fields]=title&populate[user][fields]=username&sort=createdAt:desc&publicationState=preview`,
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

const togglePublish = async (review: any) => {
    const isPublished = !!review.publishedAt
    const docId = review.documentId || review.id

    // Optimistic UI update
    const originalState = review.publishedAt
    review.publishedAt = isPublished ? null : new Date().toISOString()

    try {
        const res = await fetch(`${apiUrl}/api/reviews/${docId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token.value}`
            },
            body: JSON.stringify({
                data: {
                    publishedAt: isPublished ? null : new Date().toISOString()
                }
            })
        })

        if (!res.ok) {
            review.publishedAt = originalState // Revert
            throw new Error('Failed to update')
        }

        toast.success(isPublished ? 'Recensione nascosta (Bozza)' : 'Recensione pubblicata')
    } catch (err) {
        console.error('Error toggling publish:', err)
        toast.error('Errore nell\'aggiornamento dello stato')
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
                class="rounded-2xl border-none shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
                @click="selectedReview = review">
                <CardContent class="p-6">
                    <div class="flex items-start justify-between gap-4">
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-3 mb-2 flex-wrap">
                                <span class="font-bold text-slate-800">{{ review.authorName }}</span>
                                <Badge
                                    class="bg-primary/10 text-primary border-none font-bold hover:bg-primary/10 cursor-default text-xs">
                                    {{ getTripTitle(review) }}
                                </Badge>
                                <Badge
                                    :class="review.publishedAt ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'"
                                    class="border-none font-bold text-[10px] uppercase">
                                    {{ review.publishedAt ? 'Pubblicata' : 'Bozza' }}
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
                        <div class="flex flex-col gap-2">
                            <button @click="togglePublish(review)" :class="[
                                'p-2 rounded-xl transition-colors flex-shrink-0',
                                review.publishedAt ? 'text-green-600 hover:bg-green-50' : 'text-slate-400 hover:bg-slate-100'
                            ]" :title="review.publishedAt ? 'Nascondi' : 'Pubblica'">
                                <Eye v-if="review.publishedAt" class="w-4 h-4" />
                                <EyeOff v-else class="w-4 h-4" />
                            </button>
                            <button @click="deleteReview(review)"
                                :disabled="deleting === (review.documentId || review.id)"
                                class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors flex-shrink-0 disabled:opacity-50"
                                title="Elimina">
                                <Loader2 v-if="deleting === (review.documentId || review.id)"
                                    class="w-4 h-4 animate-spin" />
                                <Trash2 v-else class="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>

    <!-- Confirm Dialog -->
    <ConfirmDialog :isOpen="showConfirm" title="Elimina Recensione" :message="confirmMessage"
        confirmText="Elimina definitivamente" variant="danger" @close="showConfirm = false" @confirm="confirmDelete" />

    <!-- Review Details Modal -->
    <Teleport to="body">
        <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0"
            enter-to-class="opacity-100" leave-active-class="transition duration-200 ease-in"
            leave-from-class="opacity-100" leave-to-class="opacity-0">
            <div v-if="selectedReview" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="selectedReview = null"></div>
                <div
                    class="relative bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                    <!-- Header -->
                    <div
                        class="p-6 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md z-10">
                        <div>
                            <h2 class="text-xl font-black text-slate-900">Dettagli Recensione</h2>
                            <p class="text-sm text-slate-500 font-medium">{{ getTripTitle(selectedReview) }}</p>
                        </div>
                        <button @click="selectedReview = null"
                            class="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                            <X class="w-5 h-5" />
                        </button>
                    </div>

                    <!-- Content -->
                    <div class="overflow-y-auto p-6 space-y-6">
                        <!-- Status & Actions -->
                        <div class="bg-slate-50 p-4 rounded-xl flex items-center justify-between">
                            <Badge
                                :class="selectedReview.publishedAt ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'"
                                class="border-none font-bold">
                                {{ selectedReview.publishedAt ? 'Pubblicata' : 'Bozza' }}
                            </Badge>
                            <div class="flex items-center gap-2">
                                <button @click="togglePublish(selectedReview)"
                                    class="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                                    :class="selectedReview.publishedAt ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-green-100 text-green-700 hover:bg-green-200'">
                                    {{ selectedReview.publishedAt ? 'Nascondi' : 'Pubblica' }}
                                </button>
                                <button @click="deleteReview(selectedReview); selectedReview = null"
                                    class="px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-xs font-bold transition-colors">
                                    Elimina
                                </button>
                            </div>
                        </div>

                        <!-- Author & Rating -->
                        <div class="grid grid-cols-2 gap-4">
                            <div class="p-4 rounded-xl border border-slate-100 bg-white">
                                <p class="text-xs font-bold text-slate-400 uppercase mb-1">Autore</p>
                                <p class="text-lg font-bold text-slate-900">{{ selectedReview.authorName || 'Anonimo' }}</p>
                                <p v-if="selectedReview.user?.username" class="text-xs text-slate-400">@{{ selectedReview.user.username }}</p>
                            </div>
                            <div class="p-4 rounded-xl border border-slate-100 bg-white">
                                <p class="text-xs font-bold text-slate-400 uppercase mb-1">Valutazione</p>
                                <div class="flex items-center gap-1 mt-1">
                                    <Star v-for="i in 5" :key="i" :class="[
                                        'w-5 h-5',
                                        i <= selectedReview.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                                    ]" />
                                    <span class="ml-2 text-lg font-black text-slate-900">{{ selectedReview.rating }}/5</span>
                                </div>
                            </div>
                        </div>

                        <!-- Review Content -->
                        <div v-if="selectedReview.content">
                            <h3 class="text-xs font-bold text-slate-400 uppercase mb-2">Contenuto</h3>
                            <div class="p-4 border border-slate-100 rounded-xl bg-white text-slate-600 leading-relaxed text-sm">
                                {{ selectedReview.content }}
                            </div>
                        </div>

                        <!-- Travel Period -->
                        <div v-if="selectedReview.travelPeriod" class="bg-slate-50 rounded-xl p-4">
                            <p class="text-xs font-bold text-slate-400 uppercase mb-1">Periodo di Viaggio</p>
                            <p class="font-medium text-slate-800">{{ selectedReview.travelPeriod }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>
