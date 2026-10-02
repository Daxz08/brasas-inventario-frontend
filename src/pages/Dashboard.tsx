import { useEffect, useState } from "react";
import { Package, TrendingDown, ArrowLeftRight, AlertTriangle, Eye } from "lucide-react";
import s from "../styles/Dashboard.module.css";
import c from "../styles/common.module.css";
import { dashboardService, alertaService, type Dashboard as DashboardData, type AlertaStock } from "../api/dashboardService";
import { movimientoService, type Movimiento } from "../api/movimientoService";

type Page = "productos" | "movimientos" | "stock" | "reportes";
interface DashboardProps { onNavigate: (page: Page) => void; }

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

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [alertas, setAlertas] = useState<AlertaStock[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [dash, movs, als] = await Promise.all([
          dashboardService.obtener(),
          movimientoService.listar(),
          alertaService.listar(),
        ]);
        setData(dash);
        setMovimientos(movs.slice(0, 5));
        setAlertas(als.slice(0, 5));
      } catch (error) {
        console.error("Error al cargar dashboard:", error);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  const kpis = [
    {
      label: "Total Productos",
      value: data?.totalProductos ?? 0,
      change: "Productos activos",
      icon: Package,
      stripColor: "#c1381a", iconBg: "#fdf2ec", iconBorder: "#fdd8cc",
      valueColor: "#c1381a", badgeBg: "#f0fdf4", badgeColor: "#16a34a",
    },
    {
      label: "Productos con Stock Bajo",
      value: data?.productosStockBajo ?? 0,
      change: "Requieren reposición",
      icon: TrendingDown,
      stripColor: "#e8872a", iconBg: "#fef3db", iconBorder: "#fce8b2",
      valueColor: "#e8872a", badgeBg: "#fef3db", badgeColor: "#e8872a",
    },
    {
      label: "Movimientos Hoy",
      value: data?.movimientosHoy ?? 0,
      change: "Registrados hoy",
      icon: ArrowLeftRight,
      stripColor: "#2563eb", iconBg: "#eff6ff", iconBorder: "#bfdbfe",
      valueColor: "#2563eb", badgeBg: "#f0fdf4", badgeColor: "#16a34a",
    },
    {
      label: "Mermas del Mes",
      value: data?.mermasDelMes ?? 0,
      change: "Incidencias acumuladas",
      icon: AlertTriangle,
      stripColor: "#dc2626", iconBg: "#fef2f2", iconBorder: "#fecaca",
      valueColor: "#dc2626", badgeBg: "#fef2f2", badgeColor: "#dc2626",
    },
  ];

  const formatHora = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
  };

  if (cargando) {
    return (
      <div className={c.pageWrapper}>
        <p style={{ textAlign: "center", color: "#6b7280", padding: "3rem" }}>
          Cargando dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className={c.pageWrapper}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 className={c.pageTitle}>Dashboard</h1>
        <p className={c.pageSubtitle}>
          Resumen general del inventario — {new Date().toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      <div className={s.kpiGrid}>
        {kpis.map(({ label, value, change, icon: Icon, stripColor, iconBg, iconBorder, valueColor, badgeBg, badgeColor }) => (
          <div
            key={label}
            className={s.kpiCard}
            style={{
              "--strip-color": stripColor,
              "--icon-bg": iconBg,
              "--icon-border": iconBorder,
              "--value-color": valueColor,
              "--badge-bg": badgeBg,
              "--badge-color": badgeColor,
            } as React.CSSProperties}
          >
            <div className={s.kpiStrip} />
            <div className={s.kpiTop}>
              <div className={s.kpiIconBox}>
                <Icon size={18} style={{ color: stripColor }} />
              </div>
              <span className={s.kpiChangeBadge}>{change}</span>
            </div>
            <p className={s.kpiValue}>{value}</p>
            <p className={s.kpiLabel}>{label}</p>
          </div>
        ))}
      </div>

      <div className={s.mainGrid}>
        {/* Movimientos recientes */}
        <div className={s.movCard}>
          <div className={s.movHeader}>
            <h3 className={s.movTitle}>Movimientos Recientes</h3>
            <button className={s.movViewAll} onClick={() => onNavigate("movimientos")}>
              Ver todos <Eye size={12} />
            </button>
          </div>
          <div className={c.tableScroll}>
            <table className={c.table} style={{ minWidth: "480px" }}>
              <thead className={c.thead}>
                <tr>
                  {["ID", "Producto", "Tipo", "Cant.", "Hora"].map((h) => (
                    <th key={h} className={c.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {movimientos.length === 0 ? (
                  <tr>
                    <td colSpan={5} className={c.td} style={{ textAlign: "center", color: "#9ca3af", padding: "2rem" }}>
                      No hay movimientos registrados
                    </td>
                  </tr>
                ) : (
                  movimientos.map((m, i) => {
                    const primerDetalle = m.detalles[0];
                    return (
                      <tr key={m.idMovimiento} className={[c.tr, i > 0 ? c.trBorder : ""].join(" ")}>
                        <td className={c.td}>
                          <span className="font-mono text-xs text-gray-400">MOV-{String(m.idMovimiento).padStart(3, "0")}</span>
                        </td>
                        <td className={c.td}>
                          <span className="font-medium text-gray-800">
                            {primerDetalle?.nombreProducto ?? "-"}
                            {m.detalles.length > 1 && ` +${m.detalles.length - 1}`}
                          </span>
                        </td>
                        <td className={c.td}>
                          <span className={`${c.badge} ${tipoBadge[m.tipoMovimiento]}`}>
                            {tipoLabel[m.tipoMovimiento]}
                          </span>
                        </td>
                        <td className={c.td}><span className="text-gray-700">{primerDetalle?.cantidad ?? "-"}</span></td>
                        <td className={c.td}><span className="text-xs text-gray-400">{formatHora(m.fechaMovimiento)}</span></td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alertas de stock */}
        <div className={s.alertCard}>
          <div className={s.alertHeader}>
            <h3 className={s.alertTitle}>Alertas de Stock</h3>
            <button className={s.movViewAll} onClick={() => onNavigate("stock")}>Ver stock</button>
          </div>
          <div className={s.alertList}>
            {alertas.length === 0 ? (
              <p style={{ textAlign: "center", color: "#9ca3af", padding: "2rem", fontSize: "0.875rem" }}>
                Sin alertas de stock mínimo
              </p>
            ) : (
              alertas.map((item) => {
                const pct = Math.min((Number(item.stockActual) / Number(item.stockMinimo)) * 100, 100);
                const critical = pct < 30;
                return (
                  <div
                    key={item.idProducto}
                    className={critical ? s.alertItemCritical : s.alertItemWarning}
                    style={{ borderRadius: "0.75rem", padding: "0.75rem" }}
                  >
                    <div className={s.alertItemTop}>
                      <div>
                        <p className={s.alertProductName}>{item.nombre}</p>
                        <p className={s.alertProductQty}>
                          {item.stockActual} / {item.stockMinimo}
                        </p>
                      </div>
                      <AlertTriangle size={14} style={{ color: critical ? "#c1381a" : "#e8872a" }} />
                    </div>
                    <div className={s.alertBar}>
                      <div
                        className={[s.alertBarFill, critical ? s.alertBarCritical : s.alertBarWarning].join(" ")}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div className={s.alertFooter}>
            <button className={s.alertFooterBtn} onClick={() => onNavigate("stock")}>
              Gestionar stock completo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}