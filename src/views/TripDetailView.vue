<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import Button from '@/components/ui/button/Button.vue'
import Card from '@/components/ui/card/Card.vue'
import CardContent from '@/components/ui/card/CardContent.vue'
import {
  Star,
  Users,
  Calendar,
  MapPin,
  ArrowLeft,
  ArrowRight,
  Shield,
  Clock,
  Heart,
  ChevronLeft,
  ChevronRight,
  X,
  Tag,
  ChevronDown,
} from 'lucide-vue-next'

const route = useRoute()
const trip = ref<any>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const lightboxOpen = ref(false)
const lightboxIndex = ref(0)
const selectedOfferIndex = ref(0)
const expandedDays = ref<Set<number>>(new Set())

const apiUrl = import.meta.env.VITE_API_URL

const fetchTrip = async () => {
  try {
    const slug = route.params.slug
    const response = await fetch(`${apiUrl}/api/trips?filters[slug][$eq]=${slug}&populate[image][fields]=url&populate[gallery][fields]=url&populate[reviews][populate]=*&populate[itinerary][populate]=*&populate[offers][populate][itinerary][populate]=*`)
    if (!response.ok) throw new Error(`Errore HTTP: ${response.status}`)
    const data = await response.json()
    if (data.data && data.data.length > 0) {
      trip.value = data.data[0]?.attributes || data.data[0]
    } else {
      error.value = 'Viaggio non trovato'
    }
  } catch (err: any) {
    error.value = err.message
    console.error('Error fetching trip:', err)
  } finally {
    loading.value = false
  }
}

// Offers
const offers = computed(() => {
  const raw = trip.value?.offers
  if (!raw) return []
  const list = Array.isArray(raw) ? raw : raw?.data?.map((o: any) => o.attributes || o) || []
  return list.map((o: any) => o.attributes || o)
})

const selectedOffer = computed(() => offers.value[selectedOfferIndex.value] || null)

const cheapestPrice = computed(() => {
  if (offers.value.length === 0) return null
  return Math.min(...offers.value.map((o: any) => o.price || Infinity))
})

// Image
const imageUrl = computed(() => {
  if (!trip.value?.image) return ''
  const img = trip.value.image
  const firstImage = Array.isArray(img) ? img[0] : img
  const url = firstImage?.url || firstImage?.attributes?.url || firstImage?.data?.attributes?.url || firstImage?.data?.url
  return url ? `${apiUrl}${url}` : ''
})

const galleryUrls = computed(() => {
  const gallery = trip.value?.gallery
  if (!gallery) return []
  const images = Array.isArray(gallery) ? gallery : gallery?.data || []
  return images.map((img: any) => {
    const url = img?.url || img?.attributes?.url
    return url ? `${apiUrl}${url}` : null
  }).filter(Boolean)
})

// Reviews
const averageRating = computed(() => {
  const reviews = trip.value?.reviews?.data || trip.value?.reviews
  if (!Array.isArray(reviews) || reviews.length === 0) return 0
  const sum = reviews.reduce((acc: number, r: any) => acc + (r.attributes?.rating ?? r.rating ?? 0), 0)
  return (sum / reviews.length).toFixed(1)
})

const reviewsList = computed(() => {
  const reviews = trip.value?.reviews?.data || trip.value?.reviews
  if (!Array.isArray(reviews)) return []
  return reviews.map((r: any) => ({
    rating: r.attributes?.rating ?? r.rating ?? 0,
    content: r.attributes?.content ?? r.content ?? '',
    user: r.attributes?.authorName ?? r.authorName ?? 'Viaggiatore',
    travelPeriod: r.attributes?.travelPeriod ?? r.travelPeriod ?? '',
    createdAt: r.attributes?.createdAt ?? r.createdAt,
  }))
})

// Offer helpers
const getAvailableSeats = (offer: any) => {
  return Math.max(0, (offer?.maxParticipants || 0) - (offer?.occupiedSeats || 0))
}

const formatDateRange = (offer: any) => {
  if (!offer?.startDate || !offer?.endDate) return ''
  const fmt = (d: string) => new Date(d).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })
  return `${fmt(offer.startDate)} — ${fmt(offer.endDate)}`
}

const getDuration = (offer: any) => {
  if (!offer?.startDate || !offer?.endDate) return ''
  const diff = Math.ceil((new Date(offer.endDate).getTime() - new Date(offer.startDate).getTime()) / (1000 * 60 * 60 * 24))
  return `${diff} ${diff === 1 ? 'giorno' : 'giorni'} / ${diff - 1} ${diff - 1 === 1 ? 'notte' : 'notti'}`
}

const formatShortDate = (d: string) => {
  return new Date(d).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })
}

