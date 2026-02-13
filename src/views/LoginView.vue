<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import Navbar from '@/components/Navbar.vue'
import Button from '@/components/ui/button/Button.vue'
import Input from '@/components/ui/input/Input.vue'
import Label from '@/components/ui/label/Label.vue'
import { Mail, Lock, Eye, EyeOff } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const { login, loading, error } = useAuth()

const identifier = ref('')
const password = ref('')
const showPassword = ref(false)

const handleSubmit = async () => {
  try {
    await login(identifier.value, password.value)
    const redirect = route.query.redirect as string
    router.push(redirect || '/')
  } catch {
    // error is handled by useAuth
  }
}
</script>

<template>
  <div class="relative h-[100dvh] overflow-hidden bg-bg-primary flex flex-col">
    <Navbar />

    <!-- Background Blobs -->
    <div class="absolute inset-0 pointer-events-none select-none overflow-hidden z-0">
      <img src="@/assets/macchia.png" alt=""
        class="absolute -top-40 -left-40 w-[500px] h-auto opacity-30 mix-blend-multiply animate-pulse-slow" />
      <img src="@/assets/macchia.png" alt="" style="rotate: 180deg"
        class="absolute -bottom-40 -right-40 w-[600px] h-auto opacity-30 mix-blend-multiply animate-pulse-slow -scale-x-100" />
      <img src="@/assets/line.png" alt=""
        class="absolute bottom-0 left-0 w-[20%] max-w-[250px] h-auto object-contain opacity-20 animate-fade-in-path hidden md:block" />
      <img src="@/assets/line.png" alt=""
        class="absolute top-0 right-0 w-[20%] max-w-[250px] h-auto object-contain opacity-20 transform rotate-180 animate-fade-in-path hidden md:block" />
    </div>

    <!-- Floating Elements -->
    <div class="absolute inset-0 pointer-events-none select-none overflow-hidden z-10">
      <img src="@/assets/globe.png" alt=""
        class="absolute top-32 left-[8%] w-12 sm:w-20 h-auto opacity-50 mix-blend-multiply animate-rotate-slow" />
      <img src="@/assets/airplane-passport.png" alt="" style="rotate: 30deg"
        class="absolute bottom-24 right-[8%] w-20 sm:w-28 h-auto animate-float drop-shadow-lg opacity-80" />
    </div>

    <!-- Content -->
    <div class="flex-1 flex items-center justify-center px-5 sm:px-4 relative z-20">
      <div class="w-full max-w-md">

        <!-- Header -->
        <div class="text-center mb-6">
          <span
            class="inline-block py-1 px-3 rounded-full bg-secondary/10 text-secondary font-semibold text-xs tracking-widest uppercase mb-3">
            Area Riservata
          </span>
          <h1 class="text-4xl sm:text-5xl font-black text-primary leading-[0.95] tracking-tight">
            Bentornato<br />
            <span class="text-secondary/80">viaggiatore.</span>
          </h1>
          <p class="text-gray-600 mt-2 text-sm sm:text-base font-medium">
            Accedi per scoprire i tuoi prossimi viaggi
          </p>
        </div>

        <!-- Form Card -->
        <div
          class="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl shadow-primary/5 border border-white/60 p-6 sm:p-8">
          <form @submit.prevent="handleSubmit" class="space-y-4 sm:space-y-5">
            <!-- Error -->
            <div v-if="error"
              class="bg-red-50/80 text-red-600 text-sm rounded-2xl px-4 py-2.5 border border-red-100/50">
              {{ error }}
            </div>

            <!-- Email -->
            <div class="space-y-1.5">
              <Label for="identifier" class="text-slate-700 font-semibold text-sm">Email o Username</Label>
              <div class="relative">
                <Mail class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/60" />
                <Input id="identifier" v-model="identifier" type="text" placeholder="mario.rossi@email.com"
                  class="pl-10 h-11 sm:h-12 rounded-2xl border-slate-200/80 bg-white/60 focus:bg-white focus:border-primary/40 transition-all text-base"
                  required />
              </div>
            </div>

            <!-- Password -->
            <div class="space-y-1.5">
              <Label for="password" class="text-slate-700 font-semibold text-sm">Password</Label>
              <div class="relative">
                <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/60" />
                <Input id="password" v-model="password" :type="showPassword ? 'text' : 'password'"
                  placeholder="••••••••"
                  class="pl-10 pr-10 h-11 sm:h-12 rounded-2xl border-slate-200/80 bg-white/60 focus:bg-white focus:border-primary/40 transition-all text-base"
                  required />
                <button type="button" @click="showPassword = !showPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors">
                  <Eye v-if="!showPassword" class="w-4 h-4" />
                  <EyeOff v-else class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- Submit -->
            <Button type="submit"
              class="w-full h-12 sm:h-14 rounded-full text-base font-bold shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5"
              :disabled="loading">
              <span v-if="loading" class="flex items-center gap-2">
                <svg class="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z" />
                </svg>
                Accesso in corso...
              </span>
              <span v-else>Accedi</span>
            </Button>
          </form>

          <!-- Divider -->
          <div class="relative my-5">
            <div class="absolute inset-0 flex items-center">
              <span class="w-full border-t border-slate-200/60" />
            </div>
            <div class="relative flex justify-center text-xs uppercase">
              <span class="bg-white/80 px-3 text-slate-400 font-semibold tracking-wider">oppure</span>
            </div>
          </div>

          <!-- Register link -->
          <p class="text-center text-sm text-gray-500">
            Non hai un account?
            <RouterLink to="/registrati" class="text-primary font-bold hover:underline ml-1 transition-colors">
              Registrati
            </RouterLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
h1 {
  font-feature-settings: "ss01", "ss02", "salt";
}
</style>
