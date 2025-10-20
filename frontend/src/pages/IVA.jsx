import { useEffect, useMemo, useState } from 'react'
import { monthKey } from '@/lib/date'
import { fmtQ, toNumber } from '@/lib/money'
import { calcIVA, resumen } from '@/domain/iva'
import { getMonth, add, removeAt } from '@/data/iva.store'
import { generarPartidasAuto, generarPartidasDesdeOverrides } from '@/data/partidas.rules'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Th, Td } from '@/components/ui/Table'
import SelectCategoria, { isExento } from '@/components/ui/SelectCategoria'
import ModalPartidas from '@/components/modals/ModalPartidas'
import ModalImportIVA from '@/components/modals/ModalImportIVA'

export default function IVA() {
    const [month, setMonth] = useState(monthKey(new Date()))
    const [data, setData] = useState(getMonth(month))
    const [form, setForm] = useState({
        tipo: 'venta',
        categoria: 'general',
        fecha: '',
        serie: '',
        numero: '',
        base: '',
        exento: '',
    })
    const [modalOpen, setModalOpen] = useState(false)
    const [partidasSel, setPartidasSel] = useState(null)
    const [importOpen, setImportOpen] = useState(false)

    useEffect(() => setData(getMonth(month)), [month])

    const totals = useMemo(() => resumen(data), [data])
    const handleChange = (k, v) => setForm(p => ({ ...p, [k]: v }))

    // persistir mes completo
    const saveMonth = newData => {
        const KEY = 'contapp_iva_v1'
        const all = JSON.parse(localStorage.getItem(KEY) || '{}')
        all[month] = newData
        localStorage.setItem(KEY, JSON.stringify(all))
        setData(newData)
    }

    // guardar factura + partidas automáticas
    const handleSubmit = e => {
        e.preventDefault()
        const base = toNumber(form.base)
        const exento = isExento(form.categoria) ? toNumber(form.exento) : 0
        if (!form.fecha || base <= 0) return alert('Completa fecha y monto válido')

        const { iva } = calcIVA(base)
        const total = +(base + exento + iva).toFixed(2)
        const row = {
            ...form,
            base,
            exento,
            iva,
            total,
            partidas: generarPartidasAuto(form.tipo, form.categoria, { base, exento }),
        }

        const kind = form.tipo === 'venta' ? 'ventas' : 'compras'
        const newData = { ventas: [...(data.ventas || [])], compras: [...(data.compras || [])] }
        if (kind === 'ventas') newData.ventas.push(row); else newData.compras.push(row)
        saveMonth(newData)

        setForm({ ...form, fecha: '', serie: '', numero: '', base: '', exento: '' })
    }

    // eliminar factura
    const del = (kind, i) => {
        const newData = { ventas: [...(data.ventas || [])], compras: [...(data.compras || [])] }
        newData[kind] = newData[kind].filter((_, idx) => idx !== i)
        saveMonth(newData)
    }

    // partidas modal
    const abrirPartidas = row => { setPartidasSel(row); setModalOpen(true) }
    const guardarPartidas = nuevas => {
        const kind = partidasSel.tipo === 'venta' ? 'ventas' : 'compras'
        const newData = { ventas: [...(data.ventas || [])], compras: [...(data.compras || [])] }
        const idx = newData[kind].indexOf(partidasSel)
        if (idx !== -1) {
            newData[kind][idx] = { ...partidasSel, partidas: nuevas }
            saveMonth(newData)
        }
    }

    // docs del mes para detectar duplicados
    const docsMes = useMemo(() => {
        const ventas = (data.ventas || []).map(v => ({ ...v, tipo: 'venta' }))
        const compras = (data.compras || []).map(c => ({ ...c, tipo: 'compra' }))
        return [...ventas, ...compras]
    }, [data])

    // importación CSV confirmada
    const confirmarImport = rows => {
        const newData = { ventas: [...(data.ventas || [])], compras: [...(data.compras || [])] }
        rows.forEach(r => {
            const base = Number(r.base || 0)
            const exento = Number(r.exento || 0)
            const { iva } = calcIVA(base)
            const total = +(base + exento + iva).toFixed(2)
            const override = generarPartidasDesdeOverrides(r)
            const partidas = override || generarPartidasAuto(r.tipo, r.categoria, { base, exento })
            const row = { ...r, base, exento, iva, total, partidas }
            if (r.tipo === 'venta') newData.ventas.push(row); else newData.compras.push(row)
        })
        saveMonth(newData)
    }

    const visibleTable = form.tipo === 'venta' ? 'ventas' : 'compras'

    return (
        <div className="space-y-6">
            <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                <div>
                    <h2 className="text-xl font-semibold">IVA mensual</h2>
                    <p className="text-sm text-gray-600">Débito (ventas) y crédito (compras) al 12%</p>
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="month"
                        className="border rounded-lg px-3 py-2"
                        value={month}
                        onChange={e => setMonth(e.target.value)}
                    />
                    <Button type="button" className="bg-gray-200 text-gray-800" onClick={() => setImportOpen(true)}>
                        Importar CSV
                    </Button>
                </div>
            </header>

            <Card>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-8 gap-3">
                    <select value={form.tipo} onChange={e=>handleChange('tipo', e.target.value)} className="border rounded-lg px-3 py-2">
                        <option value="venta">Venta</option>
                        <option value="compra">Compra</option>
                    </select>

                    <SelectCategoria value={form.categoria} onChange={v=>handleChange('categoria', v)} />

                    <input type="date" value={form.fecha} onChange={e=>handleChange('fecha', e.target.value)}
                           className="border rounded-lg px-3 py-2" />
                    <input placeholder="Serie" value={form.serie} onChange={e=>handleChange('serie', e.target.value)}
                           className="border rounded-lg px-3 py-2" />
                    <input placeholder="Número" value={form.numero} onChange={e=>handleChange('numero', e.target.value)}
                           className="border rounded-lg px-3 py-2" />
                    <input type="number" step="0.01" min="0" placeholder="Base imponible" value={form.base}
                           onChange={e=>handleChange('base', e.target.value)} className="border rounded-lg px-3 py-2" />

                    {isExento(form.categoria) && (
                        <input type="number" step="0.01" min="0" placeholder="Monto exento" value={form.exento}
                               onChange={e=>handleChange('exento', e.target.value)} className="border rounded-lg px-3 py-2" />
                    )}

                    <Button>Agregar</Button>
                </form>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card><Kpi label="Débito IVA" value={totals.debito} /></Card>
                <Card><Kpi label="Crédito IVA" value={totals.credito} /></Card>
                <Card><Kpi label={totals.saldo >= 0 ? 'Saldo a pagar' : 'Saldo a favor'} value={totals.saldo} /></Card>
            </div>

            {visibleTable === 'ventas' && (
                <Tabla title="Ventas (Débito IVA)" rows={data.ventas} onDelete={i=>del('ventas', i)} onPartidas={abrirPartidas} />
            )}
            {visibleTable === 'compras' && (
                <Tabla title="Compras (Crédito IVA)" rows={data.compras} onDelete={i=>del('compras', i)} onPartidas={abrirPartidas} />
            )}

            {modalOpen && partidasSel && (
                <ModalPartidas
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    partidasInit={partidasSel.partidas}
                    onSave={guardarPartidas}
                />
            )}

            {importOpen && (
                <ModalImportIVA
                    open={importOpen}
                    onClose={() => setImportOpen(false)}
                    onConfirm={confirmarImport}
                    existingDocs={docsMes}
                    monthKey={month}
                />
            )}
        </div>
    )
}

