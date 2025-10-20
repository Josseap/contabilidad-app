import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Contabilidad from "./pages/Contabilidad";
import IVA from "./pages/IVA";
import Bancos from "./pages/Bancos";
import Planilla from "./pages/Planilla";

function Dashboard() {
    return <div className="text-gray-900">Dashboard OK</div>;
}

export default function Router() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<App />}>
                    <Route index element={<Dashboard />} />
                    <Route path="contabilidad" element={<Contabilidad />} />
                    <Route path="iva" element={<IVA />} />
                    <Route path="bancos" element={<Bancos />} />
                    <Route path="planillas" element={<Planilla />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
