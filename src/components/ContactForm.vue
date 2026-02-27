<script setup lang="ts">
import { ref } from 'vue'
import Button from '@/components/ui/button/Button.vue'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-vue-next'

const form = ref({
    name: '',
    email: '',
    subject: '',
    message: ''
})

const isSubmitting = ref(false)
const status = ref<'idle' | 'success' | 'error'>('idle')
const errorMessage = ref('')

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:1337'

const submitForm = async () => {
    isSubmitting.value = true
    status.value = 'idle'
    errorMessage.value = ''

    try {
        const payload = {
            data: {
                name: form.value.name,
                email: form.value.email,
                subject: form.value.subject,
                message: form.value.message
            }
        }

        const res = await fetch(`${API_URL}/api/contact-messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        })

        if (!res.ok) {
            const errorData = await res.json()
            console.error('Contact Form Error:', errorData)
            throw new Error(errorData?.error?.message || 'Si è verificato un errore durante l\'invio del messaggio.')
        }

        status.value = 'success'
        // Reset form
        form.value = { name: '', email: '', subject: '', message: '' }
    } catch (err: any) {
        status.value = 'error'
        errorMessage.value = err.message || 'Errore di connessione. Riprova più tardi.'
    } finally {
        isSubmitting.value = false
    }
}
</script>

<template>
    <div class="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden">
        <!-- Decorazione di sfondo -->
        <div class="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-24 -left-24 w-48 h-48 bg-secondary/5 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative z-10">
            <div class="mb-8">
                <h3 class="text-2xl font-black text-slate-800 mb-2">Inviaci un messaggio</h3>
                <p class="text-slate-500 font-medium">Compila il modulo sottostante e ti risponderemo il prima possibile.</p>
            </div>

            <!-- Success State -->
            <div v-if="status === 'success'" class="bg-green-50 border border-green-200 rounded-2xl p-6 text-center animate-fade-in-up">
                <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle class="w-8 h-8 text-green-500" />
                </div>
                <h4 class="text-xl font-bold text-green-800 mb-2">Messaggio Inviato!</h4>
                <p class="text-green-600 font-medium">Grazie per averci contattato. Ti risponderemo presto.</p>
                <Button @click="status = 'idle'" variant="outline" class="mt-6 border-green-200 text-green-700 hover:bg-green-100 rounded-full px-8">
                    Invia un altro messaggio
                </Button>
            </div>

            <!-- Form -->
            <form v-else @submit.prevent="submitForm" class="space-y-5">
                <!-- Errore State -->
                <div v-if="status === 'error'" class="bg-red-50 border border-red-200 p-4 rounded-2xl flex items-start gap-3 animate-fade-in-up">
                    <AlertCircle class="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                        <p class="text-sm font-bold text-red-800">C'è stato un problema</p>
                        <p class="text-sm text-red-600 mt-0.5">{{ errorMessage }}</p>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div class="space-y-2 relative group">
                        <label for="name" class="block text-sm font-bold text-slate-700 group-focus-within:text-primary transition-colors">Nome Completo <span class="text-red-500">*</span></label>
                        <input type="text" id="name" v-model="form.name" required placeholder="Es. Mario Rossi"
                            class="w-full h-12 px-4 rounded-xl bg-slate-50 border-0 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-primary focus:bg-white transition-all text-slate-900 placeholder:text-slate-400 font-medium" />
                    </div>
                    <div class="space-y-2 relative group">
                        <label for="email" class="block text-sm font-bold text-slate-700 group-focus-within:text-primary transition-colors">Email <span class="text-red-500">*</span></label>
                        <input type="email" id="email" v-model="form.email" required placeholder="Es. mario@email.com"
                            class="w-full h-12 px-4 rounded-xl bg-slate-50 border-0 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-primary focus:bg-white transition-all text-slate-900 placeholder:text-slate-400 font-medium" />
                    </div>
                </div>

                <div class="space-y-2 relative group">
                    <label for="subject" class="block text-sm font-bold text-slate-700 group-focus-within:text-primary transition-colors">Oggetto</label>
                    <input type="text" id="subject" v-model="form.subject" placeholder="Di cosa vuoi parlarci?"
                        class="w-full h-12 px-4 rounded-xl bg-slate-50 border-0 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-primary focus:bg-white transition-all text-slate-900 placeholder:text-slate-400 font-medium" />
                </div>

                <div class="space-y-2 relative group">
                    <label for="message" class="block text-sm font-bold text-slate-700 group-focus-within:text-primary transition-colors">Messaggio <span class="text-red-500">*</span></label>
                    <textarea id="message" v-model="form.message" required rows="5" placeholder="Scrivi qui il tuo messaggio..."
                        class="w-full p-4 rounded-xl bg-slate-50 border-0 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-primary focus:bg-white transition-all text-slate-900 placeholder:text-slate-400 font-medium resize-y min-h-[120px]"></textarea>
                </div>

                <Button type="submit" :disabled="isSubmitting"
                    class="w-full h-14 rounded-xl text-lg font-bold shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all relative overflow-hidden group">
                    <span :class="{'opacity-0': isSubmitting}" class="flex items-center justify-center gap-2">
                        Invia Messaggio
                    </span>
                    <span v-if="isSubmitting" class="absolute inset-0 flex items-center justify-center bg-primary">
                        <Loader2 class="w-6 h-6 animate-spin" />
                    </span>
                </Button>

                <p class="text-xs text-center text-slate-400 font-medium mt-4">
                    Inviando questo modulo, accetti la nostra <RouterLink to="/privacy-policy" class="underline hover:text-primary">Privacy Policy</RouterLink>.
                </p>
            </form>
        </div>
    </div>
</template>

<style scoped>
/* Aggiunge una leggera sfumatura al focus dell'input */
input:focus, textarea:focus {
    box-shadow: 0 0 0 4px theme('colors.primary.DEFAULT');
}
</style>
