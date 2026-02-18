<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBlog, type Post } from '@/composables/useBlog'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/layout/Footer.vue'
import BlocksRenderer from '@/components/blog/BlocksRenderer.vue'
import { Calendar, User, ArrowLeft } from 'lucide-vue-next'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'

const route = useRoute()
const router = useRouter()
const { getPostBySlug } = useBlog()

const post = ref<Post | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)

const fetchPost = async () => {
    isLoading.value = true
    error.value = null
    try {
        const slug = route.params.slug as string
        const data = await getPostBySlug(slug)
        if (!data) {
            error.value = 'Articolo non trovato'
        } else {
            post.value = data
        }
    } catch (e) {
        error.value = 'Errore nel caricamento dell\'articolo'
    } finally {
        isLoading.value = false
    }
}

onMounted(fetchPost)

watch(() => route.params.slug, fetchPost)

const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'd MMMM yyyy', { locale: it })
}
</script>

<template>
    <main class="min-h-screen bg-white">
        <Navbar />

        <div v-if="isLoading" class="min-h-[60vh] flex items-center justify-center">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>

        <div v-else-if="error" class="min-h-[60vh] flex flex-col items-center justify-center gap-4">
            <h1 class="text-2xl font-bold text-gray-800">{{ error }}</h1>
            <button @click="router.push('/blog')" class="text-primary hover:underline flex items-center gap-2">
                <ArrowLeft class="w-4 h-4" /> Torna al Blog
            </button>
        </div>

        <article v-else-if="post" class="pb-24">
            <!-- Hero Section -->
            <div class="relative w-full h-[50vh] min-h-[400px]">
                <img :src="post.cover?.url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80'" 
                     :alt="post.cover?.alternativeText || post.title"
                     class="w-full h-full object-cover" />
                <div class="absolute inset-0 bg-black/40"></div>
                
                <div class="absolute bottom-0 left-0 w-full p-6 md:p-12 text-white">
                    <div class="container mx-auto max-w-4xl">
                        <span v-if="post.category" class="inline-block px-3 py-1 bg-secondary text-white text-xs font-bold uppercase tracking-wider rounded-full mb-4">
                            {{ post.category }}
                        </span>
                        <h1 class="text-4xl md:text-6xl font-black leading-tight mb-6">
                            {{ post.title }}
                        </h1>
                        <div class="flex items-center gap-6 text-sm font-medium opacity-90">
                            <div class="flex items-center gap-2">
                                <User class="w-4 h-4" />
                                <span>{{ post.author?.username || 'Redazione' }}</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <Calendar class="w-4 h-4" />
                                <span>{{ formatDate(post.publishedAt) }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Content -->
            <div class="container mx-auto max-w-3xl px-6 py-12">
                <BlocksRenderer :content="post.content" />
            </div>

            <!-- Back Button -->
            <div class="container mx-auto max-w-3xl px-6 pb-12">
                <button @click="router.push('/blog')" 
                        class="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-bold uppercase text-sm tracking-widest">
                    <ArrowLeft class="w-4 h-4" />
                    Torna al Blog
                </button>
            </div>
        </article>

        <Footer />
    </main>
</template>
