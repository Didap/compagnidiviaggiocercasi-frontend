<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import Card from '@/components/ui/card/Card.vue'
import CardContent from '@/components/ui/card/CardContent.vue'
import CardDescription from '@/components/ui/card/CardDescription.vue'
import CardFooter from '@/components/ui/card/CardFooter.vue'
import CardTitle from '@/components/ui/card/CardTitle.vue'
import Badge from '@/components/ui/badge/Badge.vue'
import Button from '@/components/ui/button/Button.vue'
import { Star, Users, Calendar, MapPin, ArrowRight } from 'lucide-vue-next'

const props = defineProps<{
  trip: any
}>()

const tripData = computed(() => {
  return props.trip?.attributes || props.trip
})

// Get all offers (from nested Strapi data)
const offers = computed(() => {
  const raw = tripData.value.offers
  if (!raw) return []
  return Array.isArray(raw) ? raw : raw?.data?.map((o: any) => o.attributes || o) || []
})

// Cheapest offer for display on card
const cheapestOffer = computed(() => {
  if (offers.value.length === 0) return null
  return offers.value.reduce((min: any, o: any) => {
    const oPrice = o.attributes?.price ?? o.price ?? Infinity
    const minPrice = min.attributes?.price ?? min.price ?? Infinity
    return oPrice < minPrice ? o : min
  }, offers.value[0])
})

const offerData = computed(() => {
  if (!cheapestOffer.value) return null
  return cheapestOffer.value.attributes || cheapestOffer.value
})

const imageUrl = computed(() => {
  const images = tripData.value.image
  if (!images) return 'https://placehold.co/600x400?text=No+Image'
  const firstImage = Array.isArray(images) ? images[0] : images
  const url = firstImage?.url || firstImage?.attributes?.url || firstImage?.data?.attributes?.url || firstImage?.data?.url
  return url ? `${import.meta.env.VITE_API_URL}${url}` : 'https://placehold.co/600x400?text=No+Image'
})

const averageRating = computed(() => {
  const reviews = tripData.value.reviews?.data || tripData.value.reviews
  if (!Array.isArray(reviews) || reviews.length === 0) return 0
  const sum = reviews.reduce((acc: number, review: any) => acc + (review.attributes?.rating ?? review.rating ?? 0), 0)
  return (sum / reviews.length).toFixed(1)
})

const reviewsCount = computed(() => {
  const reviews = tripData.value.reviews
  if (Array.isArray(reviews)) return reviews.length
  return reviews?.data?.length || 0
})

const availableSeats = computed(() => {
  if (!offerData.value) return 0
  const max = offerData.value.maxParticipants || 0
  const occupied = offerData.value.occupiedSeats || 0
  return Math.max(0, max - occupied)
})

const dateRange = computed(() => {
  if (!offerData.value) return ''
  const start = offerData.value.startDate
  const end = offerData.value.endDate
  if (!start || !end) return ''
  const formatDate = (d: string) => new Date(d).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })
  return `${formatDate(start)} - ${formatDate(end)} ${new Date(end).getFullYear()}`
})
</script>

