import { LayoutDashboard, Package, ArrowLeftRight, Warehouse, BarChart3, Users, LogOut, ChevronRight, X } from "lucide-react";
import s from "../styles/Sidebar.module.css";

type Page =
  | "login" | "dashboard" | "productos" | "nuevo-producto"
  | "movimientos" | "stock" | "reportes" | "usuarios" | "nuevo-usuario";

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  userRole: "admin" | "empleado";
  usuarioNombre: string;
  usuarioRol: string;
  onClose?: () => void;
  onLogout: () => void;
}

const navItems = [
  { id: "dashboard",   label: "Dashboard",            icon: LayoutDashboard },
  { id: "productos",   label: "Gestión de Productos", icon: Package },
  { id: "movimientos", label: "Movimientos",           icon: ArrowLeftRight },
  { id: "stock",       label: "Stock Actual",          icon: Warehouse },
  { id: "reportes",    label: "Reportes",              icon: BarChart3 },
];

export default function Sidebar({
  currentPage,
  onNavigate,
  userRole,
  usuarioNombre,
  usuarioRol,
  onClose,
  onLogout,
}: SidebarProps) {
  const activePage =
    currentPage === "nuevo-producto" ? "productos"
    : currentPage === "nuevo-usuario" ? "usuarios"
    : currentPage;

  const linkClass = (id: string) =>
    [s.navLink, activePage === id ? s.navLinkActive : ""].filter(Boolean).join(" ");

  return (
    <aside className={s.sidebar}>
      {/* Logo */}
      <div className={s.logoArea}>
        <div className={s.logoInner}>
          <div className={s.logoImgBox}>
            <img src="/src/imports/logobrasas.png" alt="Brasas del Centro" className={s.logoImg} />
          </div>
          <span className={s.logoLabel}>Sistema de Inventario</span>
        </div>
        {onClose && (
          <button className={s.closeBtn} onClick={onClose}>
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className={s.nav}>
        {navItems.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => onNavigate(id as Page)} className={linkClass(id)}>
            <Icon size={18} className={activePage === id ? s.navIconActive : s.navIcon} />
            <span className={s.navLabel}>{label}</span>
            {activePage === id && <ChevronRight size={14} className={s.navChevron} />}
          </button>
        ))}

        {userRole === "admin" && (
          <button onClick={() => onNavigate("usuarios")} className={linkClass("usuarios")}>
            <Users size={18} className={activePage === "usuarios" ? s.navIconActive : s.navIcon} />
            <span className={s.navLabel}>Usuarios</span>
            {activePage === "usuarios" && <ChevronRight size={14} className={s.navChevron} />}
          </button>
        )}
      </nav>

      {/* User + logout */}
      <div className={s.userArea}>
        <div className={s.userRow}>
          <div className={s.userAvatar}>
            {usuarioNombre?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="min-w-0">
            <p className={s.userName}>{usuarioNombre}</p>
            <p className={s.userEmail}>{usuarioRol}</p>
          </div>
        </div>
        <button className={s.logoutBtn} onClick={onLogout}>
          <LogOut size={18} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}