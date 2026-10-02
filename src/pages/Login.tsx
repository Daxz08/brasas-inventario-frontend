import { useState } from "react";
import { authService, type Usuario } from "../api/authService";
import s from "../styles/Login.module.css";

interface LoginProps {
  onLogin: (usuario: Usuario) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      const usuario = await authService.login({ nombreUsuario, contrasena });
      onLogin(usuario);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError("Usuario o contraseña incorrectos");
      } else if (err.response?.status === 400) {
        setError("Datos inválidos. Verifica los campos.");
      } else {
        setError("Error al conectar con el servidor");
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className={s.wrapper}>
      <div className={s.bgBase} />
      <div className={s.bgGlow} />
      <div className={s.bgVignette} />
      <div className={s.bgTexture} />

      <div className={s.leftPanel}>
        <img src="/src/imports/logobrasas.png" alt="Brasas del Centro" className={s.logoImg} />
        <h1 className={s.mainTitle}>Sistema de Gestión</h1>
        <h2 className={s.accentTitle}>de Inventarios</h2>
        <p className={s.tagline}>
          Controla tu stock, registra movimientos y mantén tu pollería funcionando con eficiencia.
        </p>
      </div>

      <div className={s.rightPanel}>
        <div className={s.card}>
          <h3 className={s.cardHeading}>Bienvenido</h3>
          <p className={s.cardSubheading}>Ingresa tus credenciales para continuar</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Usuario</label>
              <input
                type="text"
                value={nombreUsuario}
                onChange={(e) => setNombreUsuario(e.target.value)}
                placeholder="Ingresa tu usuario"
                required
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all bg-white"
                style={{ borderColor: "#e0d8d0" }}
                onFocus={(e) => (e.target.style.borderColor = "#c1381a")}
                onBlur={(e) => (e.target.style.borderColor = "#e0d8d0")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Contraseña</label>
              <input
                type="password"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                placeholder="Ingresa tu contraseña"
                required
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all bg-white"
                style={{ borderColor: "#e0d8d0" }}
                onFocus={(e) => (e.target.style.borderColor = "#c1381a")}
                onBlur={(e) => (e.target.style.borderColor = "#e0d8d0")}
              />
              <a href="#" className={s.forgotLink}>¿Olvidaste tu contraseña?</a>
            </div>

            {error && (
              <div
                className="text-sm px-4 py-2 rounded-xl"
                style={{ background: "#fde8e4", color: "#c1381a", border: "1px solid #f5c6bd" }}
              >
                {error}
              </div>
            )}

            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" className="rounded" />
              <label htmlFor="remember" className="text-sm text-gray-600">Recordar sesión</label>
            </div>

            <button
              type="submit"
              className={s.submitBtn}
              disabled={cargando}
              style={{ opacity: cargando ? 0.7 : 1, cursor: cargando ? "wait" : "pointer" }}
            >
              {cargando ? "Iniciando sesión..." : "Iniciar Sesión"}
            </button>
          </form>

          <p className={s.hint}>
            Usa <span className={s.hintStrong}>admin</span> / <span className={s.hintStrong}>admin123</span>
          </p>
        </div>
      </div>
    </div>
  );
}