import { useMemo, useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { fmtQ } from '@/lib/money'

// CSV simple
function parseCSV(text) {
    const lines = text.replace(/\r/g,'').split('\n').filter(Boolean)
    if (!lines.length) return { headers:[], rows:[] }
    const headers = split(lines[0])
    const rows = lines.slice(1).map(l=>{
        const cols = split(l)
        const obj = {}
        headers.forEach((h,i)=> obj[h.trim()] = (cols[i]??'').trim())
        return obj
    })
    return { headers, rows }
}
function split(line){
    const out=[], q='"'; let cur='', open=false
    for(let i=0;i<line.length;i++){
        const ch=line[i]
        if(ch===q){ if(open && line[i+1]===q){cur+=q;i++} else open=!open }
        else if(ch===',' && !open){ out.push(cur); cur='' }
        else cur+=ch
    }
    out.push(cur); return out
}

export default function ModalImportIVA({ open, onClose, onConfirm, existingDocs, monthKey }) {
    const [okRows,setOkRows]=useState([])
    const [errors,setErrors]=useState([])
    if(!open) return null

    const required=['tipo','categoria','fecha','serie','numero','base','exento']

    const duplicates = useMemo(()=>{
        const keys=new Set(existingDocs.map(keyFor))
        return okRows.filter(r=>keys.has(keyFor(r)))
    },[okRows,existingDocs])

    function keyFor(r){
        return `${r.tipo}|${r.categoria}|${r.fecha}|${r.serie}|${r.numero}|${monthKey}`
    }

    const loadFile=async f=>{
        const text=await f.text()
        const {headers,rows}=parseCSV(text)
        const miss=required.filter(h=>!headers.includes(h))
        if(miss.length){ setErrors([`Faltan columnas: ${miss.join(', ')}`]); setOkRows([]); return }

        const oks=[], errs=[]
        rows.forEach((r,idx)=>{
            const rowN=idx+2
            const tipoOk=['venta','compra'].includes(r.tipo)
            const catOk=['general','gasolina','energia','otros','representacion'].includes(r.categoria)
            const fechaOk=/^\d{4}-\d{2}-\d{2}$/.test(r.fecha)
            const baseOk=!isNaN(Number(r.base))
            const exOk=!isNaN(Number(r.exento))
            if(!tipoOk||!catOk||!fechaOk||!baseOk||!exOk){ errs.push(`Fila ${rowN}: datos inválidos`); return }
            oks.push({
                tipo:r.tipo, categoria:r.categoria, fecha:r.fecha, serie:r.serie, numero:r.numero,
                base:Number(r.base), exento:Number(r.exento||0),
                cuenta_base:r.cuenta_base||'', cuenta_exento:r.cuenta_exento||'', cuenta_haber:r.cuenta_haber||'',
            })
        })
        setErrors(errs); setOkRows(oks)
    }

    const totals = useMemo(()=>({
        base: okRows.reduce((a,b)=>a+Number(b.base||0),0),
        ex:   okRows.reduce((a,b)=>a+Number(b.exento||0),0),
    }),[okRows])

    const exampleCSV = () => {
        const rows = [
            'tipo,categoria,fecha,serie,numero,base,exento,cuenta_base,cuenta_exento,cuenta_haber',
            'compra,gasolina,2025-10-16,F001,123,250,15,,1195,1101',
            'compra,energia,2025-10-16,SIN,456,800,50,,1196,1101',
            'venta,general,2025-10-16,A,789,1200,0,4101,,1101',
        ].join('\n')
        const blob=new Blob([rows],{type:'text/csv;charset=utf-8;'})
        const url=URL.createObjectURL(blob)
        const a=document.createElement('a'); a.href=url; a.download='plantilla_iva.csv'; a.click()
        URL.revokeObjectURL(url)
    }

    const confirm=()=>{
        const keySet=new Set(duplicates.map(keyFor))
        const clean=okRows.filter(r=>!keySet.has(keyFor(r)))
        if(!clean.length){ alert('No hay filas válidas.'); return }
        onConfirm(clean); onClose()
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-gray-200">
                <h2 className="text-xl font-semibold mb-4">Importar documentos IVA (CSV)</h2>

                <div className="flex items-center gap-2 mb-4">
                    <input type="file" accept=".csv,text/csv" onChange={e=>e.target.files[0]&&loadFile(e.target.files[0])}
                           className="border rounded-lg px-3 py-2" />
                    <Button type="button" onClick={exampleCSV} className="bg-gray-200 text-gray-800">Descargar plantilla</Button>
                </div>

                {errors.length>0 && (
                    <Card className="mb-4">
                        <div className="text-sm text-red-600">Errores</div>
                        <ul className="list-disc ml-5 text-sm">{errors.map((e,i)=><li key={i}>{e}</li>)}</ul>
                    </Card>
                )}

                {okRows.length>0 && (
                    <Card>
                        <div className="flex justify-between text-sm mb-2">
                            <div>Filas válidas: <b>{okRows.length}</b></div>
                            <div>Base: <b>{fmtQ(totals.base)}</b> <span className="ml-4">Exento: <b>{fmtQ(totals.ex)}</b></span></div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-xs">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-2 py-1 text-left">Tipo</th>
                                    <th className="px-2 py-1 text-left">Categoría</th>
                                    <th className="px-2 py-1 text-left">Fecha</th>
                                    <th className="px-2 py-1 text-left">Serie</th>
                                    <th className="px-2 py-1 text-left">Número</th>
                                    <th className="px-2 py-1 text-right">Base</th>
                                    <th className="px-2 py-1 text-right">Exento</th>
                                    <th className="px-2 py-1 text-left">Cta Base</th>
                                    <th className="px-2 py-1 text-left">Cta Exento</th>
                                    <th className="px-2 py-1 text-left">Cta Haber</th>
                                </tr>
                                </thead>
                                <tbody>
                                {okRows.map((r,i)=>(
                                    <tr key={i} className="border-t">
                                        <td className="px-2 py-1">{r.tipo}</td>
                                        <td className="px-2 py-1">{r.categoria}</td>
                                        <td className="px-2 py-1">{r.fecha}</td>
                                        <td className="px-2 py-1">{r.serie}</td>
                                        <td className="px-2 py-1">{r.numero}</td>
                                        <td className="px-2 py-1 text-right">{fmtQ(r.base)}</td>
                                        <td className="px-2 py-1 text-right">{fmtQ(r.exento)}</td>
                                        <td className="px-2 py-1">{r.cuenta_base}</td>
                                        <td className="px-2 py-1">{r.cuenta_exento}</td>
                                        <td className="px-2 py-1">{r.cuenta_haber}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button onClick={confirm} className="bg-gray-900 text-white">Confirmar importación</Button>
                            <Button onClick={onClose} className="bg-gray-200 text-gray-800">Cancelar</Button>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    )
}
