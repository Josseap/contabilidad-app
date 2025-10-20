export const IVA_RATE = 0.12

export const calcIVA = base => {
    const b = Number(base || 0)
    const iva = +(b * IVA_RATE).toFixed(2)
    const total = +(b + iva).toFixed(2)
    return { base: b, iva, total }
}

export const resumen = m => {
    const sum = arr => arr.reduce((x, y) => x + Number(y.iva || 0), 0)
    const debito = sum(m.ventas)
    const credito = sum(m.compras)
    return { debito, credito, saldo: +(debito - credito).toFixed(2) }
}
