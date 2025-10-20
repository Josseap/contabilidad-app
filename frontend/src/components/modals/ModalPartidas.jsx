import { useMemo, useState } from 'react'
import SelectCuenta from '@/components/ui/SelectCuenta'
import Button from '@/components/ui/Button'
import { fmtQ } from '@/lib/money'

export default function ModalPartidas({ open, onClose, partidasInit, onSave }) {
    const [editMode, setEditMode] = useState(false)
    const [partidas, setPartidas] = useState(partidasInit || [])
    const [nueva, setNueva] = useState({ cuenta: null, tipo: 'Debe', monto: '' })

    const tot = useMemo(() => {
        const debe = partidas.filter(p => p.tipo === 'Debe')
            .reduce((a,b)=>a + Number(b.monto||0), 0)
        const haber = partidas.filter(p => p.tipo === 'Haber')
            .reduce((a,b)=>a + Number(b.monto||0), 0)
        return { debe, haber, balance: +(debe - haber).toFixed(2) }
    }, [partidas])

    if (!open) return null

    const add = e => {
        e.preventDefault()
        if (!nueva.cuenta || !nueva.monto) return
        setPartidas(p => [...p, { ...nueva }])
        setNueva({ cuenta: null, tipo: 'Debe', monto: '' })
    }
    const del = i => setPartidas(p => p.filter((_,idx)=>idx!==i))
    const save = () => {
        if (tot.balance !== 0) return alert('Debe = Haber antes de guardar.')
        onSave(partidas)
        onClose()
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200">
                <h2 className="text-xl font-semibold mb-4">Partidas contables</h2>

                {!editMode ? (
                    <>
                        <table className="min-w-full text-sm border">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left">Cuenta</th>
                                <th className="px-3 py-2 text-left">Tipo</th>
                                <th className="px-3 py-2 text-right">Monto</th>
                            </tr>
                            </thead>
                            <tbody>
                            {partidas.map((p,i)=>(
                                <tr key={i} className="border-t">
                                    <td className="px-3 py-1">
                                        {p.cuenta?.codigo || p.cuenta} - {p.cuenta?.nombre}
                                    </td>
                                    <td className="px-3 py-1">{p.tipo}</td>
                                    <td className="px-3 py-1 text-right">{fmtQ(Number(p.monto))}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>

                        <div className="flex justify-between items-center pt-2 text-sm">
                            <div>
                                <b>Debe:</b> {fmtQ(tot.debe)} <span className="ml-4"><b>Haber:</b> {fmtQ(tot.haber)}</span>
                            </div>
                            {tot.balance === 0
                                ? <span className="text-green-600 font-medium">✅ Cuadrado</span>
                                : <span className="text-red-600 font-medium">⚠️ No Cuadrado</span>}
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button onClick={()=>setEditMode(true)} className="bg-gray-800 text-white">Editar</Button>
                            <Button onClick={onClose} className="bg-gray-200 text-gray-800">Cerrar</Button>
                        </div>
                    </>
                ) : (
                    <>
                        <form onSubmit={add} className="flex flex-col sm:flex-row gap-2 items-center">
                            <div className="flex-1 w-full">
                                <SelectCuenta value={nueva.cuenta} onChange={c=>setNueva(n=>({...n, cuenta:c}))} />
                            </div>
                            <select value={nueva.tipo} onChange={e=>setNueva(n=>({...n, tipo:e.target.value}))}
                                    className="border rounded-lg px-3 py-2">
                                <option value="Debe">Debe</option>
                                <option value="Haber">Haber</option>
                            </select>
                            <input type="number" step="0.01" min="0" placeholder="Monto"
                                   value={nueva.monto} onChange={e=>setNueva(n=>({...n, monto:e.target.value}))}
                                   className="border rounded-lg px-3 py-2 w-32" />
                            <Button type="submit">Agregar</Button>
                        </form>

                        <table className="min-w-full text-sm border mt-3">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left">Cuenta</th>
                                <th className="px-3 py-2 text-left">Tipo</th>
                                <th className="px-3 py-2 text-right">Monto</th>
                                <th></th>
                            </tr>
                            </thead>
                            <tbody>
                            {partidas.map((p,i)=>(
                                <tr key={i} className="border-t">
                                    <td className="px-3 py-1">{p.cuenta?.codigo || p.cuenta} - {p.cuenta?.nombre}</td>
                                    <td className="px-3 py-1">{p.tipo}</td>
                                    <td className="px-3 py-1 text-right">{fmtQ(Number(p.monto))}</td>
                                    <td className="px-3 py-1 text-right">
                                        <button type="button" onClick={()=>del(i)} className="text-red-600 hover:underline">Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>

                        <div className="flex justify-between items-center pt-2 text-sm">
                            <div>
                                <b>Debe:</b> {fmtQ(tot.debe)} <span className="ml-4"><b>Haber:</b> {fmtQ(tot.haber)}</span>
                            </div>
                            {tot.balance === 0
                                ? <span className="text-green-600 font-medium">✅ Cuadrado</span>
                                : <span className="text-red-600 font-medium">⚠️ No Cuadrado</span>}
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button onClick={save} disabled={tot.balance!==0} className="bg-gray-900 text-white disabled:bg-gray-400">Guardar</Button>
                            <Button onClick={()=>setEditMode(false)} className="bg-gray-200 text-gray-800">Cancelar</Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
