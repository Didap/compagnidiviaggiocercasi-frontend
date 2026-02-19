export const isOfferBookable = (offer: any): boolean => {
    if (!offer || !offer.startDate) return false

    const today = new Date()
    // Reset time to midnight for fair comparison
    today.setHours(0, 0, 0, 0)

    const startDate = new Date(offer.startDate)
    // Reset time to midnight
    startDate.setHours(0, 0, 0, 0)

    // Calculate difference in milliseconds
    const diffTime = startDate.getTime() - today.getTime()
    // Convert to days
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    // Must be at least 30 days in the future
    return diffDays >= 30
}
