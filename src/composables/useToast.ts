import { ref } from 'vue'

export interface Toast {
    id: string
    title?: string
    message: string
    type?: 'success' | 'error' | 'info' | 'warning'
    duration?: number
}

const toasts = ref<Toast[]>([])

export function useToast() {
    const addToast = (toast: Omit<Toast, 'id'>) => {
        const id = Math.random().toString(36).substring(2, 9)
        const newToast: Toast = {
            id,
            duration: 5000, // default duration
            ...toast
        }

        toasts.value.push(newToast)

        if (newToast.duration && newToast.duration > 0) {
            setTimeout(() => {
                removeToast(id)
            }, newToast.duration)
        }
    }

    const removeToast = (id: string) => {
        const index = toasts.value.findIndex(t => t.id === id)
        if (index !== -1) {
            toasts.value.splice(index, 1)
        }
    }

    return {
        toasts,
        addToast,
        removeToast,
        success: (message: string, title?: string) => addToast({ message, title, type: 'success' }),
        error: (message: string, title?: string) => addToast({ message, title, type: 'error' }),
        info: (message: string, title?: string) => addToast({ message, title, type: 'info' }),
        warning: (message: string, title?: string) => addToast({ message, title, type: 'warning' }),
    }
}
