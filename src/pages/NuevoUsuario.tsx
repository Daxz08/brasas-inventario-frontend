import { useState } from "react";
import { ArrowLeft, Save, X, Shield, User, Eye, EyeOff } from "lucide-react";
import c from "../styles/common.module.css";
import s from "../styles/NuevoUsuario.module.css";
import { usuarioService, type Usuario as UsuarioType } from "../api/usuarioService";

interface Props {
  onBack: () => void;
  usuario?: UsuarioType | null;
}

const ROL_ADMIN = 1;
const ROL_EMPLEADO = 2;

export default function NuevoUsuario({ onBack, usuario }: Props) {
  const editando = !!usuario;

  const [nombres, setNombres] = useState(usuario?.nombres ?? "");
  const [apellidos, setApellidos] = useState(usuario?.apellidos ?? "");
  const [email, setEmail] = useState(usuario?.email ?? "");
  const [nombreUsuario, setNombreUsuario] = useState(usuario?.nombreUsuario ?? "");
  const [contrasena, setContrasena] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [idRol, setIdRol] = useState<number>(usuario?.idRol ?? ROL_EMPLEADO);
  const [activo, setActivo] = useState(usuario?.activo ?? true);
  const [guardando, setGuardando] = useState(false);

  const handleGuardar = async () => {
    if (!nombres.trim() || !apellidos.trim() || !nombreUsuario.trim()) {
      alert("Completa los campos obligatorios");
      return;
    }
    if (!editando && (!contrasena || contrasena.length < 6)) {
      alert("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (editando && contrasena && contrasena.length < 6) {
      alert("Si vas a cambiar la contraseña, debe tener al menos 6 caracteres");
      return;
    }

    try {
      setGuardando(true);
      const payload = {
        nombreUsuario: nombreUsuario.trim(),
        contrasena: contrasena || undefined,
        nombres: nombres.trim(),
        apellidos: apellidos.trim(),
        email: email.trim() || undefined,
        idRol,
        activo,
      };

      if (editando) {
        await usuarioService.actualizar(usuario!.idUsuario, payload);
      } else {
        await usuarioService.crear(payload);
      }
      onBack();
    } catch (error: any) {
      const msg = error?.response?.data?.mensaje || "Error al guardar el usuario";
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
          <h1 className={c.pageTitle}>{editando ? "Editar Usuario" : "Nuevo Usuario"}</h1>
          <p className={c.pageSubtitle}>
            {editando ? "Modifica los datos del usuario" : "Registra un nuevo usuario en el sistema"}
          </p>
        </div>
      </div>

      <div className={s.layout}>
        <div className={s.mainCol}>
          <div className={c.sectionCard}>
            <h3 className={c.sectionTitle}>Datos Personales</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={c.fieldLabel}>Nombres *</label>
                <input type="text" placeholder="Ej: Carlos" className={c.inputField}
                  value={nombres} onChange={(e) => setNombres(e.target.value)} />
              </div>
              <div>
                <label className={c.fieldLabel}>Apellidos *</label>
                <input type="text" placeholder="Ej: Mendoza" className={c.inputField}
                  value={apellidos} onChange={(e) => setApellidos(e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <label className={c.fieldLabel}>Correo electrónico</label>
                <input type="email" placeholder="usuario@brasasdelcentro.pe" className={c.inputField}
                  value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
          </div>

          <div className={c.sectionCard}>
            <h3 className={c.sectionTitle}>Credenciales de Acceso</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={c.fieldLabel}>Nombre de usuario *</label>
                <input type="text" placeholder="Ej: carlos.m" className={c.inputField}
                  value={nombreUsuario} onChange={(e) => setNombreUsuario(e.target.value)} />
              </div>
              <div>
                <label className={c.fieldLabel}>
                  Contraseña {editando ? "(dejar vacío para no cambiar)" : "*"}
                </label>
                <div className={s.passwordWrapper}>
                  <input type={showPass ? "text" : "password"}
                    placeholder={editando ? "Sin cambios" : "Mínimo 6 caracteres"}
                    className={c.inputField} style={{ paddingRight: "2.5rem" }}
                    value={contrasena} onChange={(e) => setContrasena(e.target.value)} />
                  <button type="button" className={s.passwordToggle} onClick={() => setShowPass(!showPass)}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className={c.sectionCard}>
            <h3 className={c.sectionTitle}>Rol del usuario</h3>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
              {[
                { value: ROL_ADMIN, label: "Administrador", icon: Shield, desc: "Acceso total al sistema" },
                { value: ROL_EMPLEADO, label: "Empleado", icon: User, desc: "Acceso limitado" },
              ].map(({ value, label, icon: Icon, desc }) => (
                <button key={value} onClick={() => setIdRol(value)}
                  className={`${s.roleBtn} ${idRol === value ? s.roleBtnActive : ""}`}>
                  <div className={`${s.roleIconBox} ${idRol === value ? s.roleIconBoxActive : ""}`}>
                    <Icon size={15} style={{ color: idRol === value ? "#c1381a" : "#9ca3af" }} />
                  </div>
                  <div>
                    <p className={`${s.roleName} ${idRol === value ? s.roleNameActive : ""}`}>{label}</p>
                    <p className={s.roleDesc}>{desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className={c.sectionCard}>
            <h3 className={c.sectionTitle}>Estado inicial</h3>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={activo} onChange={(e) => setActivo(e.target.checked)}
                className="w-4 h-4 accent-red-700" />
              <span className="text-sm text-gray-700">Usuario activo</span>
            </label>
          </div>

          <div className={c.sectionCard}>
            <div className="space-y-3">
              <button className={c.primaryBtn} style={{ width: "100%", opacity: guardando ? 0.7 : 1 }}
                onClick={handleGuardar} disabled={guardando}>
                <Save size={15} /> {guardando ? "Guardando..." : (editando ? "Actualizar Usuario" : "Guardar Usuario")}
              </button>
              <button className={c.secondaryBtn} style={{ width: "100%" }} onClick={onBack}>
                <X size={15} /> Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}