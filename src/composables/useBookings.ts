import { ref } from 'vue'
import { $api } from '@/lib/api'
import { useAuth } from './useAuth'

export function useBookings() {
    const { user } = useAuth()
    const bookings = ref<any[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    const fetchMyBookings = async () => {
        if (!user.value) return []
        loading.value = true
        error.value = null
        try {
            const data: any = await $api('/api/bookings', {
                params: {
                    'filters[user][id][$eq]': user.value.id,
                    'populate[participants]': '*',
                    'populate[offer][populate][trip][populate]': '*',
                    'populate[offer][populate][itinerary]': '*',
                    'populate[paymentSteps]': '*',
                }
            })

            const bookingList = data.data || []
            // Sort by start date descending
            bookings.value = bookingList.sort((a: any, b: any) => {
                const dateA = new Date(a.attributes?.offer?.data?.attributes?.startDate || a.offer?.startDate || 0)
                const dateB = new Date(b.attributes?.offer?.data?.attributes?.startDate || b.offer?.startDate || 0)
                return dateB.getTime() - dateA.getTime()
            })
            return bookings.value

        } catch (err: any) {
            console.error('Error fetching bookings:', err)
            error.value = err.message
            return []
        } finally {
            loading.value = false
        }
    }

    return {
        bookings,
        loading,
        error,
        fetchMyBookings
    }
}
