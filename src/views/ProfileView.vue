<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import Card from '@/components/ui/card/Card.vue'
import CardContent from '@/components/ui/card/CardContent.vue'
import Button from '@/components/ui/button/Button.vue'
import Badge from '@/components/ui/badge/Badge.vue'
import { useAuth } from '@/composables/useAuth'
import {
    Mail,
    Phone,
    Calendar,
    MapPin,
    ArrowRight,
    Camera,
    Compass,
    ChevronLeft,
    ChevronRight,
    X,
    Settings,
    LogOut,
    Save,
    Loader2,
    User as UserIcon,
} from 'lucide-vue-next'
import { RouterLink } from 'vue-router'

const router = useRouter()
const { user, fullName, fetchMe, logout, isAuthenticated, token } = useAuth()

const trips = ref<any[]>([])
const loadingTrips = ref(true)
const lightboxOpen = ref(false)
const lightboxIndex = ref(0)

// Edit profile state
const editMode = ref(false)
const editForm = ref({ firstName: '', lastName: '', phone: '', birthday: '' })
const savingProfile = ref(false)
const saveError = ref<string | null>(null)
const saveSuccess = ref(false)

// Avatar upload state
const avatarInput = ref<HTMLInputElement | null>(null)
const uploadingAvatar = ref(false)

const apiUrl = import.meta.env.VITE_API_URL

// Fetch the user's booked trips via the participants relation on offers
const fetchMyTrips = async () => {
    if (!user.value) return
    loadingTrips.value = true
    try {
        const response = await fetch(
            `${apiUrl}/api/offers?filters[participants][id][$eq]=${user.value.id}&populate[trip][populate][image][fields]=url&populate[trip][populate][gallery][fields]=url&populate[trip][populate][offers][fields]=*`,
            { headers: { Authorization: `Bearer ${token.value}` } }
        )
        if (!response.ok) throw new Error('Errore nel caricamento viaggi')
        const data = await response.json()
        const offerList = data.data || []
        // Extract unique trips from offers
        const tripMap = new Map<string, any>()
        for (const offer of offerList) {
            const t = offer.attributes?.trip?.data || offer.trip
            if (!t) continue
            const tripData = t.attributes || t
            const id = t.id || t.documentId || tripData.slug
            if (id && !tripMap.has(id.toString())) {
                tripMap.set(id.toString(), tripData)
            }
        }
        trips.value = Array.from(tripMap.values())
    } catch (err) {
        console.error('Error fetching trips:', err)
    } finally {
        loadingTrips.value = false
    }
}

// Computed: avatar URL
const avatarUrl = computed(() => {
    if (!user.value?.avatar) return null
    const av = user.value.avatar
    const url = av?.url || av?.data?.attributes?.url || av?.attributes?.url
    return url ? `${apiUrl}${url}` : null
})

// Computed: initials fallback
const initials = computed(() => {
    if (!user.value) return '?'
    const f = user.value.firstName?.charAt(0)?.toUpperCase() || ''
    const l = user.value.lastName?.charAt(0)?.toUpperCase() || ''
    return `${f}${l}` || '?'
})

// Computed: formatted birthday
const formattedBirthday = computed(() => {
    if (!user.value?.birthday) return null
    return new Date(user.value.birthday).toLocaleDateString('it-IT', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    })
})

// Computed: member since
const memberSince = computed(() => {
    if (!user.value) return ''
    // Strapi users have createdAt
    const raw = (user.value as any).createdAt
    if (!raw) return ''
    return new Date(raw).toLocaleDateString('it-IT', {
        month: 'long',
        year: 'numeric',
    })
})

// Computed: all gallery images from booked trips
const allGalleryImages = computed(() => {
    const images: string[] = []
    for (const trip of trips.value) {
        const gallery = trip.gallery
        if (!gallery) continue
        const items = Array.isArray(gallery) ? gallery : gallery?.data || []
        for (const img of items) {
            const url = img?.url || img?.attributes?.url
            if (url) images.push(`${apiUrl}${url}`)
        }
    }
    return images
})

