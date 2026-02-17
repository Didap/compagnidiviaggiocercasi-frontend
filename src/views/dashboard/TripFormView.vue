<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import Card from '@/components/ui/card/Card.vue'
import CardContent from '@/components/ui/card/CardContent.vue'
import Button from '@/components/ui/button/Button.vue'
import { useToast } from '@/composables/useToast'
import {
    Save, Loader2, ArrowLeft, Plus, Trash2, ImagePlus, GripVertical, Upload,
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const { token } = useAuth()
const apiUrl = import.meta.env.VITE_API_URL
const toast = useToast()

const isEdit = computed(() => !!route.params.id)
const tripId = computed(() => route.params.id as string)

const loading = ref(false)
const saving = ref(false)

// Form data
const form = ref({
    title: '',
    destination: '',
    shortDescription: '',
    description: '',
})

// Itinerary
const itinerary = ref<{ title: string; description: string }[]>([])

// Images
const imageFile = ref<File | null>(null)
const imagePreview = ref<string | null>(null)
const galleryFiles = ref<File[]>([])
const galleryPreviews = ref<string[]>([])
const existingImageUrl = ref<string | null>(null)
const existingGalleryUrls = ref<string[]>([])
const existingImageId = ref<number | null>(null)
const existingGalleryIds = ref<number[]>([])

// Fetch existing trip when editing
const fetchTrip = async () => {
    if (!isEdit.value) return
    loading.value = true
    try {
        const res = await fetch(
            `${apiUrl}/api/trips/${tripId.value}?populate[image][fields]=url,id&populate[gallery][fields]=url,id&populate[itinerary]=*`,
            { headers: { Authorization: `Bearer ${token.value}` } }
        )
        if (!res.ok) throw new Error('Viaggio non trovato')
        const json = await res.json()
        const trip = json.data?.attributes || json.data || json
        form.value = {
            title: trip.title || '',
            destination: trip.destination || '',
            shortDescription: trip.shortDescription || '',
            description: trip.description || '',
        }
        // Image
        const img = trip.image
        if (img) {
            const url = img.url || img?.data?.attributes?.url
            if (url) existingImageUrl.value = `${apiUrl}${url}`
            existingImageId.value = img.id || img?.data?.id || null
        }
        // Gallery
        const gal = trip.gallery
        if (gal) {
            const items = Array.isArray(gal) ? gal : gal?.data || []
            existingGalleryUrls.value = items.map((g: any) => {
                const url = g.url || g?.attributes?.url
                return url ? `${apiUrl}${url}` : ''
            }).filter(Boolean)
            existingGalleryIds.value = items.map((g: any) => g.id || g?.data?.id).filter(Boolean)
        }
        // Itinerary
        const itin = trip.itinerary
        if (itin && Array.isArray(itin)) {
            itinerary.value = itin.map((d: any) => ({ title: d.title || '', description: d.description || '' }))
        }
    } catch (err: any) {
        toast.error(err.message)
    } finally {
        loading.value = false
    }
}

// Image handlers
const onImageSelect = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    imageFile.value = file
    imagePreview.value = URL.createObjectURL(file)
}

const onGallerySelect = (e: Event) => {
    const files = (e.target as HTMLInputElement).files
    if (!files) return
    for (const file of files) {
        galleryFiles.value.push(file)
        galleryPreviews.value.push(URL.createObjectURL(file))
    }
}

const removeGalleryNew = (index: number) => {
    galleryFiles.value.splice(index, 1)
    galleryPreviews.value.splice(index, 1)
}

const removeGalleryExisting = (index: number) => {
    existingGalleryUrls.value.splice(index, 1)
    existingGalleryIds.value.splice(index, 1)
}

// Itinerary handlers
const addDay = () => {
    itinerary.value.push({ title: '', description: '' })
}

const removeDay = (index: number) => {
    itinerary.value.splice(index, 1)
}

// Upload helper
const uploadFiles = async (files: File[]) => {
    const formData = new FormData()
    for (const file of files) {
        formData.append('files', file)
    }
    const res = await fetch(`${apiUrl}/api/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token.value}` },
        body: formData,
    })
    if (!res.ok) throw new Error('Errore nel caricamento immagini')
    return await res.json()
}

