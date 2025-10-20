export const load = (k, fallback) => {
    try {
        return JSON.parse(localStorage.getItem(k)) ?? fallback
    } catch {
        return fallback
    }
}

export const save = (k, v) => {
    localStorage.setItem(k, JSON.stringify(v))
}
