import { useEffect, useState } from "react";
import { Plus, Search, ArrowUpCircle, ArrowDownCircle, RefreshCw, AlertTriangle, CheckCircle, X } from "lucide-react";
import c from "../styles/common.module.css";
import s from "../styles/Movimientos.module.css";
import { movimientoService, type Movimiento } from "../api/movimientoService";
import { productoService, type Producto } from "../api/productoService";
import { proveedorService, type Proveedor } from "../api/proveedorService";

const typeIcon = (t: string) => {
  if (t === "ENTRADA") return <ArrowUpCircle size={13} className="text-green-500" />;
  if (t === "SALIDA") return <ArrowDownCircle size={13} className="text-red-500" />;
  if (t === "MERMA") return <AlertTriangle size={13} className="text-orange-500" />;
  return <RefreshCw size={13} className="text-blue-500" />;
};

const tipoBadge: Record<string, string> = {
  ENTRADA: c.badgeGreen,
  SALIDA:  c.badgeRed,
  MERMA:   c.badgeRed,
  AJUSTE:  c.badgeBlue,
};

const tipoLabel: Record<string, string> = {
  ENTRADA: "Entrada",
  SALIDA:  "Salida",
  MERMA:   "Merma",
  AJUSTE:  "Ajuste",
};

const tipoFormCls: Record<string, string> = {
  ENTRADA: s.typeBtnEntrada,
  SALIDA:  s.typeBtnSalida,
  AJUSTE:  s.typeBtnAjuste,
};

const tipoFiltros = ["Todos", "ENTRADA", "SALIDA", "MERMA", "AJUSTE"];

