import { useEffect, useState } from "react";
import { ArrowLeft, Save, X } from "lucide-react";
import c from "../styles/common.module.css";
import s from "../styles/NuevoProducto.module.css";
import { productoService, type Producto } from "../api/productoService";
import { categoriaService, type Categoria } from "../api/categoriaService";

interface Props {
  onBack: () => void;
  producto?: Producto | null;
}

export default function NuevoProducto({ onBack, producto }: Props) {
  const editando = !!producto;

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [nombre, setNombre] = useState(producto?.nombre ?? "");
  const [codigoSku, setCodigoSku] = useState(producto?.codigoSku ?? "");
  const [idCategoria, setIdCategoria] = useState<number | "">(producto?.idCategoria ?? "");
  const [descripcion, setDescripcion] = useState(producto?.descripcion ?? "");
  const [unidadMedida, setUnidadMedida] = useState(producto?.unidadMedida ?? "");
  const [stockActual, setStockActual] = useState(producto?.stockActual?.toString() ?? "0");
  const [stockMinimo, setStockMinimo] = useState(producto?.stockMinimo?.toString() ?? "0");
  const [precioUnitario, setPrecioUnitario] = useState(producto?.precioUnitario?.toString() ?? "0");
  const [activo, setActivo] = useState(producto?.activo ?? true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    categoriaService.listar()
      .then(setCategorias)
      .catch((e) => console.error("Error al cargar categorías:", e));
  }, []);

  const handleGuardar = async () => {
    if (!nombre.trim() || !codigoSku.trim() || idCategoria === "" || !unidadMedida) {
      alert("Completa los campos obligatorios: nombre, SKU, categoría y unidad de medida");
      return;
    }

    try {
      setGuardando(true);
      const payload = {
        codigoSku: codigoSku.trim(),
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || undefined,
        unidadMedida,
        stockActual: Number(stockActual),
        stockMinimo: Number(stockMinimo),
        precioUnitario: Number(precioUnitario),
        idCategoria: Number(idCategoria),
        activo,
      };

      if (editando) {
        await productoService.actualizar(producto!.idProducto, payload);
      } else {
        await productoService.crear(payload);
      }
      onBack();
    } catch (error: any) {
      const msg = error?.response?.data?.mensaje || "Error al guardar el producto";
      alert(msg);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className={c.pageWrapper}>
      <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
        <button onClick={onBack} className={`${c.secondaryBtn} !p-2`} style={{ borderRadius: "0.75rem" }}>
          <ArrowLeft size={16} className="text-gray-600" />
        </button>
        <div>
          <h1 className={c.pageTitle}>{editando ? "Editar Producto" : "Nuevo Producto"}</h1>
          <p className={c.pageSubtitle}>
            {editando ? "Modifica los datos del producto" : "Completa los datos para registrar un nuevo producto"}
          </p>
        </div>
      </div>

      <div className={s.layout}>
        <div className={s.mainCol}>
          <div className={c.sectionCard}>
            <h3 className={c.sectionTitle}>Información Básica</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={c.fieldLabel}>Nombre del producto *</label>
                <input type="text" placeholder="Ej: Pollo entero"
                  className={c.inputField} value={nombre} onChange={(e) => setNombre(e.target.value)} />
              </div>
              <div>
                <label className={c.fieldLabel}>Código / SKU *</label>
                <input type="text" placeholder="Ej: P-011"
                  className={c.inputField} value={codigoSku} onChange={(e) => setCodigoSku(e.target.value)} />
              </div>
              <div>
                <label className={c.fieldLabel}>Categoría *</label>
                <select className={c.selectField} value={idCategoria}
                  onChange={(e) => setIdCategoria(e.target.value === "" ? "" : Number(e.target.value))}>
                  <option value="">Seleccionar categoría</option>
                  {categorias.map((cat) => (
                    <option key={cat.idCategoria} value={cat.idCategoria}>{cat.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className={c.fieldLabel}>Descripción</label>
                <textarea rows={3} placeholder="Descripción opcional..."
                  className={c.inputField + " resize-none"} value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)} />
              </div>
            </div>
          </div>

          <div className={c.sectionCard}>
            <h3 className={c.sectionTitle}>Control de Stock</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={c.fieldLabel}>Unidad de medida *</label>
                <select className={c.selectField} value={unidadMedida}
                  onChange={(e) => setUnidadMedida(e.target.value)}>
                  <option value="">Seleccionar</option>
                  {["Kg", "L", "Und", "Caja", "Bolsa"].map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={c.fieldLabel}>Stock inicial *</label>
                <input type="number" step="0.01" min="0" placeholder="0" className={c.inputField}
                  value={stockActual} onChange={(e) => setStockActual(e.target.value)} />
              </div>
              <div>
                <label className={c.fieldLabel}>Stock mínimo *</label>
                <input type="number" step="0.01" min="0" placeholder="0" className={c.inputField}
                  value={stockMinimo} onChange={(e) => setStockMinimo(e.target.value)} />
              </div>
            </div>
          </div>

          <div className={c.sectionCard}>
            <h3 className={c.sectionTitle}>Precio</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={c.fieldLabel}>Precio unitario (S/)</label>
                <input type="number" step="0.01" min="0" placeholder="0.00" className={c.inputField}
                  value={precioUnitario} onChange={(e) => setPrecioUnitario(e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className={c.sectionCard}>
            <h3 className={c.sectionTitle}>Estado del Producto</h3>
            <label className={s.radioOption}>
              <input type="radio" name="estado" className="accent-red-700"
                checked={activo} onChange={() => setActivo(true)} />
              <span className="text-sm font-medium text-gray-700">Activo</span>
            </label>
            <label className={s.radioOption}>
              <input type="radio" name="estado" className="accent-red-700"
                checked={!activo} onChange={() => setActivo(false)} />
              <span className="text-sm font-medium text-gray-700">Inactivo</span>
            </label>
          </div>

          <div className={c.sectionCard}>
            <div className="space-y-3">
              <button className={c.primaryBtn} style={{ width: "100%", opacity: guardando ? 0.7 : 1 }}
                onClick={handleGuardar} disabled={guardando}>
                <Save size={15} /> {guardando ? "Guardando..." : (editando ? "Actualizar Producto" : "Guardar Producto")}
              </button>
              <button className={c.secondaryBtn} style={{ width: "100%" }} onClick={onBack}>
                <X size={15} /> Cancelar
              </button>
            </div>
          </div>

          <div className={s.tipBox}>
            <p className={s.tipLabel}>Consejo</p>
            <p className={s.tipText}>
              Establece un stock mínimo adecuado para recibir alertas antes de quedarte sin el producto.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}