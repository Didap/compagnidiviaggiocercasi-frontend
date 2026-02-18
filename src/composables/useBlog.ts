import { ref } from 'vue'
import { useAuth } from './useAuth'

export interface Post {
    id: number
    documentId: string
    title: string
    slug: string
    excerpt: string
    content: any[] // Blocks content
    category?: string
    publishedAt: string
    cover?: {
        url: string
        alternativeText?: string
    }
    author?: {
        username: string
    }
}

export function useBlog() {
    const { token } = useAuth()
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:1337'

    // Get all posts (public)
    const getAllPosts = async () => {
        isLoading.value = true
        error.value = null
        try {
            const response = await fetch(`${API_URL}/api/posts?populate=*&sort=publishedAt:desc`)
            if (!response.ok) throw new Error('Failed to fetch posts')
            const data = await response.json()
            return data.data as Post[]
        } catch (err: any) {
            error.value = err.message
            throw err
        } finally {
            isLoading.value = false
        }
    }

    // Get single post by slug (public)
    const getPostBySlug = async (slug: string) => {
        isLoading.value = true
        error.value = null
        try {
            const response = await fetch(`${API_URL}/api/posts?filters[slug][$eq]=${slug}&populate=*`)
            if (!response.ok) throw new Error('Failed to fetch post')
            const data = await response.json()
            if (!data.data || data.data.length === 0) return null
            return data.data[0] as Post
        } catch (err: any) {
            error.value = err.message
            throw err
        } finally {
            isLoading.value = false
        }
    }

    // Create post (authenticated)
    const createPost = async (postData: Partial<Post>) => {
        isLoading.value = true
        error.value = null
        try {
            const response = await fetch(`${API_URL}/api/posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token.value}`
                },
                body: JSON.stringify({ data: postData })
            })
            if (!response.ok) throw new Error('Failed to create post')
            const data = await response.json()
            return data.data
        } catch (err: any) {
            error.value = err.message
            throw err
        } finally {
            isLoading.value = false
        }
    }

    // Update post (authenticated)
    const updatePost = async (documentId: string, postData: Partial<Post>) => {
        isLoading.value = true
        error.value = null
        try {
            const response = await fetch(`${API_URL}/api/posts/${documentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token.value}`
                },
                body: JSON.stringify({ data: postData })
            })
            if (!response.ok) throw new Error('Failed to update post')
            const data = await response.json()
            return data.data
        } catch (err: any) {
            error.value = err.message
            throw err
        } finally {
            isLoading.value = false
        }
    }

    // Delete post (authenticated)
    const deletePost = async (documentId: string) => {
        isLoading.value = true
        error.value = null
        try {
            const response = await fetch(`${API_URL}/api/posts/${documentId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token.value}`
                }
            })
            if (!response.ok) throw new Error('Failed to delete post')
            return true
        } catch (err: any) {
            error.value = err.message
            throw err
        } finally {
            isLoading.value = false
        }
    }

    return {
        isLoading,
        error,
        getAllPosts,
        getPostBySlug,
        createPost,
        updatePost,
        deletePost
    }
}
