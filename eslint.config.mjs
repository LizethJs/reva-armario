"use client";

import { useState } from "react";

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Asignamos la sesión de vendedor/diseñador directamente
    const sessionUser = {
      name: formData.email ? formData.email.split("@")[0] : "Diseñador RËVA",
      email: formData.email || "admin@reva.com",
      role: "SELLER"
    };
    
    localStorage.setItem("user_session", JSON.stringify(sessionUser));
    
    // Entramos al armario
    window.location.href = "/";
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

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-[#101010] border border-zinc-800 rounded-xl text-white text-xs outline-none focus:border-amber-500"
            placeholder="Correo electrónico"
          />

          <input
            type="password"
            name="password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-[#101010] border border-zinc-800 rounded-xl text-white text-xs outline-none focus:border-amber-500"
            placeholder="Contraseña"
          />

          <button
            type="submit"
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-black font-extrabold rounded-xl text-xs transition cursor-pointer"
          >
            Abrir Armario y Cámara
          </button>
        </form>
      </div>
    </div>
  );
}