// Computed: trip image URL helper
const getTripImageUrl = (trip: any) => {
    const img = trip.image
    if (!img) return ''
    const firstImage = Array.isArray(img) ? img[0] : img
    const url =
        firstImage?.url ||
        firstImage?.attributes?.url ||
        firstImage?.data?.attributes?.url ||
        firstImage?.data?.url
    return url ? `${apiUrl}${url}` : ''
}

// Lightbox
const openLightbox = (index: number) => {
    lightboxIndex.value = index
    lightboxOpen.value = true
}
const closeLightbox = () => {
    lightboxOpen.value = false
}
const nextImage = () => {
    lightboxIndex.value =
        (lightboxIndex.value + 1) % allGalleryImages.value.length
}
const prevImage = () => {
    lightboxIndex.value =
        (lightboxIndex.value - 1 + allGalleryImages.value.length) %
        allGalleryImages.value.length
}

const handleLogout = () => {
    logout()
    router.push('/')
}

// Open edit profile modal
const openEditProfile = () => {
    if (!user.value) return
    editForm.value = {
        firstName: user.value.firstName || '',
        lastName: user.value.lastName || '',
        phone: user.value.phone || '',
        birthday: user.value.birthday || '',
    }
    saveError.value = null
    saveSuccess.value = false
    editMode.value = true
}

// Save profile changes
const saveProfile = async () => {
    if (!user.value || !token.value) return
    savingProfile.value = true
    saveError.value = null
    saveSuccess.value = false
    try {
        const response = await fetch(`${apiUrl}/api/users/${user.value.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token.value}`,
            },
            body: JSON.stringify({
                firstName: editForm.value.firstName,
                lastName: editForm.value.lastName,
                phone: editForm.value.phone || null,
                birthday: editForm.value.birthday || null,
            }),
        })
        if (!response.ok) {
            const data = await response.json()
            throw new Error(data?.error?.message || 'Errore nel salvataggio')
        }
        // Refresh user data
        await fetchMe()
        saveSuccess.value = true
        setTimeout(() => {
            editMode.value = false
            saveSuccess.value = false
        }, 1000)
    } catch (err: any) {
        saveError.value = err.message
    } finally {
        savingProfile.value = false
    }
}

// Avatar upload
const triggerAvatarUpload = () => {
    avatarInput.value?.click()
}

