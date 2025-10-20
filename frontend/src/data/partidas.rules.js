// Reglas separadas por tipo (compra/venta) y categoría
export const reglasPartidas = {
    compra: {
        general: [
            { cuenta: '4101', tipo: 'Debe',  campo: 'base' },
            { cuenta: '1101', tipo: 'Haber', campo: 'neto' }, // neto = base + exento
        ],
        gasolina: [
            { cuenta: '5101', tipo: 'Debe',  campo: 'base' },
            { cuenta: '1195', tipo: 'Debe',  campo: 'exento' },
            { cuenta: '1101', tipo: 'Haber', campo: 'neto' },
        ],
        energia: [
            { cuenta: '5102', tipo: 'Debe',  campo: 'base' },
            { cuenta: '1196', tipo: 'Debe',  campo: 'exento' }, // Tasa municipal
            { cuenta: '1101', tipo: 'Haber', campo: 'neto' },
        ],
        representacion: [
            { cuenta: '5104', tipo: 'Debe',  campo: 'base' },
            { cuenta: '1101', tipo: 'Haber', campo: 'neto' },
        ],
        otros: [
            { cuenta: '5103', tipo: 'Debe',  campo: 'base' },
            { cuenta: '1101', tipo: 'Haber', campo: 'neto' },
        ],
    },
    venta: {
        general: [
            { cuenta: '1101', tipo: 'Debe',  campo: 'neto' }, // cobro sin IVA
            { cuenta: '4101', tipo: 'Haber', campo: 'base' },
        ],
        otros: [
            { cuenta: '1101', tipo: 'Debe',  campo: 'neto' },
            { cuenta: '4101', tipo: 'Haber', campo: 'base' },
        ],
    },
}

// Genera partidas automáticas según reglas
export function generarPartidasAuto(tipo, categoria, row) {
    const base = Number(row.base || 0)
    const exento = Number(row.exento || 0)
    const neto = base + exento
    const reglasTipo = reglasPartidas[tipo] || {}
    const reglas = reglasTipo[categoria] || []
    const valores = { ...row, base, exento, neto }
    return reglas.map(r => ({
        cuenta: r.cuenta,
        tipo: r.tipo,
        monto: Number(valores[r.campo] || 0),
    }))
}

// Si el CSV trae cuentas explícitas, se usan estas
export function generarPartidasDesdeOverrides(row) {
    const base = Number(row.base || 0)
    const exento = Number(row.exento || 0)
    const neto = base + exento
    const p = []
    if (row.cuenta_base)   p.push({ cuenta: row.cuenta_base,   tipo: 'Debe',  monto: base })
    if (row.cuenta_exento && exento > 0)
        p.push({ cuenta: row.cuenta_exento, tipo: 'Debe',  monto: exento })
    if (row.cuenta_haber)  p.push({ cuenta: row.cuenta_haber,  tipo: 'Haber', monto: neto })
    return p.length ? p : null
}