function Kpi({ label, value }) {
    return (
        <>
            <div className="text-sm text-gray-500">{label}</div>
            <div className="text-2xl font-semibold">{fmtQ(value)}</div>
        </>
    )
}

function Tabla({ title, rows, onDelete, onPartidas }) {
    return (
        <Card>
            <div className="flex items-center justify-between mb-2">
                <div className="text-lg font-semibold">{title}</div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                    <tr>
                        <Th>Fecha</Th>
                        <Th>Serie</Th>
                        <Th>Número</Th>
                        <Th>Categoría</Th>
                        <Th className="text-right">Base</Th>
                        <Th className="text-right">Exento</Th>
                        <Th className="text-right">IVA 12%</Th>
                        <Th className="text-right">Total</Th>
                        <Th></Th>
                    </tr>
                    </thead>
                    <tbody>
                    {rows.length === 0 && (
                        <tr><td colSpan={9} className="px-3 py-2 text-gray-500">Sin registros.</td></tr>
                    )}
                    {rows.map((r,i)=>(
                        <tr key={i} className={`border-t ${r.categoria==='gasolina'||r.categoria==='energia' ? 'bg-gray-50':''}`}>
                            <Td>{r.fecha}</Td>
                            <Td>{r.serie}</Td>
                            <Td>{r.numero}</Td>
                            <Td className="capitalize">{r.categoria}</Td>
                            <Td className="text-right">{fmtQ(r.base)}</Td>
                            <Td className="text-right">{fmtQ(r.exento)}</Td>
                            <Td className="text-right">{fmtQ(r.iva)}</Td>
                            <Td className="text-right">{fmtQ(r.total)}</Td>
                            <Td className="text-right space-x-2">
                                <button onClick={()=>onPartidas(r)} className="text-blue-600 hover:underline">Ver partidas</button>
                                <button onClick={()=>onDelete(i)} className="text-red-600 hover:underline">Eliminar</button>
                            </Td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </Card>
    )
}