const handleAvatarUpload = async (event: Event) => {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file || !user.value || !token.value) return

    uploadingAvatar.value = true
    try {
        // Step 1: Upload the file to Strapi
        const formData = new FormData()
        formData.append('files', file)
        const uploadResponse = await fetch(`${apiUrl}/api/upload`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token.value}` },
            body: formData,
        })
        if (!uploadResponse.ok) throw new Error('Errore nel caricamento')
        const uploadedFiles = await uploadResponse.json()
        const uploadedFile = uploadedFiles[0]

        // Step 2: Link the uploaded file to the user's avatar field
        const updateResponse = await fetch(`${apiUrl}/api/users/${user.value.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token.value}`,
            },
            body: JSON.stringify({ avatar: uploadedFile.id }),
        })
        if (!updateResponse.ok) throw new Error('Errore nell\'aggiornamento avatar')

        // Step 3: Refresh user data
        await fetchMe()
    } catch (err) {
        console.error('Avatar upload error:', err)
    } finally {
        uploadingAvatar.value = false
        // Reset the input so the same file can be selected again
        if (avatarInput.value) avatarInput.value.value = ''
    }
}

onMounted(async () => {
    await fetchMe()
    if (!isAuthenticated.value) {
        router.push('/accedi')
        return
    }
    await fetchMyTrips()
})
</script>

<template>
    <div class="min-h-screen bg-bg-primary">
        <Navbar />

        <!-- Loading -->
        <div v-if="!user" class="flex items-center justify-center min-h-screen">
            <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>

        <template v-else>
            <!-- Profile Header -->
            <section class="pt-28 pb-12 px-6 relative overflow-hidden">

                <div class="container mx-auto relative z-10">
                    <div class="flex flex-col md:flex-row items-center md:items-end gap-8">
                        <!-- Avatar -->
                        <div class="relative group">
                            <div
                                class="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-xl ring-4 ring-primary/10">
                                <img v-if="avatarUrl" :src="avatarUrl" :alt="fullName"
                                    class="w-full h-full object-cover" />
                                <div v-else
                                    class="w-full h-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                                    <span class="text-4xl md:text-5xl font-black text-white">{{
                                        initials
                                    }}</span>
                                </div>
                            </div>
                            <!-- Edit overlay -->
                            <button @click="triggerAvatarUpload" :disabled="uploadingAvatar"
                                class="absolute bottom-1 right-1 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-500 hover:text-primary transition-colors hover:scale-110 disabled:opacity-60">
                                <Loader2 v-if="uploadingAvatar" class="w-5 h-5 animate-spin" />
                                <Camera v-else class="w-5 h-5" />
                            </button>
                            <input ref="avatarInput" type="file" accept="image/*" class="hidden"
                                @change="handleAvatarUpload" />
                        </div>

                        <!-- User Info -->
                        <div class="text-center md:text-left flex-1">
                            <h1 class="text-3xl md:text-4xl font-black text-slate-900 mb-1">
                                {{ fullName }}
                            </h1>
                            <p class="text-lg text-slate-500 font-medium mb-3">
                                {{ user.email }}
                            </p>
                            <div class="flex flex-wrap items-center justify-center md:justify-start gap-2">
                                <Badge v-if="memberSince"
                                    class="bg-secondary/10 text-secondary border-none px-3 py-1 text-xs font-bold hover:bg-secondary/10 cursor-default">
                                    <Compass class="w-3 h-3 mr-1" />
                                    Membro da {{ memberSince }}
                                </Badge>
                                <Badge v-if="trips.length > 0"
                                    class="bg-primary/10 text-primary border-none px-3 py-1 text-xs font-bold hover:bg-primary/10 cursor-default">
                                    <MapPin class="w-3 h-3 mr-1" />
                                    {{ trips.length }} {{ trips.length === 1 ? 'viaggio' : 'viaggi' }}
                                </Badge>
                            </div>
                        </div>

                        <!-- Actions -->
                        <div class="flex items-center gap-3">
                            <Button @click="openEditProfile" variant="outline"
                                class="rounded-2xl px-5 h-11 border-slate-200 text-slate-600 hover:border-primary hover:text-primary transition-all gap-2">
                                <Settings class="w-4 h-4" />
                                Modifica Profilo
                            </Button>
                            <Button @click="handleLogout" variant="ghost"
                                class="rounded-2xl px-4 h-11 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
                                <LogOut class="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Main Content -->
            <section class="container mx-auto px-6 pb-20">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <!-- Left Column: Info -->
                    <div class="lg:col-span-1 space-y-6">
                        <!-- Info Card -->
                        <Card class="rounded-3xl border-none shadow-sm overflow-hidden">
                            <CardContent class="p-6 space-y-5">
                                <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider">
                                    Informazioni
                                </h3>

                                <div class="space-y-4">
                                    <div class="flex items-center gap-3">
                                        <div
                                            class="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <Mail class="w-5 h-5 text-primary" />
                                        </div>
                                        <div class="min-w-0">
                                            <p class="text-xs text-slate-400 font-bold uppercase">Email</p>
                                            <p class="text-sm font-bold text-slate-700 truncate">
                                                {{ user.email }}
                                            </p>
                                        </div>
                                    </div>

                                    <div v-if="user.phone" class="flex items-center gap-3">
                                        <div
                                            class="w-10 h-10 rounded-2xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                                            <Phone class="w-5 h-5 text-secondary" />
                                        </div>
                                        <div>
                                            <p class="text-xs text-slate-400 font-bold uppercase">
                                                Telefono
                                            </p>
                                            <p class="text-sm font-bold text-slate-700">
                                                {{ user.phone }}
                                            </p>
                                        </div>
                                    </div>

                                    <div v-if="formattedBirthday" class="flex items-center gap-3">
                                        <div
                                            class="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                                            <Calendar class="w-5 h-5 text-amber-600" />
                                        </div>
                                        <div>
                                            <p class="text-xs text-slate-400 font-bold uppercase">
                                                Data di nascita
                                            </p>
                                            <p class="text-sm font-bold text-slate-700">
                                                {{ formattedBirthday }}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <!-- Stats Card -->
                        <Card class="rounded-3xl border-none shadow-sm overflow-hidden">
                            <CardContent class="p-6">
                                <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-5">
                                    Statistiche
                                </h3>
                                <div class="grid grid-cols-2 gap-4">
                                    <div
                                        class="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-4 text-center">
                                        <p class="text-3xl font-black text-primary">
                                            {{ trips.length }}
                                        </p>
                                        <p class="text-xs font-bold text-slate-500 mt-1">Viaggi</p>
                                    </div>
                                    <div
                                        class="bg-gradient-to-br from-secondary/5 to-secondary/10 rounded-2xl p-4 text-center">
                                        <p class="text-3xl font-black text-secondary">
                                            {{ allGalleryImages.length }}
                                        </p>
                                        <p class="text-xs font-bold text-slate-500 mt-1">Foto</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <!-- Right Column: Trips & Gallery -->
                    <div class="lg:col-span-2 space-y-10">
                        <!-- My Trips -->
                        <div>
                            <div class="flex items-center justify-between mb-6">
                                <h2 class="text-2xl font-bold text-slate-900">I Miei Viaggi</h2>
                            </div>

                            <!-- Loading -->
                            <div v-if="loadingTrips" class="flex justify-center py-12">
                                <div
                                    class="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent">
                                </div>
                            </div>

                            <!-- Trips Grid -->
                            <div v-else-if="trips.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <RouterLink v-for="(trip, index) in trips" :key="index" :to="'/viaggio/' + trip.slug"
                                    class="block no-underline">
                                    <Card
                                        class="group relative overflow-hidden rounded-3xl border-none bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10 h-full flex flex-col cursor-pointer">
                                        <!-- Image -->
                                        <div class="relative h-48 overflow-hidden">
                                            <img :src="getTripImageUrl(trip)" :alt="trip.title"
                                                class="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110" />
                                            <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent">
                                            </div>
                                            <div class="absolute bottom-3 left-4 right-4">
                                                <div class="flex items-center gap-1.5 mb-1">
                                                    <MapPin class="w-3.5 h-3.5 text-white/80" />
                                                    <span class="text-xs font-bold text-white/90">{{
                                                        trip.destination
                                                    }}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Content -->
                                        <CardContent class="p-4 flex-grow">
                                            <h3
                                                class="text-lg font-extrabold text-slate-900 leading-tight mb-2 group-hover:text-primary transition-colors duration-300">
                                                {{ trip.title }}
                                            </h3>
                                            <p v-if="trip.shortDescription"
                                                class="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                                                {{ trip.shortDescription }}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </RouterLink>
                            </div>

                            <!-- Empty State -->
                            <Card v-else class="rounded-3xl border-none shadow-sm overflow-hidden">
                                <CardContent class="p-10 text-center">
                                    <div
                                        class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Compass class="w-8 h-8 text-primary" />
                                    </div>
                                    <p class="text-lg font-bold text-slate-700 mb-2">
                                        Nessun viaggio prenotato
                                    </p>
                                    <p class="text-sm text-slate-400 mb-6">
                                        Inizia a esplorare e prenota la tua prossima avventura!
                                    </p>
                                    <RouterLink to="/">
                                        <Button
                                            class="rounded-2xl px-8 h-12 font-bold shadow-lg hover:shadow-primary/30 transition-all gap-2">
                                            Esplora i Viaggi
                                            <ArrowRight class="w-4 h-4" />
                                        </Button>
                                    </RouterLink>
                                </CardContent>
                            </Card>
                        </div>

                        <!-- Gallery -->
                        <div v-if="allGalleryImages.length > 0">
                            <h2 class="text-2xl font-bold text-slate-900 mb-6">Galleria</h2>
                            <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                                <div v-for="(url, index) in allGalleryImages" :key="index"
                                    class="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group"
                                    @click="openLightbox(Number(index))">
                                    <img :src="url" :alt="`Foto ${Number(index) + 1}`"
                                        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    <div
                                        class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                                        <div
                                            class="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm rounded-full p-3">
                                            <Camera class="w-5 h-5 text-slate-800" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </template>

        <!-- Lightbox -->
        <Teleport to="body">
            <div v-if="lightboxOpen" class="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
                @click.self="closeLightbox">
                <button @click="closeLightbox"
                    class="absolute top-6 right-6 text-white/70 hover:text-white transition-colors">
                    <X class="w-8 h-8" />
                </button>
                <button @click="prevImage"
                    class="absolute left-4 md:left-8 text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full p-3">
                    <ChevronLeft class="w-6 h-6" />
                </button>
                <img :src="allGalleryImages[lightboxIndex]"
                    class="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl" />
                <button @click="nextImage"
                    class="absolute right-4 md:right-8 text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full p-3">
                    <ChevronRight class="w-6 h-6" />
                </button>
                <div class="absolute bottom-6 text-white/60 text-sm font-medium">
                    {{ lightboxIndex + 1 }} / {{ allGalleryImages.length }}
                </div>
            </div>
        </Teleport>
    </div>

    <!-- Edit Profile Modal -->
    <Teleport to="body">
        <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0"
            enter-to-class="opacity-100" leave-active-class="transition duration-200 ease-in"
            leave-from-class="opacity-100" leave-to-class="opacity-0">
            <div v-if="editMode" class="fixed inset-0 z-[100] flex items-center justify-center p-4"
                @click.self="editMode = false">
                <!-- Backdrop -->
                <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="editMode = false"></div>

                <!-- Modal -->
                <div class="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                    <!-- Header -->
                    <div class="flex items-center justify-between p-6 border-b border-slate-100">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                                <UserIcon class="w-5 h-5 text-primary" />
                            </div>
                            <h2 class="text-xl font-bold text-slate-900">Modifica Profilo</h2>
                        </div>
                        <button @click="editMode = false"
                            class="p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-xl hover:bg-slate-50">
                            <X class="w-5 h-5" />
                        </button>
                    </div>

                    <!-- Form -->
                    <div class="p-6 space-y-5">
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="text-xs font-bold text-slate-400 uppercase mb-1.5 block">Nome</label>
                                <input v-model="editForm.firstName" type="text"
                                    class="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    placeholder="Il tuo nome" />
                            </div>
                            <div>
                                <label class="text-xs font-bold text-slate-400 uppercase mb-1.5 block">Cognome</label>
                                <input v-model="editForm.lastName" type="text"
                                    class="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    placeholder="Il tuo cognome" />
                            </div>
                        </div>

                        <div>
                            <label class="text-xs font-bold text-slate-400 uppercase mb-1.5 block">Telefono</label>
                            <input v-model="editForm.phone" type="tel"
                                class="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                placeholder="+39 ..." />
                        </div>

                        <div>
                            <label class="text-xs font-bold text-slate-400 uppercase mb-1.5 block">Data di
                                nascita</label>
                            <input v-model="editForm.birthday" type="date"
                                class="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                        </div>

                        <!-- Error -->
                        <p v-if="saveError" class="text-sm text-red-500 font-medium bg-red-50 px-4 py-2 rounded-xl">
                            {{ saveError }}
                        </p>

                        <!-- Success -->
                        <p v-if="saveSuccess"
                            class="text-sm text-green-600 font-medium bg-green-50 px-4 py-2 rounded-xl">
                            ✓ Profilo aggiornato!
                        </p>
                    </div>

                    <!-- Footer -->
                    <div class="p-6 pt-0 flex items-center gap-3">
                        <Button @click="editMode = false" variant="outline"
                            class="flex-1 rounded-2xl h-12 font-bold border-slate-200">
                            Annulla
                        </Button>
                        <Button @click="saveProfile" :disabled="savingProfile"
                            class="flex-1 rounded-2xl h-12 font-bold shadow-lg hover:shadow-primary/30 transition-all gap-2">
                            <Loader2 v-if="savingProfile" class="w-4 h-4 animate-spin" />
                            <Save v-else class="w-4 h-4" />
                            Salva
                        </Button>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>
