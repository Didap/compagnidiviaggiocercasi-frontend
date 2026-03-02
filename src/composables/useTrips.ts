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

    const sortTripsBySoonestDeparture = (tripsToSort: Trip[]) => {
        return [...tripsToSort].sort((a: any, b: any) => {
            const getEarliestDate = (trip: any) => {
                const t = trip.attributes || trip
                const offersRaw = t.offers
                const offers = Array.isArray(offersRaw?.data) ? offersRaw.data : (Array.isArray(offersRaw) ? offersRaw : [])

                let earliest = Infinity
                offers.forEach((o: any) => {
                    const oData = o.attributes || o
                    if (oData.startDate && (o.attributes?.attivo !== false && o.attivo !== false)) {
                        const time = new Date(oData.startDate).getTime()
                        if (time < earliest) earliest = time
                    }
                })
                return earliest
            }

            return getEarliestDate(a) - getEarliestDate(b)
        })
    }

    return {
        trips,
        loading,
        error,
        fetchTrips,
        getTripBySlug,
        sortTripsBySoonestDeparture
    }
}
