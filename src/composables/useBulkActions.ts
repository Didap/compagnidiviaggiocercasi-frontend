import { ref, computed } from 'vue'

export function useBulkActions(items: any) {
    const selectedIds = ref<any[]>([])

    const toggleSelect = (id: any) => {
        if (selectedIds.value.includes(id)) {
            selectedIds.value = selectedIds.value.filter(itemId => itemId !== id)
        } else {
            selectedIds.value.push(id)
        }
    }

    const selectAll = (allIds: any[]) => {
        if (selectedIds.value.length === allIds.length) {
            selectedIds.value = []
        } else {
            selectedIds.value = [...allIds]
        }
    }

    const deselectAll = () => {
        selectedIds.value = []
    }

    const isAllSelected = computed(() => {
        return items.value.length > 0 && selectedIds.value.length === items.value.length
    })

    return {
        selectedIds,
        toggleSelect,
        selectAll,
        deselectAll,
        isAllSelected
    }
}
