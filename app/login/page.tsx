"use client";

import { useState } from "react";
import { loginUser } from "../actions/auth";

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
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

      if (res.success && res.user) {
        localStorage.setItem("user_session", JSON.stringify(res.user));
        setMessage({ text: "¡Acceso concedido! Entrando...", success: true });
        
        setTimeout(() => {
          window.location.href = "/";
        }, 300);
      } else {
        setMessage({ text: res.message || "Credenciales inválidas.", success: false });
        setLoading(false);
      }
    } catch (err) {
      setMessage({ text: "Error de conexión con el servidor.", success: false });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="relative max-w-sm w-full bg-[#181818] p-8 rounded-2xl shadow-2xl border-t-2 border-amber-500">
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="w-12 h-12 bg-amber-500 text-black font-extrabold text-xl rounded-xl flex items-center justify-center mb-3">
            R
          </div>
          <h1 className="text-xl font-extrabold tracking-wider text-white">PORTAL RËVA</h1>
          <p className="text-xs text-zinc-400 mt-1">Acceso al armario digital y probador</p>
        </div>

        {message.text && (
          <div className={`p-3 mb-5 rounded-xl text-xs font-medium text-center border ${
            message.success ? "bg-amber-500/15 border-amber-500/30 text-amber-300" : "bg-red-950/50 border-red-800 text-red-300"
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 bg-[#101010] border border-zinc-800 rounded-xl text-white text-xs outline-none focus:border-amber-500"
            placeholder="Correo electrónico"
          />

          <input
            type="password"
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 bg-[#101010] border border-zinc-800 rounded-xl text-white text-xs outline-none focus:border-amber-500"
            placeholder="Contraseña"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-black font-extrabold rounded-xl text-xs transition cursor-pointer disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Iniciar Sesión"}
          </button>

          <div className="text-center pt-2">
            <p className="text-xs text-zinc-400">
              ¿No tienes cuenta? <a href="/register" className="text-amber-400 underline">Regístrate</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}