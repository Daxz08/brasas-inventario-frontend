import { useEffect, useState } from "react";
import { FileDown, X, CheckCircle, FileSpreadsheet, ChevronDown } from "lucide-react";
import c from "../styles/common.module.css";
import s from "../styles/Reportes.module.css";
import { movimientoService, type Movimiento } from "../api/movimientoService";
import { reporteService, descargarArchivo } from "../api/reporteService";

type ExportFormat = "pdf" | "excel";

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

const tipoTabs = [
  { value: "Todos",   label: "Todos" },
  { value: "ENTRADA", label: "Entrada" },
  { value: "SALIDA",  label: "Salida" },
  { value: "MERMA",   label: "Merma" },
  { value: "AJUSTE",  label: "Ajuste" },
];

export default function Reportes() {
  const hoy = new Date();
  const haceUnMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

  const [desde, setDesde] = useState(haceUnMes.toISOString().split("T")[0]);
  const [hasta, setHasta] = useState(hoy.toISOString().split("T")[0]);
  const [tipoMov, setTipoMov] = useState("Todos");
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [cargando, setCargando] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [exportFmt, setExportFmt] = useState<ExportFormat>("pdf");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [exportando, setExportando] = useState(false);

  const cargar = async () => {
    try {
      setCargando(true);
      const data = await movimientoService.listar({ desde, hasta });
      setMovimientos(data);
    } catch (error) {
      console.error("Error al cargar movimientos:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, [desde, hasta]);

  // Aplanar movimientos por detalle
  const filas = movimientos.flatMap((m) =>
    m.detalles.map((d) => ({
      fecha: new Date(m.fechaMovimiento).toLocaleDateString("es-PE"),
      producto: d.nombreProducto,
      codigoSku: d.codigoSku,
      tipo: m.tipoMovimiento,
      cantidad: d.cantidad,
      precio: Number(d.precioCosto),
      total: Number(d.cantidad) * Number(d.precioCosto),
      usuario: m.nombreUsuario,
    }))
  );

  const filtered = filas.filter((f) => tipoMov === "Todos" || f.tipo === tipoMov);
  const totalPeriodo = filtered.reduce((sum, f) => sum + f.total, 0);

  const handleExport = (fmt: ExportFormat) => {
    setExportFmt(fmt);
    setShowModal(true);
  };

  const confirmExport = async () => {
    try {
      setExportando(true);
      const blob = exportFmt === "pdf"
        ? await reporteService.descargarMovimientosPdf(desde, hasta)
        : await reporteService.descargarMovimientosExcel(desde, hasta);

      const nombre = exportFmt === "pdf"
        ? `reporte-movimientos-${desde}_${hasta}.pdf`
        : `reporte-movimientos-${desde}_${hasta}.xlsx`;

      descargarArchivo(blob, nombre);

      setShowModal(false);
      setSuccessMsg(`Reporte exportado como ${exportFmt === "pdf" ? "PDF" : "Excel"} exitosamente`);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error al exportar:", error);
      alert("No se pudo generar el reporte");
    } finally {
      setExportando(false);
    }
  };

  return (
    <div className={c.pageWrapper}>
      <div className={c.pageHeaderRow}>
        <div>
          <h1 className={c.pageTitle}>Reportes</h1>
          <p className={c.pageSubtitle}>Genera y exporta reportes del inventario</p>
        </div>
        <div className={c.btnRow}>
          <button className={c.greenBtn} onClick={() => handleExport("excel")}>
            <FileSpreadsheet size={15} />
            <span className="hidden sm:inline">Exportar</span> Excel
          </button>
          <button className={c.primaryBtn} onClick={() => handleExport("pdf")}>
            <FileDown size={15} />
            <span className="hidden sm:inline">Exportar</span> PDF
          </button>
        </div>
      </div>

      <div className={s.filtersCard}>
        <div className={s.filtersGrid}>
          <div>
            <label className={c.fieldLabel}>Tipo de reporte</label>
            <div className="relative">
              <select className={c.selectField} disabled>
                <option>Movimientos</option>
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className={c.fieldLabel}>Fecha inicio</label>
            <input type="date" className={c.inputField} value={desde} onChange={(e) => setDesde(e.target.value)} />
          </div>
          <div>
            <label className={c.fieldLabel}>Fecha fin</label>
            <input type="date" className={c.inputField} value={hasta} onChange={(e) => setHasta(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap mb-4">
        {tipoTabs.map((t) => (
          <button key={t.value} onClick={() => setTipoMov(t.value)}
            className={t.value === tipoMov ? c.primaryBtn : c.secondaryBtn}
            style={{ padding: "0.5rem 1rem" }}>
            {t.label}
          </button>
        ))}
      </div>

      <div className={c.tableCard}>
        <div className="flex items-center justify-between px-4 md:px-6 py-4" style={{ borderBottom: "1px solid #f0ebe4" }}>
          <h3 className="font-semibold text-gray-800 text-sm md:text-base" style={{ fontFamily: "Poppins, sans-serif" }}>
            Detalle de Movimientos — {desde} al {hasta}
          </h3>
          <span className="text-xs text-gray-400">{filtered.length} registros</span>
        </div>
        <div className={c.tableScroll}>
          <table className={c.table} style={{ minWidth: "640px" }}>
            <thead className={c.thead}>
              <tr>
                {["Fecha", "Producto", "Código", "Tipo", "Cantidad", "Precio Unit.", "Total (S/)", "Usuario"].map((h) => (
                  <th key={h} className={c.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr><td colSpan={8} className={c.td} style={{ textAlign: "center", color: "#9ca3af", padding: "2rem" }}>Cargando...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className={c.td} style={{ textAlign: "center", color: "#9ca3af", padding: "2rem" }}>No hay movimientos en el rango seleccionado</td></tr>
              ) : (
                filtered.map((m, i) => (
                  <tr key={i} className={[c.tr, i > 0 ? c.trBorder : ""].join(" ")}>
                    <td className={c.td}><span className="text-xs text-gray-500">{m.fecha}</span></td>
                    <td className={c.td}><span className="font-medium text-gray-800">{m.producto}</span></td>
                    <td className={c.td}><span className="font-mono text-xs text-gray-400">{m.codigoSku}</span></td>
                    <td className={c.td}><span className={`${c.badge} ${tipoBadge[m.tipo]}`}>{tipoLabel[m.tipo]}</span></td>
                    <td className={c.td}><span className="text-gray-700">{m.cantidad}</span></td>
                    <td className={c.td}><span className="text-gray-600">S/ {m.precio.toFixed(2)}</span></td>
                    <td className={c.td}><span className="font-semibold text-gray-800">S/ {m.total.toFixed(2)}</span></td>
                    <td className={c.td}><span className="text-xs text-gray-500">{m.usuario}</span></td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className={c.tfoot}>
                <td colSpan={6} className={c.td}><span className="font-bold text-gray-700">Total del período</span></td>
                <td className={c.td}><span className={s.tfootTotal}>S/ {totalPeriodo.toFixed(2)}</span></td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {showModal && (
        <div className={c.modalOverlay}>
          <div className={c.modalCard}>
            <div className={c.modalHeader}>
              <span className={c.modalTitle}>Confirmar exportación</span>
              <button className={c.modalCloseBtn} onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>
            <div className={c.modalBody}>
              <div className={s.exportIconBox} style={{ "--icon-bg": exportFmt === "pdf" ? "#fdf2ec" : "#f0fdf4" } as React.CSSProperties}>
                {exportFmt === "pdf" ? <FileDown size={24} style={{ color: "#c1381a" }} /> : <FileSpreadsheet size={24} style={{ color: "#16a34a" }} />}
              </div>
              <p className={s.exportTitle}>Exportar como {exportFmt === "pdf" ? "PDF" : "Excel"}</p>
              <p className={s.exportSubtitle}>Reporte de movimientos con {filtered.length} registros.</p>
              <div className={c.modalFooter} style={{ padding: 0 }}>
                <button className={c.secondaryBtn} style={{ flex: 1 }} onClick={() => setShowModal(false)} disabled={exportando}>Cancelar</button>
                <button
                  className={s.exportConfirmBtn}
                  style={{
                    "--btn-bg": exportFmt === "pdf" ? "linear-gradient(90deg,#c1381a,#d94e2b)" : "#16a34a",
                    opacity: exportando ? 0.7 : 1,
                  } as React.CSSProperties}
                  onClick={confirmExport}
                  disabled={exportando}
                >
                  {exportFmt === "pdf" ? <FileDown size={14} /> : <FileSpreadsheet size={14} />}
                  {exportando ? "Generando..." : "Exportar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className={c.toast}><CheckCircle size={18} /> {successMsg}</div>
      )}
    </div>
  );
}