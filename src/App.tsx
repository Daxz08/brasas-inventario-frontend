import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Productos from "./pages/Productos";
import NuevoProducto from "./pages/NuevoProducto";
import Movimientos from "./pages/Movimientos";
import Stock from "./pages/Stock";
import Reportes from "./pages/Reportes";
import Usuarios from "./pages/Usuarios";
import NuevoUsuario from "./pages/NuevoUsuario";
import { authService, type Usuario } from "./api/authService";
import { type Producto } from "./api/productoService";

type Page =
  | "login" | "dashboard" | "productos" | "nuevo-producto"
  | "movimientos" | "stock" | "reportes" | "usuarios" | "nuevo-usuario";

const pageLabel: Record<string, string> = {
  dashboard: "Dashboard",
  productos: "Gestión de Productos",
  "nuevo-producto": "Gestión de Productos / Nuevo Producto",
  movimientos: "Movimientos",
  stock: "Stock Actual",
  reportes: "Reportes",
  usuarios: "Gestión de Usuarios",
  "nuevo-usuario": "Usuarios / Nuevo Usuario",
};

export default function App() {
  const [page, setPage] = useState<Page>("login");
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [productoEditar, setProductoEditar] = useState<Producto | null>(null);

  useEffect(() => {
    const userGuardado = authService.getUsuarioActual();
    if (userGuardado && authService.estaAutenticado()) {
      setUsuario(userGuardado);
      setPage("dashboard");
    }
  }, []);

  const navigate = (p: Page) => {
    setPage(p);
    setSidebarOpen(false);
  };

  const handleLogin = (u: Usuario) => {
    setUsuario(u);
    setPage("dashboard");
  };

  const handleLogout = () => {
    authService.logout();
  };

  if (page === "login" || !usuario) return <Login onLogin={handleLogin} />;

  const esAdmin = usuario.rol === "Administrador";

  return (
    <div className="flex min-h-screen" style={{ background: "#f7f4f1" }}>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`fixed lg:static inset-y-0 left-0 z-40 transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <Sidebar
          currentPage={page}
          onNavigate={(p) => navigate(p as Page)}
          userRole={esAdmin ? "admin" : "empleado"}
          usuarioNombre={`${usuario.nombres} ${usuario.apellidos}`}
          usuarioRol={usuario.rol}
          onClose={() => setSidebarOpen(false)}
          onLogout={handleLogout}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex items-center justify-between px-4 md:px-8 py-3 md:py-4 bg-white border-b flex-shrink-0" style={{ borderColor: "#e8e0d8" }}>
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} className="text-gray-600" />
            </button>
            <div className="flex items-center gap-1.5 text-sm text-gray-500 min-w-0">
              <span className="hidden sm:inline">Brasas del Centro</span>
              <span className="hidden sm:inline text-gray-300">/</span>
              <span className="font-medium text-gray-800 truncate">{pageLabel[page] ?? page}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-gray-700">
                {usuario.nombres} {usuario.apellidos}
              </p>
              <p className="text-xs text-gray-400">{usuario.rol}</p>
            </div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: "#c1381a" }}>
              {usuario.nombres?.charAt(0).toUpperCase() || "U"}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {page === "dashboard" && <Dashboard onNavigate={(p) => navigate(p)} />}
          {page === "productos" && (
            <Productos
              onNuevoProducto={(p) => {
                setProductoEditar(p ?? null);
                navigate("nuevo-producto");
              }}
            />
          )}
          {page === "nuevo-producto" && (
            <NuevoProducto
              onBack={() => {
                setProductoEditar(null);
                navigate("productos");
              }}
              producto={productoEditar}
            />
          )}
          {page === "movimientos" && <Movimientos />}
          {page === "stock" && <Stock />}
          {page === "reportes" && <Reportes />}
          {page === "usuarios" && <Usuarios onNuevoUsuario={() => navigate("nuevo-usuario")} />}
          {page === "nuevo-usuario" && <NuevoUsuario onBack={() => navigate("usuarios")} />}
        </div>
      </div>
    </div>
  );
}