export const monthKey = d => {
    const dt = d instanceof Date ? d : new Date(d)
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`
}
