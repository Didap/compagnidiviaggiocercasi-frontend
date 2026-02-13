<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import Navbar from '@/components/Navbar.vue'
import Button from '@/components/ui/button/Button.vue'
import Input from '@/components/ui/input/Input.vue'
import Label from '@/components/ui/label/Label.vue'
import DateOfBirthPicker from '@/components/ui/date-picker/DateOfBirthPicker.vue'
import { User, Mail, Lock, Eye, EyeOff, Phone } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const { register, loading, error } = useAuth()

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  username: '',
  password: '',
  confirmPassword: '',
  phone: '',
  birthday: '',
})

const showPassword = ref(false)
const localError = ref<string | null>(null)

const handleSubmit = async () => {
  localError.value = null

  if (form.value.password !== form.value.confirmPassword) {
    localError.value = 'Le password non corrispondono'
    return
  }

  if (form.value.password.length < 6) {
    localError.value = 'La password deve avere almeno 6 caratteri'
    return
  }

  try {
    await register({
      firstName: form.value.firstName,
      lastName: form.value.lastName,
      email: form.value.email,
      username: form.value.email,
      password: form.value.password,
      phone: form.value.phone || undefined,
      birthday: form.value.birthday || undefined,
    })
    const redirect = route.query.redirect as string
    router.push(redirect || '/')
  } catch {
    // error is handled by useAuth
  }
}

const displayError = () => localError.value || error.value
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
    <div class="absolute inset-0 pointer-events-none select-none overflow-hidden z-10 hidden sm:block">
      <img src="@/assets/globe.png" alt=""
        class="absolute top-36 right-[10%] w-16 h-auto opacity-50 mix-blend-multiply animate-rotate-slow" />
      <img src="@/assets/airplane-passport.png" alt="" style="rotate: -20deg"
        class="absolute top-48 left-[5%] w-24 h-auto animate-float drop-shadow-lg opacity-80" />
    </div>

    <!-- Content -->
    <div class="flex-1 flex items-center justify-center px-5 sm:px-4 relative z-20 overflow-y-auto">
      <div class="w-full max-w-lg py-4">

        <!-- Header -->
        <div class="text-center mb-4 sm:mb-5">
          <span
            class="inline-block py-1 px-3 rounded-full bg-secondary/10 text-secondary font-semibold text-xs tracking-widest uppercase mb-2">
            Unisciti a Noi
          </span>
          <h1 class="text-3xl sm:text-4xl font-black text-primary leading-[0.95] tracking-tight">
            Inizia la tua <span class="text-secondary/80">avventura.</span>
          </h1>
          <p class="text-gray-600 mt-1.5 text-sm font-medium">
            Crea un account e parti con la nostra community
          </p>
        </div>

        <!-- Form Card -->
        <div
          class="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl shadow-primary/5 border border-white/60 p-5 sm:p-6">
          <form @submit.prevent="handleSubmit" class="space-y-3 sm:space-y-4">
            <!-- Error -->
            <div v-if="displayError()"
              class="bg-red-50/80 text-red-600 text-sm rounded-2xl px-4 py-2 border border-red-100/50">
              {{ displayError() }}
            </div>

            <!-- Name Row -->
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <Label for="firstName" class="text-slate-700 font-semibold text-sm">Nome *</Label>
                <div class="relative">
                  <User class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/60" />
                  <Input id="firstName" v-model="form.firstName" type="text" placeholder="Mario"
                    class="pl-10 h-11 rounded-xl border-slate-200/80 bg-white/60 focus:bg-white focus:border-primary/40 transition-all text-base"
                    required />
                </div>
              </div>
              <div class="space-y-1">
                <Label for="lastName" class="text-slate-700 font-semibold text-sm">Cognome *</Label>
                <Input id="lastName" v-model="form.lastName" type="text" placeholder="Rossi"
                  class="h-11 rounded-xl border-slate-200/80 bg-white/60 focus:bg-white focus:border-primary/40 transition-all text-base"
                  required />
              </div>
            </div>

            <!-- Email -->
            <div class="space-y-1">
              <Label for="email" class="text-slate-700 font-semibold text-sm">Email *</Label>
              <div class="relative">
                <Mail class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/60" />
                <Input id="email" v-model="form.email" type="email" placeholder="mario.rossi@email.com"
                  class="pl-10 h-11 rounded-xl border-slate-200/80 bg-white/60 focus:bg-white focus:border-primary/40 transition-all text-base"
                  required />
              </div>
            </div>

            <!-- Password Row -->
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <Label for="password" class="text-slate-700 font-semibold text-sm">Password *</Label>
                <div class="relative">
                  <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/60" />
                  <Input id="password" v-model="form.password" :type="showPassword ? 'text' : 'password'"
                    placeholder="Min. 6 caratteri"
                    class="pl-10 pr-9 h-11 rounded-xl border-slate-200/80 bg-white/60 focus:bg-white focus:border-primary/40 transition-all text-base"
                    required />
                  <button type="button" @click="showPassword = !showPassword"
                    class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors">
                    <Eye v-if="!showPassword" class="w-4 h-4" />
                    <EyeOff v-else class="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div class="space-y-1">
                <Label for="confirmPassword" class="text-slate-700 font-semibold text-sm">Conferma *</Label>
                <div class="relative">
                  <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/60" />
                  <Input id="confirmPassword" v-model="form.confirmPassword" :type="showPassword ? 'text' : 'password'"
                    placeholder="Ripeti password"
                    class="pl-10 h-11 rounded-xl border-slate-200/80 bg-white/60 focus:bg-white focus:border-primary/40 transition-all text-base"
                    required />
                </div>
              </div>
            </div>

            <!-- Phone & Birthday Row -->
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <Label for="phone" class="text-slate-700 font-semibold text-sm">Telefono</Label>
                <div class="relative">
                  <Phone class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/60" />
                  <Input id="phone" v-model="form.phone" type="tel" placeholder="+39 333..."
                    class="pl-10 h-11 rounded-xl border-slate-200/80 bg-white/60 focus:bg-white focus:border-primary/40 transition-all text-base" />
                </div>
              </div>
              <div class="space-y-1">
                <Label for="birthday" class="text-slate-700 font-semibold text-sm">Data di nascita</Label>
                <DateOfBirthPicker v-model="form.birthday" />
              </div>
            </div>

            <!-- Submit -->
            <Button type="submit"
              class="w-full h-12 rounded-full text-base font-bold shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5"
              :disabled="loading">
              <span v-if="loading" class="flex items-center gap-2">
                <svg class="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z" />
                </svg>
                Registrazione...
              </span>
              <span v-else>Crea Account</span>
            </Button>
          </form>

          <!-- Divider + Login link -->
          <div class="relative my-3 sm:my-4">
            <div class="absolute inset-0 flex items-center">
              <span class="w-full border-t border-slate-200/60" />
            </div>
            <div class="relative flex justify-center text-xs uppercase">
              <span class="px-3 text-slate-400 font-semibold tracking-wider">oppure</span>
            </div>
          </div>
          <p class="text-center text-sm text-gray-500">
            Hai già un account?
            <RouterLink to="/accedi" class="text-primary font-bold hover:underline ml-1 transition-colors">
              Accedi
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
