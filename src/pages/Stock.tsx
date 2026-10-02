import { useEffect, useState } from "react";
import { Search, AlertTriangle, CheckCircle, Package, FileDown, FileSpreadsheet, X } from "lucide-react";
import c from "../styles/common.module.css";
import s from "../styles/Stock.module.css";
import { stockService, type StockProducto } from "../api/dashboardService";
import { reporteService, descargarArchivo } from "../api/reporteService";

function getStatusKey(estado: string) {
  if (estado === "CRITICO") return "sin-stock";
  if (estado === "BAJO") return "bajo";
  return "ok";
}

const statusCfg: Record<string, { label: string; color: string; bg: string; barColor: string }> = {
  "sin-stock": { label: "Sin stock",  color: "#dc2626", bg: "#fef2f2", barColor: "#dc2626" },
  "bajo":      { label: "Stock bajo", color: "#c1381a", bg: "#fdf2ec", barColor: "#c1381a" },
  "ok":        { label: "Normal",     color: "#16a34a", bg: "#f0fdf4", barColor: "#16a34a" },
};

const summaryCfg = [
  { label: "Total Productos", key: "total",    Icon: Package,       color: "#6b7280", bg: "#f9fafb" },
  { label: "Stock Normal",    key: "ok",       Icon: CheckCircle,   color: "#16a34a", bg: "#f0fdf4" },
  { label: "Stock Bajo",      key: "bajo",     Icon: AlertTriangle, color: "#c1381a", bg: "#fdf2ec" },
  { label: "Sin Stock",       key: "sinStock", Icon: AlertTriangle, color: "#dc2626", bg: "#fef2f2" },
];