<template>
  <RouterLink :to="'/viaggio/' + tripData.slug" class="block h-full no-underline">
  <Card class="group relative overflow-hidden rounded-3xl border-none bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10 h-full flex flex-col cursor-pointer">
    <!-- Image & Badges -->
    <div class="relative h-64 overflow-hidden">
      <img 
        :src="imageUrl" 
        :alt="tripData.title"
        class="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110" 
      />
      
      <!-- Overlays -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500"></div>
      
      <!-- Top Badges & Destination -->
      <div class="absolute top-4 left-4 flex gap-2">
        <!-- Destination Pill -->
        <div class="bg-white/90 backdrop-blur-md px-2 py-1 rounded-xl flex items-center gap-1 shadow-sm w-fit">
          <MapPin class="w-3.5 h-3.5 text-primary" />
          <span class="text-xs font-bold text-slate-800">{{ tripData.destination || 'Destinazione' }}</span>
        </div>

        <div class="flex gap-2">
          <Badge v-if="availableSeats <= 3 && availableSeats > 0" class="bg-orange-500/90 backdrop-blur-md text-white border-none shadow-sm animate-pulse">
            {{ availableSeats === 1 ? 'Ultimo posto!' : `Ultimi ${availableSeats} posti liberi` }}
          </Badge>
          <Badge v-else-if="availableSeats === 0 && offerData" class="bg-red-500/90 backdrop-blur-md text-white border-none shadow-sm">
            Sold Out
          </Badge>
        </div>
      </div>

      <!-- Rating Pill -->
      <div class="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-2 py-1 rounded-xl flex items-center gap-1 shadow-sm">
        <Star class="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
        <span class="text-xs font-bold text-slate-800">{{ averageRating }}</span>
        <span class="text-[10px] text-slate-400 ml-0.5">({{ reviewsCount }})</span>
      </div>

      <!-- Price Floating Pill -->
      <div v-if="offerData" class="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg transform translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 border border-white/20">
         <div class="flex flex-col leading-tight">
           <span class="text-[10px] text-muted-foreground uppercase font-bold">{{ offers.length > 1 ? 'A partire da' : 'Costo totale' }}</span>
           <span class="text-base font-black text-primary">{{ offerData.price }}€</span>
         </div>
      </div>
    </div>
    
    <!-- Content Body -->
    <CardContent class="p-4 flex-grow flex flex-col">
      <CardTitle class="text-2xl font-extrabold text-slate-900 leading-tight mb-2 group-hover:text-primary transition-colors duration-300">
        {{ tripData.title }}
      </CardTitle>

      <CardDescription class="text-sm text-slate-500 line-clamp-2 leading-relaxed mb-6">
        {{ tripData.shortDescription }}
      </CardDescription>

      <!-- Info Grid -->
      <div v-if="offerData" class="mt-auto grid grid-cols-1 gap-4 pt-4 border-t border-slate-100">
        <div class="flex items-center gap-2 min-w-0">
          <div class="p-2 bg-slate-50 rounded-lg group-hover:bg-primary/5 transition-colors flex-shrink-0">
            <Calendar class="w-4 h-4 text-primary" />
          </div>
          <div class="flex flex-col min-w-0">
            <span class="text-[10px] text-slate-400 font-bold uppercase">Prossima partenza</span>
            <span class="text-xs font-bold text-slate-700 truncate">{{ dateRange }}</span>
          </div>
        </div>
        <div class="flex items-center gap-2 min-w-0">
          <div class="p-2 bg-slate-50 rounded-lg group-hover:bg-primary/5 transition-colors flex-shrink-0">
            <Users class="w-4 h-4 text-primary" />
          </div>
          <div class="flex flex-col min-w-0">
            <span class="text-[10px] text-slate-400 font-bold uppercase">Gruppo</span>
            <span class="text-xs font-bold text-slate-700">{{ offerData.maxParticipants }} posti totali</span>
          </div>
        </div>
      </div>
    </CardContent>
    
    <!-- Footer CTA -->
    <CardFooter class="px-6 pb-6 pt-0 mt-auto">
      <Button 
        class="w-full rounded-2xl h-12 text-sm font-bold shadow-lg hover:shadow-primary/30 transition-all duration-300 flex items-center justify-center gap-2 group/btn"
        :variant="availableSeats === 0 && offerData ? 'secondary' : 'default'"
        :disabled="availableSeats === 0 && !!offerData"
      >
        <span v-if="availableSeats === 0 && offerData">Viaggio al completo</span>
        <span v-else-if="offerData">Blocca il posto con {{ offerData.depositPrice }}€</span>
        <span v-else>Scopri il viaggio</span>
        <ArrowRight v-if="availableSeats > 0 || !offerData" class="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
      </Button>
    </CardFooter>
  </Card>
  </RouterLink>
</template>

<style scoped>
.backdrop-blur-md {
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
</style>