export default function Movimientos() {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [cargando, setCargando] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [tipoFiltro, setTipoFiltro] = useState("Todos");
  const [tipoForm, setTipoForm] = useState<"ENTRADA" | "SALIDA" | "MERMA" | "AJUSTE">("ENTRADA");
  const [search, setSearch] = useState("");

  // Form state
  const [productoId, setProductoId] = useState<number | "">("");
  const [cantidad, setCantidad] = useState("");
  const [proveedorId, setProveedorId] = useState<number | "">("");
  const [observacion, setObservacion] = useState("");
  const [enviando, setEnviando] = useState(false);

  const cargarTodo = async () => {
    try {
      setCargando(true);
      const [movs, prods, provs] = await Promise.all([
        movimientoService.listar(),
        productoService.listar(),
        proveedorService.listar(),
      ]);
      setMovimientos(movs);
      setProductos(prods);
      setProveedores(provs);
    } catch (error) {
      console.error("Error al cargar movimientos:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarTodo(); }, []);

  const resetForm = () => {
    setProductoId("");
    setCantidad("");
    setProveedorId("");
    setObservacion("");
    setTipoForm("ENTRADA");
  };

  const handleRegistrar = async () => {
    if (productoId === "" || !cantidad) {
      alert("Selecciona un producto e ingresa la cantidad");
      return;
    }
    if (tipoForm === "ENTRADA" && proveedorId === "") {
      alert("Selecciona un proveedor para la entrada");
      return;
    }
    if ((tipoForm === "MERMA" || tipoForm === "AJUSTE") && !observacion.trim()) {
      alert("El motivo es obligatorio para mermas y ajustes");
      return;
    }

    try {
      setEnviando(true);
      await movimientoService.registrar({
        tipoMovimiento: tipoForm,
        observacion: observacion || undefined,
        idProveedor: tipoForm === "ENTRADA" ? Number(proveedorId) : undefined,
        detalles: [{
          idProducto: Number(productoId),
          cantidad: Number(cantidad),
        }],
      });

      setShowModal(false);
      resetForm();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      cargarTodo();
    } catch (error: any) {
      const msg = error?.response?.data?.mensaje || "Error al registrar el movimiento";
      alert(msg);
    } finally {
      setEnviando(false);
    }
  };

  // Aplanar movimientos: una fila por detalle
  const filas = movimientos.flatMap((m) =>
    m.detalles.map((d) => ({
      idMovimiento: m.idMovimiento,
      tipo: m.tipoMovimiento,
      fecha: m.fechaMovimiento,
      motivo: m.observacion,
      usuario: m.nombreUsuario,
      producto: d.nombreProducto,
      cantidad: d.cantidad,
    }))
  );

  const filtered = filas
    .filter((m) => tipoFiltro === "Todos" || m.tipo === tipoFiltro)
    .filter((m) => m.producto.toLowerCase().includes(search.toLowerCase()));

  const fmtFecha = (iso: string) => new Date(iso).toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });
  const fmtHora = (iso: string) => new Date(iso).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className={c.pageWrapper}>
      <div className={c.pageHeaderRow}>
        <div>
          <h1 className={c.pageTitle}>Movimientos</h1>
          <p className={c.pageSubtitle}>Registro de entradas, salidas, mermas y ajustes</p>
        </div>
        <button className={c.primaryBtn} onClick={() => setShowModal(true)}>
          <Plus size={16} /> Registrar Movimiento
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5">
        <div className="flex items-center gap-2 flex-wrap">
          {tipoFiltros.map((t) => (
            <button key={t} onClick={() => setTipoFiltro(t)}
              className={t === tipoFiltro ? c.primaryBtn : c.secondaryBtn}
              style={{ padding: "0.5rem 1rem" }}>
              {t === "Todos" ? "Todos" : tipoLabel[t]}
            </button>
          ))}
        </div>
        <div className="relative sm:ml-auto sm:max-w-xs w-full">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Buscar movimiento..." value={search} onChange={(e) => setSearch(e.target.value)}
            className={c.inputField} style={{ paddingLeft: "2.25rem" }} />
        </div>
      </div>

      <div className={c.tableCard}>
        <div className={c.tableScroll}>
          <table className={c.table} style={{ minWidth: "640px" }}>
            <thead className={c.thead}>
              <tr>
                {["ID", "Producto", "Tipo", "Cantidad", "Motivo", "Usuario", "Fecha", "Hora"].map((h) => (
                  <th key={h} className={c.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr><td colSpan={8} className={c.td} style={{ textAlign: "center", color: "#9ca3af", padding: "2rem" }}>Cargando movimientos...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className={c.td} style={{ textAlign: "center", color: "#9ca3af", padding: "2rem" }}>No hay movimientos</td></tr>
              ) : (
                filtered.map((m, i) => (
                  <tr key={`${m.idMovimiento}-${i}`} className={[c.tr, i > 0 ? c.trBorder : ""].join(" ")}>
                    <td className={c.td}><span className="font-mono text-xs text-gray-400">MOV-{String(m.idMovimiento).padStart(3, "0")}</span></td>
                    <td className={c.td}><span className="font-medium text-gray-800">{m.producto}</span></td>
                    <td className={c.td}>
                      <span className={`${c.badge} ${tipoBadge[m.tipo]}`} style={{ gap: "0.25rem" }}>
                        {typeIcon(m.tipo)} {tipoLabel[m.tipo]}
                      </span>
                    </td>
                    <td className={c.td}><span className="font-medium text-gray-800">{m.cantidad}</span></td>
                    <td className={c.td}><span className="text-xs text-gray-500">{m.motivo || "-"}</span></td>
                    <td className={c.td}><span className="text-xs text-gray-600">{m.usuario}</span></td>
                    <td className={c.td}><span className="text-xs text-gray-500">{fmtFecha(m.fecha)}</span></td>
                    <td className={c.td}><span className="font-mono text-xs text-gray-400">{fmtHora(m.fecha)}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className={c.tableFooter}>
          <span className="text-xs text-gray-500">{filtered.length} movimientos</span>
        </div>
      </div>

      {showModal && (
        <div className={c.modalOverlay}>
          <div className={`${c.modalCard} ${c.modalCardLg}`}>
            <div className={c.modalHeader} style={{ position: "sticky", top: 0, background: "#fff", borderRadius: "1rem 1rem 0 0" }}>
              <span className={c.modalTitle}>Registrar Movimiento</span>
              <button className={c.modalCloseBtn} onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>
            <div className={c.modalBody}>
              <div className="space-y-4">
                <div>
                  <label className={c.fieldLabel}>Tipo de movimiento</label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {(["ENTRADA", "SALIDA", "MERMA", "AJUSTE"] as const).map((t) => (
                      <button key={t} onClick={() => setTipoForm(t)}
                        className={`${s.typeBtn} ${tipoForm === t ? tipoFormCls[t] : ""}`}>
                        {tipoLabel[t]}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={c.fieldLabel}>Producto *</label>
                  <select
                    className={c.selectField}
                    value={productoId}
                    onChange={(e) => setProductoId(e.target.value === "" ? "" : Number(e.target.value))}
                  >
                    <option value="">Seleccionar producto</option>
                    {productos.map((p) => (
                      <option key={p.idProducto} value={p.idProducto}>
                        {p.nombre} ({p.unidadMedida}) — Stock: {p.stockActual}
                      </option>
                    ))}
                  </select>
                </div>

                {tipoForm === "ENTRADA" && (
                  <div>
                    <label className={c.fieldLabel}>Proveedor *</label>
                    <select
                      className={c.selectField}
                      value={proveedorId}
                      onChange={(e) => setProveedorId(e.target.value === "" ? "" : Number(e.target.value))}
                    >
                      <option value="">Seleccionar proveedor</option>
                      {proveedores.map((p) => (
                        <option key={p.idProveedor} value={p.idProveedor}>{p.razonSocial}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={c.fieldLabel}>Cantidad *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0"
                      className={c.inputField}
                      value={cantidad}
                      onChange={(e) => setCantidad(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={c.fieldLabel}>Fecha</label>
                    <input
                      type="date"
                      defaultValue={new Date().toISOString().split("T")[0]}
                      className={c.inputField}
                      disabled
                    />
                  </div>
                </div>

                <div>
                  <label className={c.fieldLabel}>
                    Motivo / Observación {(tipoForm === "MERMA" || tipoForm === "AJUSTE") && "*"}
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Describe el motivo..."
                    className={c.inputField + " resize-none"}
                    value={observacion}
                    onChange={(e) => setObservacion(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className={c.modalFooter}>
              <button className={c.secondaryBtn} style={{ flex: 1 }} onClick={() => { setShowModal(false); resetForm(); }} disabled={enviando}>Cancelar</button>
              <button className={c.primaryBtn} style={{ flex: 1, opacity: enviando ? 0.7 : 1 }} onClick={handleRegistrar} disabled={enviando}>
                {enviando ? "Registrando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className={c.toast}><CheckCircle size={18} /> Movimiento registrado exitosamente</div>
      )}
    </div>
  );
}