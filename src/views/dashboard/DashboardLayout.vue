<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, RouterLink, RouterView, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import {
    LayoutDashboard,
    Map,
    Tag,
    Star,
    Users,
    LogOut,
    Menu,
    X,
    ChevronLeft,
} from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const { user, fullName, fetchMe, logout, isAdmin } = useAuth()
const sidebarOpen = ref(false)

const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { to: '/dashboard/viaggi', label: 'Viaggi', icon: Map },
    { to: '/dashboard/offerte', label: 'Offerte', icon: Tag },
    { to: '/dashboard/recensioni', label: 'Recensioni', icon: Star },
    { to: '/dashboard/utenti', label: 'Utenti', icon: Users },
]

const isActive = (item: typeof navItems[0]) => {
    if (item.exact) return route.path === item.to
    return route.path.startsWith(item.to)
}

const handleLogout = () => {
    logout()
    router.push('/')
}

onMounted(async () => {
    await fetchMe()
    if (!isAdmin.value) {
        router.push('/')
    }
})
</script>

<template>
    <div class="min-h-screen bg-slate-50 flex">
        <!-- Sidebar (Desktop) -->
        <aside class="hidden lg:flex w-64 flex-col bg-white border-r border-slate-100 fixed inset-y-0 left-0 z-30">
            <!-- Logo -->
            <div class="h-16 flex items-center px-6 border-b border-slate-100">
                <RouterLink to="/" class="flex items-center gap-3">
                    <img src="@/assets/logoquadrato.png" alt="Logo" class="h-9" />
                    <span class="font-black text-lg text-slate-800">Admin</span>
                </RouterLink>
            </div>

            <!-- Nav -->
            <nav class="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                <RouterLink v-for="item in navItems" :key="item.to" :to="item.to" @click="sidebarOpen = false" :class="[
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200',
                    isActive(item)
                        ? 'bg-primary/10 text-primary shadow-sm'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                ]">
                    <component :is="item.icon" class="w-5 h-5" />
                    {{ item.label }}
                </RouterLink>
            </nav>

            <!-- User -->
            <div class="p-4 border-t border-slate-100">
                <div class="flex items-center gap-3 px-3 py-2">
                    <div
                        class="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0">
                        <span class="text-sm font-black text-white">
                            {{ user?.firstName?.charAt(0) || 'A' }}
                        </span>
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-bold text-slate-800 truncate">{{ fullName }}</p>
                        <p class="text-xs text-slate-400 truncate">Admin</p>
                    </div>
                    <button @click="handleLogout"
                        class="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                        title="Esci">
                        <LogOut class="w-4 h-4" />
                    </button>
                </div>
            </div>
        </aside>

        <!-- Mobile Header -->
        <div
            class="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-100 z-40 flex items-center justify-between px-4">
            <div class="flex items-center gap-3">
                <button @click="sidebarOpen = true"
                    class="p-2 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
                    <Menu class="w-5 h-5" />
                </button>
                <span class="font-black text-lg text-slate-800">Admin</span>
            </div>
            <RouterLink to="/"
                class="text-sm font-semibold text-slate-500 hover:text-primary transition-colors flex items-center gap-1">
                <ChevronLeft class="w-4 h-4" /> Sito
            </RouterLink>
        </div>

        <!-- Mobile Sidebar Overlay -->
        <Teleport to="body">
            <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0"
                enter-to-class="opacity-100" leave-active-class="transition duration-200 ease-in"
                leave-from-class="opacity-100" leave-to-class="opacity-0">
                <div v-if="sidebarOpen" class="fixed inset-0 z-[100] lg:hidden">
                    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="sidebarOpen = false"></div>
                    <div class="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl flex flex-col">
                        <div class="h-16 flex items-center justify-between px-6 border-b border-slate-100">
                            <span class="font-black text-lg text-slate-800">Admin</span>
                            <button @click="sidebarOpen = false"
                                class="p-2 text-slate-400 hover:text-slate-600 rounded-xl">
                                <X class="w-5 h-5" />
                            </button>
                        </div>
                        <nav class="flex-1 py-6 px-3 space-y-1">
                            <RouterLink v-for="item in navItems" :key="item.to" :to="item.to"
                                @click="sidebarOpen = false" :class="[
                                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200',
                                    isActive(item)
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                                ]">
                                <component :is="item.icon" class="w-5 h-5" />
                                {{ item.label }}
                            </RouterLink>
                        </nav>
                        <div class="p-4 border-t border-slate-100">
                            <button @click="handleLogout"
                                class="flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                                <LogOut class="w-5 h-5" />
                                Esci
                            </button>
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>

        <!-- Main Content -->
        <main class="flex-1 lg:ml-64">
            <div class="pt-16 lg:pt-0 min-h-screen">
                <RouterView />
            </div>
        </main>
    </div>
</template>
