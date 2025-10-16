import { useState, useRef, useEffect } from "react";
import cuentasData from "../data/cuentas.json";
import clientesData from "../data/clientes.json";

// Quita guion y deja números + K
const limpiarNit = (nit) => nit.replace("-", "").toUpperCase();

// Formatea visualmente NIT (ej. 1234567-8)
const formatearNit = (nit) => {
    if (!nit) return "";
    const limpio = limpiarNit(nit);
    if (limpio.length < 2) return limpio;
    return `${limpio.slice(0, -1)}-${limpio.slice(-1)}`;
};

export default function IVA() {
    const [cuentas, setCuentas] = useState([]);
    const [clientes, setClientes] = useState([]);

    const [form, setForm] = useState({
        mes: 1,
        anio: "2025",
        tipoDocumentoId: 1,
        serie: "",
        numero: "",
        nit: "",
        nombre: "",
        fecha: "",
        bienes: 0,
        servicios: 0,
        exentas: 0
    });

    const [lineas, setLineas] = useState([]);
    const [nuevaLinea, setNuevaLinea] = useState({
        codigo: "",
        descripcion: "",
        debe: "",
        haber: ""
    });

    const [sugerenciasCodigos, setSugerenciasCodigos] = useState([]);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [bloqueoCabecera, setBloqueoCabecera] = useState(false);
    const [bloqueoFactura, setBloqueoFactura] = useState(false);
    const [documentoGuardado, setDocumentoGuardado] = useState(false);

    const codigoInputRef = useRef(null);
    const serieInputRef = useRef(null);
    const botonAgregarRef = useRef(null);

    const meses = [
        "Enero","Febrero","Marzo","Abril","Mayo","Junio",
        "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
    ];

    const tiposDocumentos = [
        "Factura de Compras",
        "Factura de Ventas",
        "Nota de Crédito"
    ];

    const camposOrden = [
        "mes","anio","tipoDocumentoId","serie","numero","fecha",
        "nit","nombre","bienes","servicios","exentas",
        "codigo","descripcion","debe","haber"
    ];

    useEffect(() => {
        setCuentas(cuentasData);
        setClientes(clientesData);
    }, []);

    // Manejo inputs y NIT
    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "nit") {
            // Permitir números y último carácter número o K
            const limpio = limpiarNit(value);
            if (!/^\d*[0-9Kk]?$/.test(limpio)) return;

            const encontrado = clientes.find(
                (c) => limpiarNit(c.nit) === limpio
            );
            if (encontrado) {
                setForm({ ...form, nit: limpio, nombre: encontrado.nombre });
            } else {
                setForm({ ...form, nit: limpio });
            }
            return;
        }

        if (name === "mes") {
            let val = parseInt(value) || 1;
            if (val < 1) val = 1;
            if (val > 12) val = 12;
            setForm({ ...form, [name]: val });
            return;
        }

        if (name === "tipoDocumentoId") {
            let val = parseInt(value) || 1;
            if (val < 1) val = 1;
            if (val > tiposDocumentos.length) val = tiposDocumentos.length;
            setForm({ ...form, [name]: val });
            return;
        }

        setForm({ ...form, [name]: value });
    };

    const handleFocus = (e) => e.target.select();

    // Autocompletar Código → Descripción
    const handleCodigoChange = (valor) => {
        setNuevaLinea((prev) => ({
            ...prev,
            codigo: valor,
            descripcion: ""
        }));

        const filtradas = cuentas.filter(
            (c) =>
                c.codigo.startsWith(valor) ||
                c.descripcion.toLowerCase().includes(valor.toLowerCase())
        );
        setSugerenciasCodigos(filtradas);
    };

    const seleccionarSugerenciaCodigo = (codigo, descripcion) => {
        setNuevaLinea({ ...nuevaLinea, codigo, descripcion });
        setSugerenciasCodigos([]);
    };

    // Manejo Planilla
    const handleLineaChange = (e) => {
        const { name, value } = e.target;
        setNuevaLinea({ ...nuevaLinea, [name]: value });
    };

    const agregarLinea = (e) => {
        e.preventDefault();

        if (!nuevaLinea.codigo || (!nuevaLinea.debe && !nuevaLinea.haber)) {
            alert("Completa al menos el código y un monto en Debe o Haber.");
            return;
        }

        const lineaFinal = {
            ...nuevaLinea,
            id: Date.now(),
            debe: parseFloat(nuevaLinea.debe) || 0,
            haber: parseFloat(nuevaLinea.haber) || 0
        };

        setLineas([...lineas, lineaFinal]);
        setNuevaLinea({ codigo: "", descripcion: "", debe: "", haber: "" });
        codigoInputRef.current.focus();
    };

    // Totales
    const totalDebe = lineas.reduce((acc, l) => acc + l.debe, 0);
    const totalHaber = lineas.reduce((acc, l) => acc + l.haber, 0);
    const diferencia = (totalDebe - totalHaber).toFixed(2);

    // Guardar / Reset
    const guardarDocumento = () => {
        // Validación después de limpiar guion: acepta números y K
        if (!/^\d+[0-9Kk]$/.test(form.nit)) {
            alert("El NIT debe ser válido. Ejemplo: 1234567-8 o 1234567-K");
            return;
        }

        if (totalDebe !== totalHaber) {
            alert("Los montos de Debe y Haber no cuadran.");
            setDocumentoGuardado(false);
            return;
        }

        const datosParaGuardar = {
            ...form,
            nit: limpiarNit(form.nit), // Guardar sin guion
            lineas
        };

        alert("Documento guardado correctamente.");
        console.log("Guardado:", datosParaGuardar);

        setDocumentoGuardado(true);
        setTimeout(() => botonAgregarRef.current?.focus(), 0);
    };

    const limpiarParaNuevoDocumento = () => {
        setForm((prev) => ({
            ...prev,
            serie: "",
            numero: "",
            nit: "",
            nombre: "",
            fecha: "",
            bienes: 0,
            servicios: 0,
            exentas: 0
        }));
        setLineas([]);
        setNuevaLinea({ codigo: "", descripcion: "", debe: "", haber: "" });
        setModoEdicion(false);
        setBloqueoCabecera(true);
        setBloqueoFactura(false);
        setDocumentoGuardado(false);
        setTimeout(() => serieInputRef.current?.focus(), 0);
    };

    const cancelarDocumento = () => {
        setForm({
            mes: 1,
            anio: "2025",
            tipoDocumentoId: 1,
            serie: "",
            numero: "",
            nit: "",
            nombre: "",
            fecha: "",
            bienes: 0,
            servicios: 0,
            exentas: 0
        });
        setLineas([]);
        setNuevaLinea({ codigo: "", descripcion: "", debe: "", haber: "" });
        setModoEdicion(false);
        setBloqueoCabecera(false);
        setBloqueoFactura(false);
        setDocumentoGuardado(false);
        setTimeout(() => document.querySelector('[name="mes"]')?.focus(), 0);
    };

    // ESC para guardar o resetear
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") {
                e.preventDefault();
                e.stopPropagation();
                if (bloqueoCabecera && bloqueoFactura) {
                    guardarDocumento();
                } else {
                    cancelarDocumento();
                }
            }
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [bloqueoCabecera, bloqueoFactura, form, lineas]);

    // Navegación con flechas
    const handleGlobalNavigation = (e) => {
        const currentIndex = camposOrden.indexOf(e.target.name);

        if (e.key === "ArrowRight" && currentIndex < camposOrden.length - 1) {
            e.preventDefault();
            document.querySelector(`[name="${camposOrden[currentIndex + 1]}"]`)?.focus();
        }
        if (e.key === "ArrowLeft" && currentIndex > 0) {
            e.preventDefault();
            document.querySelector(`[name="${camposOrden[currentIndex - 1]}"]`)?.focus();
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-4 rounded-lg shadow text-white">
                <h2 className="text-2xl font-bold">Ingreso de Documentos - IVA</h2>
                <p className="text-sm text-blue-100">
                    Completa los datos del documento y registra sus movimientos contables.
                </p>
            </div>

            <form className="bg-white p-6 rounded-xl shadow-md space-y-6 text-sm border border-gray-200">
                {/* Cabecera */}
                <div className="grid grid-cols-4 gap-4">
                    <div className="flex items-center space-x-2">
                        <input
                            type="number"
                            name="mes"
                            value={form.mes}
                            onChange={handleChange}
                            onFocus={handleFocus}
                            onKeyDown={handleGlobalNavigation}
                            disabled={bloqueoCabecera}
                            className="w-16 border border-gray-300 rounded-lg px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-blue-400"
                            min="1"
                            max="12"
                        />
                        <span className="text-gray-700">{meses[form.mes - 1]}</span>
                    </div>

                    <input
                        type="number"
                        name="anio"
                        value={form.anio}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        onKeyDown={handleGlobalNavigation}
                        disabled={bloqueoCabecera}
                        className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />

                    <div className="flex items-center space-x-2 col-span-2">
                        <input
                            type="number"
                            name="tipoDocumentoId"
                            value={form.tipoDocumentoId}
                            onChange={handleChange}
                            onFocus={handleFocus}
                            onKeyDown={handleGlobalNavigation}
                            disabled={bloqueoCabecera}
                            className="w-16 border border-gray-300 rounded-lg px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-blue-400"
                            min="1"
                            max={3}
                        />
                        <span className="text-gray-700">
                            {tiposDocumentos[form.tipoDocumentoId - 1]}
                        </span>
                    </div>
                </div>

                {/* Factura */}
                <div className="grid grid-cols-3 gap-4 mt-4">
                    <input
                        ref={serieInputRef}
                        type="text"
                        name="serie"
                        value={form.serie}
                        onChange={handleChange}
                        onFocus={() => setBloqueoCabecera(true)}
                        onKeyDown={handleGlobalNavigation}
                        disabled={bloqueoFactura}
                        className="border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Serie"
                    />
                    <input
                        type="text"
                        name="numero"
                        value={form.numero}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        onKeyDown={handleGlobalNavigation}
                        disabled={bloqueoFactura}
                        className="border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Número"
                    />
                    <input
                        type="date"
                        name="fecha"
                        value={form.fecha}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        onKeyDown={handleGlobalNavigation}
                        disabled={bloqueoFactura}
                        className="border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>

                {/* NIT y Nombre */}
                <div className="grid grid-cols-3 gap-4">
                    <input
                        type="text"
                        name="nit"
                        value={formatearNit(form.nit)}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        onKeyDown={handleGlobalNavigation}
                        disabled={bloqueoFactura}
                        className="border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="1234567-8"
                    />
                    <input
                        type="text"
                        name="nombre"
                        value={form.nombre}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        onKeyDown={handleGlobalNavigation}
                        disabled={bloqueoFactura}
                        className="col-span-2 border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Nombre"
                    />
                </div>

                {/* Bienes, Servicios y Exentas */}
                <div className="grid grid-cols-3 gap-4">
                    {["bienes", "servicios", "exentas"].map((campo) => (
                        <div key={campo}>
                            <label className="block text-gray-600 text-xs mb-1 capitalize">{campo} (Q)</label>
                            <input
                                type="number"
                                name={campo}
                                value={form[campo]}
                                onChange={handleChange}
                                onFocus={handleFocus}
                                onKeyDown={handleGlobalNavigation}
                                disabled={bloqueoFactura}
                                className="border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="0.00"
                            />
                        </div>
                    ))}
                </div>

                {/* Planilla Contable */}
                <div className="border-t pt-2 relative">
                    <h3 className="text-md font-semibold text-gray-700 mb-2">
                        Planilla Contable
                    </h3>

                    <div className="grid grid-cols-4 gap-2 mb-2 relative">
                        <div className="relative">
                            <input
                                type="text"
                                name="codigo"
                                placeholder="Código"
                                value={nuevaLinea.codigo}
                                onChange={(e) => handleCodigoChange(e.target.value)}
                                onFocus={() => {
                                    setBloqueoCabecera(true);
                                    setBloqueoFactura(true);
                                }}
                                onKeyDown={handleGlobalNavigation}
                                ref={codigoInputRef}
                                className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
                            />

                            {sugerenciasCodigos.length > 0 && (
                                <ul className="absolute bg-white border rounded shadow w-full mt-1 z-10 max-h-32 overflow-y-auto">
                                    {sugerenciasCodigos.map((item) => (
                                        <li
                                            key={item.codigo}
                                            onClick={() =>
                                                seleccionarSugerenciaCodigo(item.codigo, item.descripcion)
                                            }
                                            className="px-2 py-1 hover:bg-blue-100 cursor-pointer text-sm"
                                        >
                                            {item.codigo} - {item.descripcion}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <input
                            type="text"
                            name="descripcion"
                            placeholder="Descripción"
                            value={nuevaLinea.descripcion}
                            onChange={handleLineaChange}
                            onFocus={handleFocus}
                            onKeyDown={handleGlobalNavigation}
                            className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <input
                            type="number"
                            name="debe"
                            placeholder="Debe"
                            value={nuevaLinea.debe}
                            onChange={handleLineaChange}
                            onFocus={handleFocus}
                            onKeyDown={handleGlobalNavigation}
                            className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <input
                            type="number"
                            name="haber"
                            placeholder="Haber"
                            value={nuevaLinea.haber}
                            onChange={handleLineaChange}
                            onFocus={handleFocus}
                            onKeyDown={handleGlobalNavigation}
                            className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={agregarLinea}
                        className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition mb-2 text-sm"
                    >
                        Agregar registro
                    </button>

                    {lineas.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-xs rounded-lg overflow-hidden">
                                <thead className="bg-gray-100 text-gray-700">
                                <tr>
                                    <th className="p-2 border-b w-1/5 text-left">Código</th>
                                    <th className="p-2 border-b w-2/5 text-left">Descripción</th>
                                    <th className="p-2 border-b w-1/5 text-right">Debe</th>
                                    <th className="p-2 border-b w-1/5 text-right">Haber</th>
                                </tr>
                                </thead>
                                <tbody>
                                {lineas.map((linea) => (
                                    <tr key={linea.id} className="hover:bg-gray-50 transition">
                                        <td className="p-2 border-b">{linea.codigo}</td>
                                        <td className="p-2 border-b">{linea.descripcion}</td>
                                        <td className="p-2 border-b text-right">
                                            Q{linea.debe.toFixed(2)}
                                        </td>
                                        <td className="p-2 border-b text-right">
                                            Q{linea.haber.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="mt-2 bg-gray-50 p-2 rounded-lg grid grid-cols-3 gap-2 text-center border">
                        <div>
                            <p className="text-xs text-gray-600">Total Debe</p>
                            <p className="text-lg font-bold">Q{totalDebe.toFixed(2)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600">Total Haber</p>
                            <p className="text-lg font-bold">Q{totalHaber.toFixed(2)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600">Diferencia</p>
                            <p
                                className={`text-lg font-bold ${
                                    diferencia === "0.00" ? "text-green-600" : "text-red-600"
                                }`}
                            >
                                {diferencia}
                            </p>
                        </div>
                    </div>

                    <div className="text-center mt-4">
                        <button
                            ref={botonAgregarRef}
                            onClick={limpiarParaNuevoDocumento}
                            disabled={!documentoGuardado}
                            className={`px-4 py-2 rounded-lg text-sm transition ${
                                documentoGuardado
                                    ? "bg-blue-700 text-white hover:bg-blue-800"
                                    : "bg-gray-400 text-gray-200 cursor-not-allowed"
                            }`}
                        >
                            Agregar documento
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
