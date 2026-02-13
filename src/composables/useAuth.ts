import { ref, computed } from 'vue'

interface User {
    id: number
    documentId: string
    username: string
    email: string
    firstName: string
    lastName: string
    phone?: string
    birthday?: string
    avatar?: any
    role?: { id: number; name: string; type: string }
}

const user = ref<User | null>(null)
const token = ref<string | null>(localStorage.getItem('jwt'))
const loading = ref(false)
const error = ref<string | null>(null)

const apiUrl = import.meta.env.VITE_API_URL

export function useAuth() {
    const isAuthenticated = computed(() => !!token.value)

    const isAdmin = computed(() => {
        const roleName = user.value?.role?.name?.toLowerCase()
        const roleType = user.value?.role?.type?.toLowerCase()
        return roleName === 'admin' || roleType === 'admin'
    })

    const fullName = computed(() => {
        if (!user.value) return ''
        return `${user.value.firstName} ${user.value.lastName}`
    })

    async function login(identifier: string, password: string) {
        loading.value = true
        error.value = null
        try {
            const response = await fetch(`${apiUrl}/api/auth/local`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, password }),
            })
            const data = await response.json()
            if (!response.ok) {
                throw new Error(data.error?.message || 'Credenziali non valide')
            }
            token.value = data.jwt
            user.value = data.user
            localStorage.setItem('jwt', data.jwt)
            return data
        } catch (err: any) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    async function register(userData: {
        username: string
        email: string
        password: string
        firstName: string
        lastName: string
        phone?: string
        birthday?: string
    }) {
        loading.value = true
        error.value = null
        try {
            const response = await fetch(`${apiUrl}/api/auth/local/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            })
            const data = await response.json()
            if (!response.ok) {
                throw new Error(data.error?.message || 'Errore durante la registrazione')
            }
            token.value = data.jwt
            user.value = data.user
            localStorage.setItem('jwt', data.jwt)
            return data
        } catch (err: any) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    async function fetchMe() {
        if (!token.value) return
        loading.value = true
        try {
            const response = await fetch(`${apiUrl}/api/users/me?populate=*`, {
                headers: { Authorization: `Bearer ${token.value}` },
            })
            if (!response.ok) {
                logout()
                return
            }
            const data = await response.json()
            user.value = data
        } catch {
            logout()
        } finally {
            loading.value = false
        }
    }

    function logout() {
        token.value = null
        user.value = null
        localStorage.removeItem('jwt')
    }

    return {
        user,
        token,
        loading,
        error,
        isAuthenticated,
        isAdmin,
        fullName,
        login,
        register,
        fetchMe,
        logout,
    }
}
