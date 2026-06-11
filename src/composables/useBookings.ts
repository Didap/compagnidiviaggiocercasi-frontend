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
            // Filtering and populate happen server-side: the content API rejects
            // filters on user relations ("Invalid key user"), so /api/bookings
            // with query filters always returned 400 and an empty profile.
            const data: any = await $api('/api/bookings/mine')

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
