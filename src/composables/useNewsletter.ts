import { ref } from 'vue'
import { useToast } from './useToast'

export function useNewsletter() {
    const isLoading = ref(false)
    const { addToast } = useToast()

    const subscribeToNewsletter = async (email: string) => {
        if (!email) return

        isLoading.value = true
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:1337'

            const response = await fetch(`${apiUrl}/api/newsletter-registrations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    data: { email }
                })
            })

            if (!response.ok) {
                const errorData = await response.json()
                // Handle unique constraint violation specifically if possible
                if (errorData.error?.message?.includes('unique')) {
                    throw new Error('Questa email è già iscritta.')
                }
                throw new Error(errorData.error?.message || 'Si è verificato un errore.')
            }

            addToast({
                title: 'Iscrizione completata!',
                message: 'Controlla la tua casella di posta per il benvenuto.',
                type: 'success'
            })

            return true
        } catch (e: any) {
            addToast({
                title: 'Errore',
                message: e.message || 'Non è stato possibile completare l\'iscrizione.',
                type: 'error'
            })
            return false
        } finally {
            isLoading.value = false
        }
    }

    return {
        subscribeToNewsletter,
        isLoading
    }
}
