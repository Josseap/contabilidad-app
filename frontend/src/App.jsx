// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Contabilidad from "./pages/Contabilidad";
import IVA from "./pages/IVA";
import Bancos from "./pages/Bancos";
import Planilla from "./pages/Planilla";

export default function App() {
    return (
        <Router>
            <div className="flex h-screen bg-gray-100">
                {/* Sidebar */}
                <aside className="w-64 bg-white shadow-md p-6 flex flex-col">
                    <h1 className="text-2xl font-bold text-blue-600 mb-10">Contabilidad App</h1>
                    <nav className="flex flex-col space-y-4 text-gray-700 font-medium">
                        <Link to="/" className="hover:text-blue-600"> Contabilidad</Link>
                        <Link to="/iva" className="hover:text-blue-600"> IVA</Link>
                        <Link to="/bancos" className="hover:text-blue-600"> Bancos</Link>
                        <Link to="/planilla" className="hover:text-blue-600"> Planilla</Link>
                    </nav>
                </aside>

                {/* Main content */}
                <main className="flex-1 p-10">
                    <Routes>
                        <Route path="/" element={<Contabilidad />} />
                        <Route path="/iva" element={<IVA />} />
                        <Route path="/bancos" element={<Bancos />} />
                        <Route path="/planilla" element={<Planilla />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}
