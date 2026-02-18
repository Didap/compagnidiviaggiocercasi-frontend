import { ref } from 'vue'
import { useToast } from './useToast'
import { useAuth } from './useAuth'

export function useReviews() {
    const { success, error } = useToast()
    const { token, user } = useAuth()
    const loading = ref(false)

    // Create a new review
    const createReview = async (tripId: number, rating: number, content: string, authorName: string) => {
        if (!tripId || !rating || !authorName) {
            error('Compila tutti i campi obbligatori.', 'Errore')
            return false
        }

        loading.value = true
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token.value}`
                },
                body: JSON.stringify({
                    data: {
                        trip: tripId,
                        rating: rating,
                        content: content,
                        authorName: authorName,
                        user: user.value?.id,
                        travelPeriod: new Date().toISOString() // Optional, defaults to now
                    }
                })
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error?.message || 'Errore durante l\'invio della recensione')
            }

            success('Grazie per il tuo feedback.', 'Recensione inviata!')
            return true

        } catch (err: any) {
            console.error('Error creating review:', err)
            error(err.message || 'Impossibile inviare la recensione.', 'Errore')
            return false
        } finally {
            loading.value = false
        }
    }

    // Fetch reviews for the current user
    const fetchUserReviews = async () => {
        if (!user.value) return []
        loading.value = true
        try {
            // Use custom endpoint to reliably get user's reviews (including drafts)
            const url = `${import.meta.env.VITE_API_URL}/api/reviews/mine`

            console.log('[Reviews] Fetching mine:', url)

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token.value}`
                }
            })

            if (!response.ok) throw new Error('Failed to fetch reviews')

            const data = await response.json()
            console.log('[Reviews] Fetched:', data.data?.length)
            return data.data || []
        } catch (err) {
            console.error('Error fetching user reviews:', err)
            return []
        } finally {
            loading.value = false
        }
    }

    return {
        createReview,
        fetchUserReviews,
        loading
    }
}
