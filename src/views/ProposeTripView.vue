```
<script setup lang="ts">
import { ref } from 'vue'
import Navbar from '@/components/Navbar.vue'
import { Button } from '@/components/ui/button'
import Input from '@/components/ui/input/Input.vue'
import Label from '@/components/ui/label/Label.vue'
import Textarea from '@/components/ui/textarea/Textarea.vue'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useProposals } from '@/composables/useProposals'
import { useRouter } from 'vue-router'
import { Loader2, Plane, MapPin, Calendar, Wallet, UserCheck } from 'lucide-vue-next'

const router = useRouter()
const { createProposal, loading } = useProposals()

const form = ref({
  destination: '',
  description: '',
  budget: '',
  preferredPeriod: '',
  wantsToCoordinate: false
})

const periods = [
  'Primavera 2026',
  'Estate 2026',
  'Autunno 2026',
  'Inverno 2026',
  '2027',
  'Appena possibile'
]

const submitProposal = async () => {
    const success = await createProposal(form.value)
    if (success) {
        // Reset form
        form.value = {
            destination: '',
            description: '',
            budget: '',
            preferredPeriod: '',
            wantsToCoordinate: false
        }
        // Optional: redirect to profile or show success modal
        setTimeout(() => router.push('/destinazioni'), 2000)
    }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 font-sans">
    <Navbar />

    <div class="container mx-auto px-4 py-12 max-w-2xl">
      
      <div class="text-center mb-12 space-y-4">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-lg text-primary mb-4 transform rotate-3">
            <Plane class="w-8 h-8" />
          </div>
          <h1 class="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Proponi un <span class="text-primary">Viaggio</span>
          </h1>
          <p class="text-lg text-slate-600 max-w-lg mx-auto">
            Hai in mente una meta da sogno? Raccontaci la tua idea e aiutaci a creare la prossima avventura!
          </p>
        </div>

      <div v-if="loading" class="mb-6 p-4 bg-blue-50 text-blue-700 rounded-lg flex items-center gap-3">
        <Loader2 class="w-5 h-5 animate-spin" />
        <span class="font-medium">Invio proposta in corso...</span>
      </div>

      <form @submit.prevent="submitProposal" class="bg-white rounded-2xl shadow-xl p-6 md:p-8 space-y-8">
            
            <!-- Destination -->
            <div class="space-y-2">
              <Label class="text-slate-500 uppercase text-xs font-bold tracking-wider flex items-center gap-2">
                <MapPin class="w-4 h-4" /> Destinazione
              </Label>
              <Input v-model="form.destination" placeholder="Es. Giappone, Patagonia, Islanda..." class="h-12 text-lg bg-slate-50 border-slate-200 focus:border-primary focus:ring-primary/20 rounded-xl" required />
            </div>

            <!-- Description -->
            <div class="space-y-2">
              <Label class="text-slate-500 uppercase text-xs font-bold tracking-wider flex items-center gap-2">
                <span class="text-lg">📝</span> Descrizione dell'idea
              </Label>
              <Textarea 
                v-model="form.description" 
                rows="4"
                class="flex w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Cosa ti piacerebbe fare? Che tipo di esperienza immagini? Avventura, relax, cultura..."
                required
              ></Textarea>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Budget -->
              <div class="space-y-2">
                <Label class="text-slate-500 uppercase text-xs font-bold tracking-wider flex items-center gap-2">
                  <Wallet class="w-4 h-4" /> Budget Stimato (€)
                </Label>
                <Input v-model="form.budget" type="number" min="0" placeholder="Es. 1500" class="h-12 bg-slate-50 border-slate-200 focus:border-primary focus:ring-primary/20 rounded-xl" />
              </div>

              <!-- Period -->
              <div class="space-y-2">
                <Label class="text-slate-500 uppercase text-xs font-bold tracking-wider flex items-center gap-2">
                  <Calendar class="w-4 h-4" /> Periodo Preferito
                </Label>
                <Select v-model="form.preferredPeriod">
                  <SelectTrigger class="h-12 bg-slate-50 border-slate-200 focus:border-primary focus:ring-primary/20 rounded-xl">
                    <SelectValue placeholder="Seleziona un periodo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="period in periods" :key="period" :value="period">
                      {{ period }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <!-- Coordinator Toggle -->
            <div class="bg-indigo-50/50 rounded-2xl p-6 border border-indigo-100">
              <div class="flex items-start gap-4">
                <div class="flex h-6 items-center">
                  <input
                    id="coordinator"
                    v-model="form.wantsToCoordinate"
                    type="checkbox"
                    class="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                </div>
                <div class="text-sm">
                  <label for="coordinator" class="font-bold text-slate-800 flex items-center gap-2 text-base">
                    <UserCheck class="w-5 h-5 text-indigo-600" />
                    Voglio fare il Coordinatore
                  </label>
                  <p class="text-slate-500 mt-1 leading-relaxed">
                    Sei un viaggiatore esperto? Candidati per guidare questo gruppo!
                    Ti contatteremo per un colloquio conoscitivo.
                  </p>
                </div>
              </div>
            </div>

            <!-- Submit Button -->
            <Button 
              type="submit" 
              class="w-full h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-primary to-primary-dark hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
              :disabled="loading"
            >
              <span v-if="!loading" class="flex items-center gap-2">
                <Plane class="w-5 h-5" />
                Invia Proposta
              </span>
              <span v-else class="flex items-center gap-2">
                <Loader2 class="w-5 h-5 animate-spin" />
                Elaborazione...
              </span>
            </Button>
          </form>
    </div>
  </div>
</template>
```
