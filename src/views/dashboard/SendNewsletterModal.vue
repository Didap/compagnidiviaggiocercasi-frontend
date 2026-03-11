<script setup lang="ts">
import { ref } from 'vue'
import { X, Send, Loader2 } from 'lucide-vue-next'
import Button from '@/components/ui/button/Button.vue'
import Editor from 'primevue/editor'
import { useToast } from '@/composables/useToast'
import { useAuth } from '@/composables/useAuth'

const props = defineProps({
    isOpen: Boolean
})

const emit = defineEmits(['close', 'success'])

const { token } = useAuth()
const apiUrl = import.meta.env.VITE_API_URL
const toast = useToast()

const subject = ref('')
const content = ref('')
const loading = ref(false)
const actionType = ref<'send' | 'draft' | null>(null)

const resetForm = () => {
    subject.value = ''
    content.value = ''
}

const handleClose = () => {
    resetForm()
    emit('close')
}

const submitNewsletter = async (sendNow: boolean) => {
    if (!subject.value || !content.value) {
        toast.error('Compila tutti i campi obbligatori')
        return
    }

    loading.value = true
    actionType.value = sendNow ? 'send' : 'draft'

    try {
        const payload = {
            data: {
                subject: subject.value,
                content: content.value,
                sendNow: sendNow
            }
        }

        const res = await fetch(`${apiUrl}/api/newsletter-campaigns`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token.value}`
            },
            body: JSON.stringify(payload)
        })

        if (!res.ok) {
            throw new Error(`Error: ${res.statusText}`)
        }

        if (sendNow) {
            toast.success('Newsletter inviata con successo!')
        } else {
            toast.success('Bozza salvata. Controlla Strapi per inviarla poi.')
        }

        emit('success')
        handleClose()
    } catch (err) {
        console.error('Failed to send newsletter:', err)
        toast.error('Errore durante l\'operazione.')
    } finally {
        loading.value = false
        actionType.value = null
    }
}
</script>

<template>
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="handleClose"></div>

        <div
            class="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            <!-- Header -->
            <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                    <h2 class="text-xl font-black text-slate-800">Scrivi Newsletter</h2>
                    <p class="text-sm font-medium text-slate-500">Invia una comunicazione a tutti gli iscritti</p>
                </div>
                <button @click="handleClose"
                    class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                    <X class="w-5 h-5" />
                </button>
            </div>

            <!-- Body -->
            <div class="p-6 overflow-y-auto space-y-6 bg-white">
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2">Oggetto dell'email <span
                            class="text-red-500">*</span></label>
                    <input v-model="subject" type="text" placeholder="Es. Nuovi viaggi disponibili per l'estate!"
                        class="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium" />
                </div>

                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2">Contenuto dell'email (HTML consentito)
                        <span class="text-red-500">*</span></label>
                    <Editor v-model="content" editorStyle="height: 320px" class="rounded-xl overflow-hidden" />
                </div>
            </div>

            <!-- Footer -->
            <div class="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                <Button variant="outline" @click="handleClose" :disabled="loading" class="rounded-xl font-bold px-6">
                    Annulla
                </Button>
                <!-- <Button @click="submitNewsletter(false)" :disabled="loading" variant="outline"
                    class="rounded-xl font-bold px-6 gap-2 text-primary border-primary hover:bg-primary/5">
                    <Loader2 v-if="loading && actionType === 'draft'" class="w-4 h-4 animate-spin" />
                    <Save v-else class="w-4 h-4" />
                    Salva Bozza
                </Button> -->
                <Button @click="submitNewsletter(true)" :disabled="loading" class="rounded-xl font-bold px-6 gap-2">
                    <Loader2 v-if="loading && actionType === 'send'" class="w-4 h-4 animate-spin" />
                    <Send v-else class="w-4 h-4" />
                    Invia a Tutti
                </Button>
            </div>
        </div>
    </div>
</template>
