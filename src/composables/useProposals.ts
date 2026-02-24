import { ref } from 'vue'
import { $api } from '@/lib/api'
import { useAuth } from './useAuth'
import { useToast } from './useToast'

export function useProposals() {
    const { user } = useAuth()
    const { success, error } = useToast()
    const loading = ref(false)

    interface ProposalData {
        destination: string
        description: string
        budget: string
        preferredPeriod: string
        wantsToCoordinate: boolean
    }

    const createProposal = async (data: ProposalData) => {
        if (!user.value) {
            error('Devi essere loggato per proporre un viaggio', 'Errore')
            return false
        }

        loading.value = true
        try {
            await $api('/api/trip-proposals', {
                method: 'POST',
                body: JSON.stringify({
                    data: {
                        ...data,
                        proposalStatus: 'pending',
                        user: user.value.id
                    }
                })
            })

            success('La tua proposta è stata inviata con successo!', 'Grazie!')
            return true

        } catch (err: any) {
            console.error('Error creating proposal:', err)
            error(err.message || 'Impossibile inviare la proposta', 'Errore')
            return false
        } finally {
            loading.value = false
        }
    }

    return {
        createProposal,
        loading
    }
}
