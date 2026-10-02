import { useEffect, useState } from "react";
import { Plus, Search, Edit2, Trash2, Shield, User } from "lucide-react";
import c from "../styles/common.module.css";
import { usuarioService, type Usuario as UsuarioType } from "../api/usuarioService";

interface Props { onNuevoUsuario: (usuario?: UsuarioType) => void; }

export default function Usuarios({ onNuevoUsuario }: Props) {
  const [usuarios, setUsuarios] = useState<UsuarioType[]>([]);
  const [cargando, setCargando] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const cargar = async () => {
    try {
      setCargando(true);
      const data = await usuarioService.listar();
      setUsuarios(data);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const filtered = usuarios.filter((u) => {
    const nombreCompleto = `${u.nombres} ${u.apellidos}`.toLowerCase();
    return (
      nombreCompleto.includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.nombreUsuario.toLowerCase().includes(search.toLowerCase())
    );
  });

  const eliminar = async () => {
    if (deleteId === null) return;
    try {
      await usuarioService.eliminar(deleteId);
      setDeleteId(null);
      cargar();
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("No se pudo desactivar el usuario");
    }
  };

  const usuarioAEliminar = usuarios.find((u) => u.idUsuario === deleteId);

  return (
    <div className={c.pageWrapper}>
      <div className={c.pageHeaderRow}>
        <div>
          <h1 className={c.pageTitle}>Gestión de Usuarios</h1>
          <p className={c.pageSubtitle}>{usuarios.length} usuarios registrados</p>
        </div>
        <button className={c.primaryBtn} onClick={() => onNuevoUsuario()}>
          <Plus size={16} /> Nuevo Usuario
        </button>
      </div>

      <div className="relative max-w-sm mb-5 w-full">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Buscar usuario..." value={search} onChange={(e) => setSearch(e.target.value)}
          className={c.inputField} style={{ paddingLeft: "2.5rem" }} />
      </div>

      <div className={c.tableCard}>
        <div className={c.tableScroll}>
          <table className={c.table} style={{ minWidth: "560px" }}>
            <thead className={c.thead}>
              <tr>
                {["Usuario", "Email", "Rol", "Estado", "Registro", "Acciones"].map((h) => (
                  <th key={h} className={c.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr><td colSpan={6} className={c.td} style={{ textAlign: "center", color: "#9ca3af", padding: "2rem" }}>Cargando usuarios...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className={c.td} style={{ textAlign: "center", color: "#9ca3af", padding: "2rem" }}>No hay usuarios</td></tr>
              ) : (
                filtered.map((u, i) => {
                  const esAdmin = u.nombreRol === "Administrador";
                  const nombreCompleto = `${u.nombres} ${u.apellidos}`;
                  return (
                    <tr key={u.idUsuario} className={[c.tr, i > 0 ? c.trBorder : ""].join(" ")}>
                      <td className={c.td}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                            style={{ background: esAdmin ? "#c1381a" : "#6b7280" }}>
                            {u.nombres.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-800 truncate">{nombreCompleto}</p>
                            <p className="text-xs text-gray-400">@{u.nombreUsuario}</p>
                          </div>
                        </div>
                      </td>
                      <td className={c.td}><span className="text-xs text-gray-600">{u.email || "-"}</span></td>
                      <td className={c.td}>
                        <span className={`${c.badge} ${esAdmin ? c.badgeRed : c.badgeMuted}`}>
                          {esAdmin ? <Shield size={10} /> : <User size={10} />} {u.nombreRol}
                        </span>
                      </td>
                      <td className={c.td}>
                        <span className={`${c.badge} ${u.activo ? c.badgeGreen : c.badgeMuted}`}>
                          {u.activo ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className={c.td}>
                        <span className="text-xs text-gray-400">
                          {new Date(u.fechaCreacion).toLocaleDateString("es-PE")}
                        </span>
                      </td>
                      <td className={c.td}>
                        <div className="flex items-center gap-2">
                          <button className={`${c.iconBtn} ${c.iconBtnEdit}`} onClick={() => onNuevoUsuario(u)}>
                            <Edit2 size={14} className="text-blue-500" />
                          </button>
                          <button className={`${c.iconBtn} ${c.iconBtnTrash}`} onClick={() => setDeleteId(u.idUsuario)}>
                            <Trash2 size={14} className="text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {deleteId !== null && (
        <div className={c.modalOverlay}>
          <div className={c.modalCard}>
            <div className={c.modalBody}>
              <div style={{ width: "3rem", height: "3rem", borderRadius: "1rem", background: "#fdf2ec", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                <Trash2 size={20} style={{ color: "#c1381a" }} />
              </div>
              <h3 className={c.modalTitle} style={{ marginBottom: "0.25rem" }}>¿Desactivar usuario?</h3>
              <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "1.5rem" }}>
                El usuario <strong style={{ color: "#374151" }}>{usuarioAEliminar?.nombres} {usuarioAEliminar?.apellidos}</strong> perderá acceso al sistema.
              </p>
              <div className={c.modalFooter} style={{ padding: 0 }}>
                <button className={c.secondaryBtn} style={{ flex: 1 }} onClick={() => setDeleteId(null)}>Cancelar</button>
                <button className={c.primaryBtn} style={{ flex: 1 }} onClick={eliminar}>Desactivar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}