// Itinerary: use Offer's if populated, else Trip's
const itinerary = computed(() => {
  const offerIt = selectedOffer.value?.itinerary
  if (Array.isArray(offerIt) && offerIt.length > 0) return offerIt
  const tripIt = trip.value?.itinerary
  if (Array.isArray(tripIt) && tripIt.length > 0) return tripIt
  return []
})

const toggleDay = (index: number) => {
  if (expandedDays.value.has(index)) {
    expandedDays.value.delete(index)
  } else {
    expandedDays.value.add(index)
  }
}

// Lightbox
const openLightbox = (index: number) => {
  lightboxIndex.value = index
  lightboxOpen.value = true
}
const closeLightbox = () => { lightboxOpen.value = false }
const nextImage = () => { lightboxIndex.value = (lightboxIndex.value + 1) % galleryUrls.value.length }
const prevImage = () => { lightboxIndex.value = (lightboxIndex.value - 1 + galleryUrls.value.length) % galleryUrls.value.length }

onMounted(fetchTrip)
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <Navbar />

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="flex flex-col items-center justify-center min-h-screen gap-4">
      <p class="text-xl text-red-500 font-semibold">{{ error }}</p>
      <RouterLink to="/">
        <Button variant="outline" class="rounded-full gap-2">
          <ArrowLeft class="w-4 h-4" /> Torna alla Home
        </Button>
      </RouterLink>
    </div>

    <!-- Content -->
    <template v-else-if="trip">
      <!-- Hero Section -->
      <section class="relative h-[60vh] md:h-[70vh] overflow-hidden">
        <img :src="imageUrl" :alt="trip.title" class="w-full h-full object-cover" />
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
        <div class="absolute inset-0 bg-gradient-to-b from-black/90 via-black/50 to-transparent pointer-events-none h-1/2"></div>

        <!-- Back Button -->
        <RouterLink to="/" class="absolute top-32 left-6 md:left-12 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 hover:bg-white transition-colors z-10">
          <ArrowLeft class="w-4 h-4 text-slate-700" />
          <span class="text-sm font-bold text-slate-700">Indietro</span>
        </RouterLink>

        <!-- Hero Content -->
        <div class="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div class="container mx-auto">
            <div class="flex flex-wrap items-center gap-3 mb-4">
              <div class="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm">
                <MapPin class="w-4 h-4 text-primary" />
                <span class="text-sm font-bold text-slate-800">{{ trip.destination }}</span>
              </div>
              <div class="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm">
                <Star class="w-4 h-4 fill-amber-400 text-amber-400" />
                <span class="text-sm font-bold text-slate-800">{{ averageRating }}</span>
                <span class="text-xs text-slate-500">({{ reviewsList.length }})</span>
              </div>
              <div v-if="offers.length > 1" class="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm">
                <Tag class="w-4 h-4 text-primary" />
                <span class="text-sm font-bold text-slate-800">{{ offers.length }} date disponibili</span>
              </div>
            </div>

            <h1 class="text-4xl md:text-6xl font-black text-white leading-tight mb-2 drop-shadow-lg">
              {{ trip.title }}
            </h1>
            <p v-if="trip.shortDescription" class="text-lg text-white/80 max-w-2xl leading-relaxed">
              {{ trip.shortDescription }}
            </p>
          </div>
        </div>
      </section>

      <!-- Quick Info Bar -->
      <section v-if="selectedOffer" class="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-30">
        <div class="container mx-auto px-6 py-4">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div class="flex flex-wrap items-center gap-6">
              <div class="flex items-center gap-2">
                <Calendar class="w-5 h-5 text-primary" />
                <div class="flex flex-col">
                  <span class="text-[10px] text-slate-400 font-bold uppercase">Date</span>
                  <span class="text-sm font-bold text-slate-700">{{ formatDateRange(selectedOffer) }}</span>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <Clock class="w-5 h-5 text-primary" />
                <div class="flex flex-col">
                  <span class="text-[10px] text-slate-400 font-bold uppercase">Durata</span>
                  <span class="text-sm font-bold text-slate-700">{{ getDuration(selectedOffer) }}</span>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <Users class="w-5 h-5 text-primary" />
                <div class="flex flex-col">
                  <span class="text-[10px] text-slate-400 font-bold uppercase">Posti</span>
                  <span class="text-sm font-bold text-slate-700">{{ getAvailableSeats(selectedOffer) }} / {{ selectedOffer.maxParticipants }} {{ getAvailableSeats(selectedOffer) === 1 ? 'posto disponibile' : 'posti disponibili' }}</span>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <div class="flex flex-col text-right">
                <span class="text-xs text-slate-400 font-bold uppercase">{{ offers.length > 1 ? 'A partire da' : 'Prezzo' }}</span>
                <span class="text-2xl font-black text-primary">{{ cheapestPrice }}€</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Main Content -->
      <section class="container mx-auto px-6 py-12">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">

          <!-- Left Column -->
          <div class="lg:col-span-2 space-y-10">

            <!-- Description -->
            <div>
              <h2 class="text-2xl font-bold text-slate-900 mb-6">Il Viaggio</h2>
              <div
                v-if="trip.description"
                class="prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-600 prose-p:leading-relaxed"
                v-html="trip.description"
              ></div>
              <p v-else class="text-slate-500 italic">Descrizione completa in arrivo...</p>
            </div>

            <!-- Gallery -->
            <div v-if="galleryUrls.length > 0">
              <h2 class="text-2xl font-bold text-slate-900 mb-6">Galleria</h2>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div
                  v-for="(url, index) in galleryUrls"
                  :key="index"
                  class="relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer group"
                  @click="openLightbox(Number(index))"
                >
                  <img :src="url" :alt="`Foto ${Number(index) + 1}`" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <div class="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm rounded-full p-3">
                      <ArrowRight class="w-5 h-5 text-slate-800" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Itinerary -->
            <div v-if="itinerary.length > 0">
              <h2 class="text-2xl font-bold text-slate-900 mb-6">Programma del Viaggio</h2>
              <div class="space-y-3">
                <div
                  v-for="(day, index) in itinerary"
                  :key="index"
                  class="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md"
                >
                  <button
                    @click="toggleDay(Number(index))"
                    class="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
                  >
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span class="text-xs font-black text-primary">{{ Number(index) + 1 }}</span>
                      </div>
                      <span class="font-bold text-slate-800">{{ day.title }}</span>
                    </div>
                    <ChevronDown
                      class="w-5 h-5 text-slate-400 transition-transform duration-300 flex-shrink-0"
                      :class="{ 'rotate-180': expandedDays.has(Number(index)) }"
                    />
                  </button>
                  <div
                    v-show="expandedDays.has(Number(index))"
                    class="px-5 pb-5 pt-0"
                  >
                    <div class="pl-11 prose prose-sm prose-slate max-w-none prose-p:text-slate-600 prose-p:leading-relaxed" v-html="day.description"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Reviews -->
            <div v-if="reviewsList.length > 0">
              <h2 class="text-2xl font-bold text-slate-900 mb-6">
                Recensioni
                <span class="text-lg font-normal text-slate-400 ml-2">({{ reviewsList.length }})</span>
              </h2>
              <div class="space-y-4">
                <Card v-for="(review, index) in reviewsList" :key="index" class="rounded-2xl border-none shadow-sm hover:shadow-md transition-shadow">
                  <CardContent class="p-6">
                    <div class="flex items-center justify-between mb-3">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span class="text-sm font-bold text-primary">{{ review.user.charAt(0).toUpperCase() }}</span>
                        </div>
                        <div>
                          <p class="font-bold text-slate-800">{{ review.user }}</p>
                          <div class="flex items-center gap-2">
                            <p v-if="review.createdAt" class="text-xs text-slate-400">
                              {{ new Date(review.createdAt).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' }) }}
                            </p>
                            <span v-if="review.travelPeriod" class="text-xs text-primary/70 bg-primary/5 px-2 py-0.5 rounded-full">
                              📅 {{ review.travelPeriod }}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div class="flex items-center gap-1">
                        <Star v-for="s in 5" :key="s" class="w-4 h-4" :class="s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'" />
                      </div>
                    </div>
                    <p class="text-slate-600 leading-relaxed">{{ review.content }}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          <!-- Right Column - Offers & Booking -->
          <div class="lg:col-span-1">
            <div class="sticky top-28 space-y-4">

              <!-- Offer Selector (if multiple offers) -->
              <div v-if="offers.length > 1">
                <h3 class="text-sm font-bold text-slate-400 uppercase mb-3">Date Disponibili</h3>
                <div class="space-y-2">
                  <button
                    v-for="(offer, index) in offers"
                    :key="index"
                    @click="selectedOfferIndex = Number(index)"
                    :class="[
                      'w-full text-left p-4 rounded-2xl border-2 transition-all duration-200',
                      selectedOfferIndex === Number(index)
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm'
                    ]"
                  >
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="text-sm font-bold text-slate-800">
                          {{ formatShortDate(offer.startDate) }} - {{ formatShortDate(offer.endDate) }}
                        </p>
                        <p class="text-xs text-slate-500 mt-0.5">
                          {{ getAvailableSeats(offer) }} {{ getAvailableSeats(offer) === 1 ? 'posto disponibile' : 'posti disponibili' }}
                        </p>
                      </div>
                      <span class="text-lg font-black text-primary">{{ offer.price }}€</span>
                    </div>
                  </button>
                </div>
              </div>

              <!-- Booking Card -->
              <Card v-if="selectedOffer" class="rounded-3xl border-none shadow-xl overflow-hidden">
                <CardContent class="p-0">
                  <!-- Price Header -->
                  <div class="bg-gradient-to-r from-primary to-primary/80 p-6 text-white">
                    <div class="flex items-baseline gap-2 mb-1">
                      <span class="text-4xl font-black">{{ selectedOffer.price }}€</span>
                      <span class="text-white/70 text-sm">/ persona</span>
                    </div>
                  </div>

                  <!-- Booking Details -->
                  <div class="p-6 space-y-5">
                    <div class="flex items-center gap-3 text-slate-600">
                      <Calendar class="w-5 h-5 text-primary flex-shrink-0" />
                      <span class="text-sm font-medium">{{ formatDateRange(selectedOffer) }}</span>
                    </div>
                    <div class="flex items-center gap-3 text-slate-600">
                      <Clock class="w-5 h-5 text-primary flex-shrink-0" />
                      <span class="text-sm font-medium">{{ getDuration(selectedOffer) }}</span>
                    </div>
                    <div class="flex items-center gap-3 text-slate-600">
                      <Users class="w-5 h-5 text-primary flex-shrink-0" />
                      <span class="text-sm font-medium">{{ getAvailableSeats(selectedOffer) }} {{ getAvailableSeats(selectedOffer) === 1 ? 'posto disponibile' : 'posti disponibili' }} su {{ selectedOffer.maxParticipants }}</span>
                    </div>

                    <!-- Progress Bar -->
                    <div>
                      <div class="flex justify-between text-xs font-bold text-slate-400 uppercase mb-2">
                        <span>Posti occupati</span>
                        <span>{{ selectedOffer.occupiedSeats || 0 }}/{{ selectedOffer.maxParticipants }}</span>
                      </div>
                      <div class="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          class="h-full rounded-full transition-all duration-700"
                          :class="getAvailableSeats(selectedOffer) <= 3 ? 'bg-orange-500' : 'bg-primary'"
                          :style="{ width: `${((selectedOffer.occupiedSeats || 0) / (selectedOffer.maxParticipants || 1)) * 100}%` }"
                        ></div>
                      </div>
                    </div>

                    <div class="border-t border-slate-100 pt-5">
                      <div class="flex items-center justify-between mb-4">
                        <span class="text-sm text-slate-500">Acconto per prenotare</span>
                        <span class="text-xl font-black text-primary">{{ selectedOffer.depositPrice }}€</span>
                      </div>

                      <Button
                        class="w-full rounded-2xl h-14 text-base font-bold shadow-lg hover:shadow-primary/30 transition-all duration-300 flex items-center justify-center gap-2 group/btn"
                        :variant="getAvailableSeats(selectedOffer) === 0 ? 'secondary' : 'default'"
                        :disabled="getAvailableSeats(selectedOffer) === 0"
                        size="lg"
                      >
                        <span v-if="getAvailableSeats(selectedOffer) === 0">Viaggio al completo</span>
                        <span v-else>Blocca il posto con {{ selectedOffer.depositPrice }}€</span>
                        <ArrowRight v-if="getAvailableSeats(selectedOffer) > 0" class="w-5 h-5 transition-transform duration-300 group-hover/btn:translate-x-1" />
                      </Button>
                    </div>

                    <!-- Trust Signals -->
                    <div class="grid grid-cols-1 gap-3 pt-2">
                      <div class="flex items-center gap-2 text-xs text-slate-500">
                        <Shield class="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>Prenotazione sicura e protetta</span>
                      </div>
                      <div class="flex items-center gap-2 text-xs text-slate-500">
                        <Heart class="w-4 h-4 text-red-400 flex-shrink-0" />
                        <span>Cancellazione gratuita entro 48h</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <!-- No offers state -->
              <Card v-else class="rounded-3xl border-none shadow-xl overflow-hidden">
                <CardContent class="p-6 text-center">
                  <p class="text-slate-500 font-medium">Nessuna offerta disponibile al momento.</p>
                  <p class="text-sm text-slate-400 mt-2">Torna presto per nuove date!</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </template>

    <!-- Lightbox -->
    <Teleport to="body">
      <div v-if="lightboxOpen" class="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center" @click.self="closeLightbox">
        <button @click="closeLightbox" class="absolute top-6 right-6 text-white/70 hover:text-white transition-colors">
          <X class="w-8 h-8" />
        </button>
        <button @click="prevImage" class="absolute left-4 md:left-8 text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full p-3">
          <ChevronLeft class="w-6 h-6" />
        </button>
        <img :src="galleryUrls[lightboxIndex]" class="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl" />
        <button @click="nextImage" class="absolute right-4 md:right-8 text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full p-3">
          <ChevronRight class="w-6 h-6" />
        </button>
        <div class="absolute bottom-6 text-white/60 text-sm font-medium">
          {{ lightboxIndex + 1 }} / {{ galleryUrls.length }}
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.backdrop-blur-md {
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
</style>
