import { load, save } from '@/lib/storage'

const KEY = 'contapp_iva_v1'
const empty = () => ({ ventas: [], compras: [] })

export const getMonth = mk => (load(KEY, {})[mk] ?? empty())

export const add = (mk, kind, row) => {
    const all = load(KEY, {})
    const month = all[mk] ?? empty()
    month[kind] = [...month[kind], row]
    all[mk] = month
    save(KEY, all)
    return month
}

export const removeAt = (mk, kind, i) => {
    const all = load(KEY, {})
    const month = all[mk] ?? empty()
    month[kind] = month[kind].filter((_, idx) => idx !== i)
    all[mk] = month
    save(KEY, all)
    return month
}
