import { useAuth } from '@/composables/useAuth'

const apiUrl = import.meta.env.VITE_API_URL

interface FetchOptions extends RequestInit {
    params?: Record<string, any>
}

export const $api = async <T>(endpoint: string, options: FetchOptions = {}): Promise<T> => {
    const { token } = useAuth()

    // Construct URL with params
    const url = new URL(`${apiUrl}${endpoint}`)
    if (options.params) {
        Object.entries(options.params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                if (Array.isArray(value)) {
                    value.forEach(v => url.searchParams.append(key, v))
                } else {
                    url.searchParams.append(key, String(value))
                }
            }
        })
    }

    // Merge headers
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    }

    if (token.value) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token.value}`
    }

    const response = await fetch(url.toString(), {
        ...options,
        headers
    })

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || `API Error: ${response.statusText}`)
    }

    // Strapi often returns { data: ..., meta: ... }
    const json = await response.json()
    return json
}

// Strapi risponde con al massimo `defaultLimit` (25) elementi se non si pagina,
// e taglia comunque pageSize a `maxLimit` (100): per le liste complete bisogna
// iterare le pagine. `path` è un endpoint collection con query string opzionale.
export const fetchAllPages = async (path: string, token?: string | null): Promise<any[]> => {
    const all: any[] = []
    let page = 1
    let pageCount = 1
    do {
        const sep = path.includes('?') ? '&' : '?'
        const response = await fetch(
            `${apiUrl}${path}${sep}pagination[page]=${page}&pagination[pageSize]=100`,
            { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
        )
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.error?.message || `API Error: ${response.statusText}`)
        }
        const json = await response.json()
        all.push(...(json.data || []))
        pageCount = json.meta?.pagination?.pageCount || 1
        page++
    } while (page <= pageCount)
    return all
}
