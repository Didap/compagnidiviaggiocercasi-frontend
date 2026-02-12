<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import { Menu, X, LogOut, UserCircle, LayoutDashboard } from 'lucide-vue-next'
import Button from '@/components/ui/button/Button.vue'
import { useAuth } from '@/composables/useAuth'

const { isAuthenticated, isAdmin, fullName, logout, fetchMe } = useAuth()

onMounted(() => {
  fetchMe()
})

const isScrolled = ref(false)
const isMobileMenuOpen = ref(false)

const checkScroll = () => {
  isScrolled.value = window.scrollY > 20 // Trigger earlier
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

onMounted(() => {
  window.addEventListener('scroll', checkScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', checkScroll)
})
</script>

<template>
  <nav :class="[
    'fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-in-out',
    isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-2' : 'bg-transparent py-6'
  ]">
    <div class="container mx-auto px-6 flex justify-between items-center">
      <!-- Logo -->
      <a href="/" class="flex items-center group">
        <img v-if="!isScrolled && !isMobileMenuOpen" src="@/assets/logorettangolare.png"
          alt="Compagni di Viaggio Cercasi"
          class="h-14 md:h-16 transition-transform duration-300 group-hover:scale-105 hidden md:block" />
        <img v-else src="@/assets/logoquadrato.png" alt="Compagni di Viaggio Cercasi"
          class="h-10 md:h-12 transition-transform duration-300 group-hover:scale-105" />
        <!-- Mobile Logo fallback -->
        <img v-if="!isScrolled && !isMobileMenuOpen" src="@/assets/logoquadrato.png" alt="Compagni di Viaggio Cercasi"
          class="h-10 block md:hidden" />
      </a>

      <!-- Desktop Menu -->
      <div class="hidden md:flex items-center gap-8">
        <a href="#"
          :class="['font-medium hover:text-primary transition-colors relative after:content-[\'\'] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full text-secondary']">
          Destinazioni
        </a>
        <a href="#"
          :class="['font-medium hover:text-primary transition-colors relative after:content-[\'\'] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full text-secondary']">
          Come Funziona
        </a>
        <a href="#"
          :class="['font-medium hover:text-primary transition-colors relative after:content-[\'\'] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full text-secondary']">
          Chi Siamo
        </a>
        <a href="#"
          :class="['font-medium hover:text-primary transition-colors relative after:content-[\'\'] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full text-secondary']">
          Blog
        </a>
        <!-- Authenticated -->
        <div v-if="isAuthenticated" class="flex items-center gap-3">
          <RouterLink v-if="isAdmin" to="/dashboard">
            <Button variant="outline"
              class="rounded-full px-5 border-primary/30 text-primary hover:bg-primary/5 transition-all gap-2">
              <LayoutDashboard class="w-4 h-4" />
              <span class="font-medium text-sm">Dashboard</span>
            </Button>
          </RouterLink>
          <RouterLink to="/profilo" class="flex items-center gap-2 text-secondary hover:text-primary transition-colors">
            <Button variant="outline"
              class="rounded-full px-6 border-secondary text-secondary hover:bg-secondary/5 transition-all">
              <UserCircle class="w-5 h-5" />
              <span class="font-medium text-sm">{{ fullName }}</span>
            </Button>
          </RouterLink>
          <Button @click="logout"
            class="rounded-full px-6 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5" title="Esci">
            <LogOut class="w-4 h-4" />Esci
          </Button>
        </div>
        <!-- Not Authenticated -->
        <div v-else class="flex items-center gap-3">
          <RouterLink to="/accedi">
            <Button variant="outline"
              class="rounded-full px-6 border-secondary text-secondary hover:bg-secondary/5 transition-all">
              Accedi
            </Button>
          </RouterLink>
          <RouterLink to="/registrati">
            <Button variant="default"
              class="rounded-full px-6 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
              Registrati
            </Button>
          </RouterLink>
        </div>
      </div>

      <!-- Mobile Menu Button -->
      <button @click="toggleMobileMenu"
        class="md:hidden text-secondary p-2 hover:bg-secondary/10 rounded-full transition-colors">
        <Menu v-if="!isMobileMenuOpen" class="w-6 h-6" />
        <X v-else class="w-6 h-6" />
      </button>
    </div>

    <!-- Mobile Menu Drawer -->
    <Teleport to="body">
      <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0"
        enter-to-class="opacity-100" leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100"
        leave-to-class="opacity-0">
        <div v-if="isMobileMenuOpen" class="fixed inset-0 z-[100] md:hidden">
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="isMobileMenuOpen = false"></div>

          <!-- Drawer -->
          <div
            class="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-out translate-x-0">
            <!-- Header -->
            <div class="p-6 flex justify-between items-center border-b border-slate-50">
              <img src="@/assets/logoquadrato.png" alt="Logo" class="h-10" />
              <button @click="isMobileMenuOpen = false" class="p-2 text-slate-400 hover:text-primary transition-colors">
                <X class="w-6 h-6" />
              </button>
            </div>

            <!-- Links -->
            <div class="flex-grow overflow-y-auto py-8 px-6 space-y-2">
              <a href="#"
                class="flex items-center gap-4 text-xl font-bold text-secondary hover:text-primary transition-colors p-3 rounded-2xl hover:bg-slate-50">
                Destinazioni
              </a>
              <a href="#"
                class="flex items-center gap-4 text-xl font-bold text-secondary hover:text-primary transition-colors p-3 rounded-2xl hover:bg-slate-50">
                Come Funziona
              </a>
              <a href="#"
                class="flex items-center gap-4 text-xl font-bold text-secondary hover:text-primary transition-colors p-3 rounded-2xl hover:bg-slate-50">
                Chi Siamo
              </a>
              <a href="#"
                class="flex items-center gap-4 text-xl font-bold text-secondary hover:text-primary transition-colors p-3 rounded-2xl hover:bg-slate-50">
                Blog
              </a>
            </div>

            <!-- Bottom Auth Section -->
            <div class="p-6 border-t border-slate-50 bg-slate-50/50">
              <template v-if="isAuthenticated">
                <div class="flex items-center gap-4 mb-6 p-2">
                  <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <UserCircle class="w-8 h-8" />
                  </div>
                  <div class="flex flex-col">
                    <span class="text-sm text-slate-400 font-medium">Bentornato,</span>
                    <span class="text-lg font-extrabold text-slate-900 leading-tight">{{ fullName }}</span>
                  </div>
                </div>
                <div class="grid gap-3" :class="isAdmin ? 'grid-cols-3' : 'grid-cols-2'">
                  <RouterLink v-if="isAdmin" to="/dashboard" @click="isMobileMenuOpen = false">
                    <Button class="w-full rounded-2xl h-12 font-bold gap-1">
                      <LayoutDashboard class="w-4 h-4" />Admin
                    </Button>
                  </RouterLink>
                  <RouterLink to="/profilo" @click="isMobileMenuOpen = false">
                    <Button variant="outline"
                      class="w-full rounded-2xl h-12 font-bold border-slate-200">Profilo</Button>
                  </RouterLink>
                  <Button @click="logout" variant="ghost"
                    class="w-full rounded-2xl h-12 font-bold text-red-500 hover:text-red-600 hover:bg-red-50">Esci</Button>
                </div>
              </template>
              <template v-else>
                <div class="flex flex-col gap-3">
                  <RouterLink to="/accedi" @click="isMobileMenuOpen = false" class="w-full">
                    <Button variant="outline"
                      class="w-full h-14 rounded-2xl text-lg font-bold border-secondary text-secondary">
                      Accedi
                    </Button>
                  </RouterLink>
                  <RouterLink to="/registrati" @click="isMobileMenuOpen = false" class="w-full">
                    <Button class="w-full h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20">
                      Registrati
                    </Button>
                  </RouterLink>
                </div>
              </template>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </nav>
</template>

<style scoped>
.backdrop-blur-md {
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
</style>
