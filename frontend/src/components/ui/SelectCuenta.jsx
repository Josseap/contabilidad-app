import {useState} from 'react'
import {PLAN_CUENTAS} from '@/data/planCuentas'

export default function SelectCuenta({value, onChange}) {
    const [search, setSearch] = useState('')

    const filtradas = PLAN_CUENTAS.filter(
        c =>
            c.codigo.toLowerCase().includes(search.toLowerCase()) ||
            c.nombre.toLowerCase().includes(search.toLowerCase())
    )

    const select = c => {
        onChange(c)
        setSearch('')
    }

    return (
        <div className="relative">
            <input
                type="text"
                value={search || (value ? `${value.codigo} - ${value.nombre}` : '')}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar cuenta…"
                className="border rounded-lg px-3 py-2 w-full"
            />
            {search && (
                <div
                    className="absolute z-10 mt-1 bg-white border rounded-lg shadow-sm max-h-40 overflow-y-auto w-full">
                    {filtradas.map(c => (
                        <div
                            key={c.codigo}
                            onClick={() => select(c)}
                            className="px-3 py-1 hover:bg-gray-100 cursor-pointer text-sm"
                        >
                            {c.codigo} - {c.nombre}
                        </div>
                    ))}
                    {filtradas.length === 0 && (
                        <div className="px-3 py-2 text-gray-400 text-sm">Sin resultados</div>
                    )}
                </div>
            )}
        </div>
    )
}
