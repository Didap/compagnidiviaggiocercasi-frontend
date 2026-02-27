import { ref } from 'vue'
import { $api } from '@/lib/api'

export interface Trip {
    id: number
    documentId?: string
    title: string
    slug: string
    description: string
    destination: string
    image?: any
    offers?: any[]
    reviews?: any[]
    attributes?: any // Fallback for some v4 structures
}

const trips = ref<Trip[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

export function useTrips() {

    const fetchTrips = async (params: any = {}) => {
        loading.value = true
        error.value = null
        try {
            const defaultParams = {
                'populate[image][fields]': 'url',
                'populate[reviews][populate]': '*',
                'populate[offers][populate]': '*',
                'populate[offers][filters][attivo][$eq]': 'true',
                ...params
            }

            const data: any = await $api('/api/trips', { params: defaultParams })
            trips.value = data.data || []
            return trips.value
        } catch (err: any) {
            console.error('Error fetching trips:', err)
            error.value = err.message
            return []
        } finally {
            loading.value = false
        }
    }

    const getTripBySlug = (slug: string) => {
        return trips.value.find((t: any) => {
            const tSlug = t.attributes?.slug || t.slug
            return tSlug === slug
        })
    }

    return {
        trips,
        loading,
        error,
        fetchTrips,
        getTripBySlug
    }
}
