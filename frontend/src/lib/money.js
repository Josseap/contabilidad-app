export const fmtQ = n =>
    `Q ${Number(n || 0).toLocaleString('es-GT', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`

export const toNumber = v =>
    Number(String(v).replace(/[^\d.-]/g, '')) || 0
