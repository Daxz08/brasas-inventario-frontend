import { useEffect, useState } from "react";
import { Search, Plus, Edit2, Trash2, Filter, ChevronDown } from "lucide-react";
import c from "../styles/common.module.css";
import { productoService, type Producto } from "../api/productoService";

interface Props { onNuevoProducto: (producto?: Producto) => void; }

export default function Productos({ onNuevoProducto }: Props) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState("Todas");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const cargarProductos = async () => {
    try {
      setCargando(true);
      const data = await productoService.listar();
      setProductos(data);
    } catch (error) {
      console.error("Error al cargar productos:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const categorias = ["Todas", ...Array.from(new Set(productos.map((p) => p.nombreCategoria)))];

  const filtered = productos.filter((p) => {
    const matchSearch =
      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      p.codigoSku.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoria === "Todas" || p.nombreCategoria === categoria;
    return matchSearch && matchCat;
  });

  const eliminar = async () => {
    if (deleteId === null) return;
    try {
      await productoService.eliminar(deleteId);
      setDeleteId(null);
      cargarProductos();
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("No se pudo eliminar el producto");
    }
  };

  const productoAEliminar = productos.find((p) => p.idProducto === deleteId);

  return (
    <div className={c.pageWrapper}>
      <div className={c.pageHeaderRow}>
        <div>
          <h1 className={c.pageTitle}>Gestión de Productos</h1>
          <p className={c.pageSubtitle}>{productos.length} productos registrados</p>
        </div>
        <button className={c.primaryBtn} onClick={() => onNuevoProducto()}>
          <Plus size={16} /> Nuevo Producto
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5">
        <div className="relative flex-1 sm:max-w-sm">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={c.inputField}
            style={{ paddingLeft: "2.5rem" }}
          />
        </div>
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className={c.selectField}
            style={{ paddingLeft: "2rem" }}
          >
            {categorias.map((cat) => <option key={cat}>{cat}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <span className="text-sm text-gray-500 self-center">{filtered.length} resultados</span>
      </div>

      <div className={c.tableCard}>
        <div className={c.tableScroll}>
          <table className={c.table} style={{ minWidth: "700px" }}>
            <thead className={c.thead}>
              <tr>
                {["Código", "Producto", "Categoría", "Unidad", "Stock", "Mínimo", "Precio Unit.", "Estado", "Acciones"].map((h) => (
                  <th key={h} className={c.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan={9} className={c.td} style={{ textAlign: "center", color: "#9ca3af", padding: "2rem" }}>
                    Cargando productos...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className={c.td} style={{ textAlign: "center", color: "#9ca3af", padding: "2rem" }}>
                    No hay productos que coincidan con los filtros
                  </td>
                </tr>
              ) : (
                filtered.map((p, i) => {
                  const stockBajo = Number(p.stockActual) < Number(p.stockMinimo);
                  return (
                    <tr key={p.idProducto} className={[c.tr, i > 0 ? c.trBorder : ""].join(" ")}>
                      <td className={c.td}>
                        <span className="font-mono text-xs text-gray-400">{p.codigoSku}</span>
                      </td>
                      <td className={c.td}>
                        <span className="font-medium text-gray-800">{p.nombre}</span>
                      </td>
                      <td className={c.td}>
                        <span className={`${c.badge} ${c.badgeGray}`}>{p.nombreCategoria}</span>
                      </td>
                      <td className={c.td}><span className="text-gray-600">{p.unidadMedida}</span></td>
                      <td className={c.td}>
                        <span className={`font-semibold ${stockBajo ? "text-red-600" : "text-gray-800"}`}>
                          {p.stockActual}
                        </span>
                      </td>
                      <td className={c.td}><span className="text-gray-500">{p.stockMinimo}</span></td>
                      <td className={c.td}>
                        <span className="text-gray-700">S/ {Number(p.precioUnitario).toFixed(2)}</span>
                      </td>
                      <td className={c.td}>
                        <span className={`${c.badge} ${p.activo ? c.badgeGreen : c.badgeMuted}`}>
                          {p.activo ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className={c.td}>
                        <div className="flex items-center gap-2">
                          <button
                            className={`${c.iconBtn} ${c.iconBtnEdit}`}
                            onClick={() => onNuevoProducto(p)}
                          >
                            <Edit2 size={14} className="text-blue-500" />
                          </button>
                          <button
                            className={`${c.iconBtn} ${c.iconBtnTrash}`}
                            onClick={() => setDeleteId(p.idProducto)}
                          >
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
        <div className={c.tableFooter}>
          <span className="text-xs text-gray-500">
            Mostrando {filtered.length} de {productos.length}
          </span>
        </div>
      </div>

      {deleteId !== null && (
        <div className={c.modalOverlay}>
          <div className={c.modalCard}>
            <div className={c.modalBody}>
              <div style={{ width: "3rem", height: "3rem", borderRadius: "1rem", background: "#fdf2ec", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                <Trash2 size={20} style={{ color: "#c1381a" }} />
              </div>
              <h3 className={c.modalTitle} style={{ marginBottom: "0.25rem" }}>¿Eliminar producto?</h3>
              <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "1.5rem" }}>
                El producto <strong style={{ color: "#374151" }}>{productoAEliminar?.nombre}</strong> será desactivado.
              </p>
              <div className={c.modalFooter} style={{ padding: 0 }}>
                <button className={c.secondaryBtn} style={{ flex: 1 }} onClick={() => setDeleteId(null)}>
                  Cancelar
                </button>
                <button className={c.primaryBtn} style={{ flex: 1 }} onClick={eliminar}>
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}