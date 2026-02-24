export const isOfferBookable = (offer: any): boolean => {
    if (!offer || !offer.startDate) return false

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const startDate = new Date(offer.startDate)
    startDate.setHours(0, 0, 0, 0)

    const diffTime = startDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    const daysBeforeClose = typeof offer.daysBeforeClose === 'number' ? offer.daysBeforeClose : 30

    return diffDays >= daysBeforeClose
}
