export default function SelectCategoria({ value, onChange }) {
    const categorias = [
        { value: 'general', label: 'General', exento: false },
        { value: 'gasolina', label: 'Gasolina (IDP Exento)', exento: true },
        { value: 'energia', label: 'Energía Eléctrica (Exento)', exento: true },
        { value: 'otros', label: 'Otros', exento: false },
    ]

    return (
        <select
            value={value}
            onChange={e => onChange(e.target.value)}
            className="border rounded-lg px-3 py-2"
        >
            {categorias.map(c => (
                <option key={c.value} value={c.value}>
                    {c.label}
                </option>
            ))}
        </select>
    )
}

export const isExento = categoria =>
    categoria === 'gasolina' || categoria === 'energia'