const saveTrip = async () => {
    saving.value = true

    try {
        // Validate
        if (!form.value.title.trim()) throw new Error('Il titolo è obbligatorio')
        if (!form.value.destination.trim()) throw new Error('La destinazione è obbligatoria')

        // Upload new image if selected
        let imageId = existingImageId.value
        if (imageFile.value) {
            const uploaded = await uploadFiles([imageFile.value])
            imageId = uploaded[0].id
        }

        if (!imageId && !isEdit.value) {
            throw new Error("L'immagine di copertina è obbligatoria")
        }

        // Upload new gallery files
        let galleryIds = [...existingGalleryIds.value]
        if (galleryFiles.value.length > 0) {
            const uploaded = await uploadFiles(galleryFiles.value)
            galleryIds.push(...uploaded.map((f: any) => f.id))
        }

        // Build payload
        const payload: any = {
            title: form.value.title,
            destination: form.value.destination,
            shortDescription: form.value.shortDescription || null,
            description: form.value.description || null,
            itinerary: itinerary.value.filter(d => d.title.trim()),
        }
        if (imageId) payload.image = imageId
        if (galleryIds.length > 0) payload.gallery = galleryIds

        const url = isEdit.value
            ? `${apiUrl}/api/trips/${tripId.value}`
            : `${apiUrl}/api/trips`

        const res = await fetch(url, {
            method: isEdit.value ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token.value}`,
            },
            body: JSON.stringify({ data: payload }),
        })

        if (!res.ok) {
            const data = await res.json()
            throw new Error(data?.error?.message || 'Errore nel salvataggio')
        }

        toast.success(`Viaggio ${isEdit.value ? 'aggiornato' : 'creato'} con successo!`)
        setTimeout(() => {
            router.push('/dashboard/viaggi')
        }, 800)
    } catch (err: any) {
        toast.error(err.message)
    } finally {
        saving.value = false
    }
}

onMounted(fetchTrip)
</script>

<template>
    <div class="p-6 lg:p-10 max-w-4xl">
        <!-- Header -->
        <div class="flex items-center gap-4 mb-8">
            <button @click="router.push('/dashboard/viaggi')"
                class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                <ArrowLeft class="w-5 h-5" />
            </button>
            <div>
                <h1 class="text-2xl font-black text-slate-900">
                    {{ isEdit ? 'Modifica Viaggio' : 'Nuovo Viaggio' }}
                </h1>
                <p class="text-sm text-slate-500 font-medium">
                    {{ isEdit ? 'Modifica i dettagli del viaggio' : 'Compila i campi per creare un nuovo viaggio' }}
                </p>
            </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="flex justify-center py-20">
            <div class="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
        </div>

        <div v-else class="space-y-6">
            <!-- Basic Info -->
            <Card class="rounded-2xl border-none shadow-sm overflow-hidden">
                <CardContent class="p-6 space-y-5">
                    <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider">Informazioni Base</h3>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Titolo *</label>
                            <input v-model="form.title" type="text"
                                class="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                placeholder="Es. Avventura in Islanda" />
                        </div>
                        <div>
                            <label class="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Destinazione
                                *</label>
                            <input v-model="form.destination" type="text"
                                class="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                placeholder="Es. Islanda" />
                        </div>
                    </div>

                    <div>
                        <label class="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Descrizione Breve</label>
                        <input v-model="form.shortDescription" type="text" maxlength="160"
                            class="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            placeholder="Max 160 caratteri" />
                        <p class="text-xs text-slate-400 mt-1">{{ form.shortDescription.length }}/160</p>
                    </div>

                    <div>
                        <label class="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Descrizione
                            Completa</label>
                        <textarea v-model="form.description" rows="6"
                            class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-y"
                            placeholder="Descrivi il viaggio in dettaglio..."></textarea>
                    </div>
                </CardContent>
            </Card>

            <!-- Image -->
            <Card class="rounded-2xl border-none shadow-sm overflow-hidden">
                <CardContent class="p-6 space-y-4">
                    <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider">Immagine di Copertina *</h3>

                    <div class="flex items-start gap-4">
                        <!-- Preview -->
                        <div class="w-40 h-28 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                            <img v-if="imagePreview || existingImageUrl" :src="imagePreview || existingImageUrl || ''"
                                class="w-full h-full object-cover" />
                            <div v-else class="w-full h-full flex items-center justify-center text-slate-300">
                                <ImagePlus class="w-8 h-8" />
                            </div>
                        </div>
                        <div>
                            <label
                                class="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-sm font-semibold text-slate-600 transition-colors">
                                <Upload class="w-4 h-4" />
                                Scegli immagine
                                <input type="file" accept="image/*" class="hidden" @change="onImageSelect" />
                            </label>
                            <p class="text-xs text-slate-400 mt-2">JPG, PNG. Consigliato 1200×800px</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <!-- Gallery -->
            <Card class="rounded-2xl border-none shadow-sm overflow-hidden">
                <CardContent class="p-6 space-y-4">
                    <div class="flex items-center justify-between">
                        <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider">Galleria</h3>
                        <label
                            class="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-600 transition-colors">
                            <Plus class="w-3.5 h-3.5" /> Aggiungi
                            <input type="file" accept="image/*" multiple class="hidden" @change="onGallerySelect" />
                        </label>
                    </div>

                    <div v-if="existingGalleryUrls.length > 0 || galleryPreviews.length > 0"
                        class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                        <!-- Existing -->
                        <div v-for="(url, i) in existingGalleryUrls" :key="'ex-' + i"
                            class="relative aspect-square rounded-xl overflow-hidden group">
                            <img :src="url" class="w-full h-full object-cover" />
                            <button @click="removeGalleryExisting(i)"
                                class="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2 class="w-3 h-3" />
                            </button>
                        </div>
                        <!-- New -->
                        <div v-for="(url, i) in galleryPreviews" :key="'new-' + i"
                            class="relative aspect-square rounded-xl overflow-hidden group ring-2 ring-primary/30">
                            <img :src="url" class="w-full h-full object-cover" />
                            <button @click="removeGalleryNew(i)"
                                class="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2 class="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                    <p v-else class="text-sm text-slate-400">Nessuna immagine nella galleria</p>
                </CardContent>
            </Card>

            <!-- Itinerary -->
            <Card class="rounded-2xl border-none shadow-sm overflow-hidden">
                <CardContent class="p-6 space-y-4">
                    <div class="flex items-center justify-between">
                        <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider">Itinerario</h3>
                        <Button @click="addDay" variant="outline" size="sm"
                            class="rounded-xl h-8 text-xs font-bold gap-1.5">
                            <Plus class="w-3.5 h-3.5" /> Aggiungi Giorno
                        </Button>
                    </div>

                    <div v-if="itinerary.length > 0" class="space-y-4">
                        <div v-for="(day, i) in itinerary" :key="i"
                            class="bg-slate-50 rounded-xl p-4 space-y-3 relative group">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-2">
                                    <GripVertical class="w-4 h-4 text-slate-300" />
                                    <span class="text-xs font-bold text-primary uppercase">Giorno {{ i + 1 }}</span>
                                </div>
                                <button @click="removeDay(i)"
                                    class="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                    <Trash2 class="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <input v-model="day.title" type="text"
                                class="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                :placeholder="`Titolo giorno ${i + 1}`" />
                            <textarea v-model="day.description" rows="3"
                                class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-y"
                                placeholder="Descrizione delle attività..."></textarea>
                        </div>
                    </div>
                    <p v-else class="text-sm text-slate-400">Nessun giorno nell'itinerario</p>
                </CardContent>
            </Card>



            <!-- Actions -->
            <div class="flex items-center gap-3 pt-2">
                <Button @click="router.push('/dashboard/viaggi')" variant="outline"
                    class="rounded-2xl px-6 h-12 font-bold border-slate-200">
                    Annulla
                </Button>
                <Button @click="saveTrip" :disabled="saving"
                    class="rounded-2xl px-8 h-12 font-bold shadow-lg hover:shadow-primary/30 transition-all gap-2">
                    <Loader2 v-if="saving" class="w-4 h-4 animate-spin" />
                    <Save v-else class="w-4 h-4" />
                    {{ isEdit ? 'Salva Modifiche' : 'Crea Viaggio' }}
                </Button>
            </div>
        </div>
    </div>
</template>
