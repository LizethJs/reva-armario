"use client";

import { useState } from "react";
import { loginUser } from "../actions/auth";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", success: false });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", success: false });

    try {
      const res = await loginUser(formData);

      if (res.success) {
        // Guardar sesión para que app/page.tsx cargue la cámara y el armario correctamente
        const sessionPayload = {
          name: res.user?.name || "Usuario RËVA",
          email: formData.email,
          role: res.user?.role || "CLIENT",
        };
        localStorage.setItem("user_session", JSON.stringify(sessionPayload));

        setMessage({ text: "¡Inicio de sesión exitoso! Entrando al probador...", success: true });
        setTimeout(() => {
          window.location.href = res.redirectTo || "/";
        }, 800);
      } else {
        setMessage({ text: res.message || "Credenciales inválidas.", success: false });
      }
    } catch (error) {
      setMessage({ text: "Ocurrió un error inesperado al iniciar sesión.", success: false });
    } finally {
      setLoading(false);
    }
  };

  const goToRegister = () => {
    window.location.href = "/register";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="relative max-w-sm w-full bg-[#181818] p-8 rounded-2xl shadow-2xl border-t-2 border-amber-500">
        
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="w-12 h-12 bg-amber-500 text-black font-extrabold text-xl rounded-xl flex items-center justify-center mb-3 shadow-md shadow-amber-500/20">
            R
          </div>
          <h1 className="text-xl font-extrabold tracking-wider text-white">
            PORTAL RËVA
          </h1>
          <p className="text-xs text-zinc-400 mt-1 text-center font-light">
            Acceso seguro al probador virtual y armario
          </p>
        </div>

        {message.text && (
          <div
            className={`p-3 mb-5 rounded-xl text-xs font-medium text-center border ${
              message.success
                ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                : "bg-red-950/50 border-red-800/60 text-red-300"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <span className="absolute left-3.5 top-3 text-zinc-400 text-sm">✉️</span>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-10 pr-3.5 py-2.5 bg-[#101010] border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:border-amber-500 outline-none text-xs transition"
              placeholder="Correo electrónico"
            />
          </div>

          <div className="relative">
            <span className="absolute left-3.5 top-3 text-zinc-400 text-sm">🔒</span>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-10 pr-3.5 py-2.5 bg-[#101010] border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:border-amber-500 outline-none text-xs transition"
              placeholder="Contraseña"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#b38308] hover:bg-amber-600 text-black font-extrabold rounded-xl transition duration-200 disabled:opacity-50 text-xs cursor-pointer mt-2 shadow-md"
          >
            {loading ? "Verificando..." : "Iniciar Sesión"}
          </button>

          <div className="text-center pt-3">
            <p className="text-xs text-zinc-400">
              ¿No tienes una cuenta?{" "}
              <button
                type="button"
                onClick={goToRegister}
                className="text-zinc-300 hover:text-amber-400 font-semibold underline transition cursor-pointer bg-transparent border-none p-0 inline"
              >
                Regístrate aquí
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}