export default function Stock() {
  const [productos, setProductos] = useState<StockProducto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Todos");
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<"pdf" | "excel">("pdf");
  const [showSuccess, setShowSuccess] = useState(false);
  const [exportando, setExportando] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        setCargando(true);
        const data = await stockService.listar();
        setProductos(data);
      } catch (error) {
        console.error("Error al cargar stock:", error);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  const filtered = productos.filter((p) => {
    const st = getStatusKey(p.estado);
    if (filter === "Bajo" && !["bajo", "sin-stock"].includes(st)) return false;
    if (filter === "Normal" && st !== "ok") return false;
    return p.nombre.toLowerCase().includes(search.toLowerCase());
  });

  const counts = {
    total: productos.length,
    ok: productos.filter((p) => getStatusKey(p.estado) === "ok").length,
    bajo: productos.filter((p) => ["bajo", "sin-stock"].includes(getStatusKey(p.estado))).length,
    sinStock: productos.filter((p) => getStatusKey(p.estado) === "sin-stock").length,
  };

  const handleExport = async () => {
    try {
      setExportando(true);
      const blob = exportFormat === "pdf"
        ? await reporteService.descargarStockPdf()
        : await reporteService.descargarStockExcel();

      const nombre = exportFormat === "pdf" ? "reporte-stock.pdf" : "reporte-stock.xlsx";
      descargarArchivo(blob, nombre);

      setShowExportModal(false);
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
          <h1 className={c.pageTitle}>Stock Actual</h1>
          <p className={c.pageSubtitle}>Nivel actual de inventario de todos los productos</p>
        </div>
        <div className={c.btnRow}>
          <button className={c.greenBtn} onClick={() => { setExportFormat("excel"); setShowExportModal(true); }}>
            <FileSpreadsheet size={15} />
            <span className="hidden sm:inline">Exportar</span> Excel
          </button>
          <button className={c.primaryBtn} onClick={() => { setExportFormat("pdf"); setShowExportModal(true); }}>
            <FileDown size={15} />
            <span className="hidden sm:inline">Exportar</span> PDF
          </button>
        </div>
      </div>

      <div className={s.summaryGrid}>
        {summaryCfg.map(({ label, key, Icon, color, bg }) => (
          <div key={label} className={s.summaryCard}>
            <div className={s.summaryIconBox} style={{ "--icon-bg": bg } as React.CSSProperties}>
              <Icon size={16} style={{ color }} />
            </div>
            <div>
              <p className={s.summaryValue} style={{ "--value-color": color } as React.CSSProperties}>
                {counts[key as keyof typeof counts]}
              </p>
              <p className={s.summaryLabel}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5">
        <div className="flex gap-2 flex-wrap">
          {["Todos", "Bajo", "Normal"].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={f === filter ? c.primaryBtn : c.secondaryBtn}
              style={{ padding: "0.5rem 1rem" }}>
              {f}
            </button>
          ))}
        </div>
        <div className="relative sm:ml-auto sm:max-w-xs w-full">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Buscar producto..." value={search} onChange={(e) => setSearch(e.target.value)}
            className={c.inputField} style={{ paddingLeft: "2.25rem" }} />
        </div>
      </div>

      <div className={c.tableCard}>
        <div className={c.tableScroll}>
          <table className={c.table} style={{ minWidth: "640px" }}>
            <thead className={c.thead}>
              <tr>
                {["Producto", "Categoría", "Stock Actual", "Mínimo", "Nivel", "Estado"].map((h) => (
                  <th key={h} className={c.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr><td colSpan={6} className={c.td} style={{ textAlign: "center", color: "#9ca3af", padding: "2rem" }}>Cargando stock...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className={c.td} style={{ textAlign: "center", color: "#9ca3af", padding: "2rem" }}>No hay productos que coincidan</td></tr>
              ) : (
                filtered.map((p, i) => {
                  const st = getStatusKey(p.estado);
                  const cfg = statusCfg[st];
                  const pct = Math.min((Number(p.stockActual) / (Number(p.stockMinimo) * 4)) * 100, 100);
                  return (
                    <tr key={p.idProducto} className={[c.tr, i > 0 ? c.trBorder : ""].join(" ")}>
                      <td className={c.td}><span className="font-medium text-gray-800">{p.nombre}</span></td>
                      <td className={c.td}><span className={`${c.badge} ${c.badgeGray}`}>{p.nombreCategoria}</span></td>
                      <td className={c.td}>
                        <span className="font-bold text-gray-800">{p.stockActual}</span>{" "}
                        <span className="text-gray-400 text-xs">{p.unidadMedida}</span>
                      </td>
                      <td className={c.td}><span className="text-gray-500">{p.stockMinimo}</span></td>
                      <td className={c.td} style={{ width: "9rem" }}>
                        <div className={s.barTrack}>
                          <div className={s.barFill} style={{ width: `${pct}%`, "--bar-color": cfg.barColor } as React.CSSProperties} />
                        </div>
                        <p className={s.barPct}>{Math.round(pct)}%</p>
                      </td>
                      <td className={c.td}>
                        <span className={s.statusBadge} style={{ "--status-color": cfg.color, "--status-bg": cfg.bg } as React.CSSProperties}>
                          {cfg.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showExportModal && (
        <div className={c.modalOverlay}>
          <div className={c.modalCard}>
            <div className={c.modalHeader}>
              <span className={c.modalTitle}>Confirmar exportación</span>
              <button className={c.modalCloseBtn} onClick={() => setShowExportModal(false)}><X size={16} /></button>
            </div>
            <div className={c.modalBody}>
              <div style={{ width: "3.5rem", height: "3.5rem", borderRadius: "1rem", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem", background: exportFormat === "pdf" ? "#fdf2ec" : "#f0fdf4" }}>
                {exportFormat === "pdf" ? <FileDown size={24} style={{ color: "#c1381a" }} /> : <FileSpreadsheet size={24} style={{ color: "#16a34a" }} />}
              </div>
              <p style={{ textAlign: "center", fontFamily: "Poppins,sans-serif", fontWeight: 600, color: "#111", marginBottom: "0.25rem" }}>
                Exportar Stock como {exportFormat === "pdf" ? "PDF" : "Excel"}
              </p>
              <p style={{ textAlign: "center", fontSize: "0.875rem", color: "#6b7280", marginBottom: "1.5rem" }}>
                {productos.length} productos incluidos.
              </p>
              <div className={c.modalFooter} style={{ padding: 0 }}>
                <button className={c.secondaryBtn} style={{ flex: 1 }} onClick={() => setShowExportModal(false)} disabled={exportando}>Cancelar</button>
                <button
                  className={c.primaryBtn}
                  style={{ flex: 1, background: exportFormat === "pdf" ? "linear-gradient(90deg,#c1381a,#d94e2b)" : "#16a34a", opacity: exportando ? 0.7 : 1 }}
                  onClick={handleExport}
                  disabled={exportando}
                >
                  {exportFormat === "pdf" ? <FileDown size={14} /> : <FileSpreadsheet size={14} />}
                  {exportando ? "Generando..." : "Exportar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className={c.toast}>
          <CheckCircle size={18} /> Stock exportado como {exportFormat === "pdf" ? "PDF" : "Excel"} exitosamente
        </div>
      )}
    </div>
  );
}