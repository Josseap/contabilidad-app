// Layout sin BrowserRouter ni Routes
import { NavLink, Outlet } from "react-router-dom";

export default function App() {
    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-md p-6 flex flex-col">
                <h1 className="text-2xl font-bold text-blue-600 mb-10">Contabilidad App</h1>
                <nav className="flex flex-col space-y-4 text-gray-700 font-medium">
                    <NavLink to="/" end className="hover:text-blue-600">Dashboard</NavLink>
                    <NavLink to="/contabilidad" className="hover:text-blue-600">Contabilidad</NavLink>
                    <NavLink to="/iva" className="hover:text-blue-600">IVA</NavLink>
                    <NavLink to="/bancos" className="hover:text-blue-600">Bancos</NavLink>
                    <NavLink to="/planillas" className="hover:text-blue-600">Planillas</NavLink>
                </nav>
            </aside>

            {/* Main */}
            <main className="flex-1 p-10">
                <Outlet />
            </main>
        </div>
    );
}
