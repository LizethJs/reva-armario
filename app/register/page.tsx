"use client";

import { useState } from "react";
import { registerUser, verifyOtp, resendOtp } from "../actions/auth";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "otp">("form");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    role: "CLIENTE (Armario Personal)",
    email: "",
    password: "",
  });
  
  const [otp, setOtp] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("CLIENT");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", success: false });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", success: false });

    try {
      const res = await registerUser(formData);
      if (res.success && res.redirectToOtp) {
        setRegisteredEmail(res.email || formData.email);
        setUserName(formData.name);
        setUserRole(formData.role.includes("Diseñador") || formData.role.includes("SELLER") ? "SELLER" : "CLIENT");
        setStep("otp");
        setMessage({ text: res.message, success: true });
      } else {
        setMessage({ text: res.message || "Error al registrarse.", success: false });
      }
    } catch (err) {
      setMessage({ text: "Error de conexión con el servidor.", success: false });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", success: false });

    try {
      const res = await verifyOtp(registeredEmail, otp);
      if (res.success) {
        // AQUÍ ESTÁ LA CLAVE: Guardamos la sesión exactamente como app/page.tsx la necesita
        const userSession = {
          name: userName,
          email: registeredEmail,
          role: userRole,
        };
        localStorage.setItem("user_session", JSON.stringify(userSession));

        setMessage({ text: "¡Cuenta verificada! Entrando a tu armario...", success: true });
        
        // Redirección directa e ininterrumpida al armario digital principal
        setTimeout(() => {
          window.location.replace("/");
        }, 500);
      } else {
        setMessage({ text: res.message || "Código OTP incorrecto.", success: false });
        setLoading(false);
      }
    } catch (err) {
      setMessage({ text: "Error al verificar el código.", success: false });
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    const res = await resendOtp(registeredEmail);
    setMessage({ text: res.message, success: res.success });
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white px-4 py-8">
      <div className="relative max-w-md w-full bg-neutral-900 border border-neutral-800 p-8 rounded-3xl shadow-2xl">
        
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 text-neutral-950 font-black text-xl rounded-2xl flex items-center justify-center mb-3 shadow-lg">
            R
          </div>
          <h1 className="text-xl font-black tracking-widest text-white">RËVA PORTAL</h1>
          <p className="text-xs text-neutral-400 mt-1 text-center font-light">
            {step === "form" ? "Crea tu cuenta para acceder al armario digital" : "Verificación de seguridad por correo"}
          </p>
        </div>

        {message.text && (
          <div className={`p-3 mb-5 rounded-xl text-xs font-medium text-center border ${
            message.success ? "bg-amber-400/10 border-amber-400/30 text-amber-300" : "bg-red-950/50 border-red-900/40 text-red-300"
          }`}>
            {message.text}
          </div>
        )}

        {step === "form" ? (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-neutral-400 mb-1">Nombre Completo</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white outline-none focus:border-amber-400 transition"
                placeholder="Tu nombre"
              />
            </div>

            <div>
              <label className="block text-neutral-400 mb-1">Teléfono o Contacto</label>
              <input
                type="text"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white outline-none focus:border-amber-400 transition"
                placeholder="3001234567"
              />
            </div>

            <div>
              <label className="block text-neutral-400 mb-1">Tipo de Usuario / Rol</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white outline-none focus:border-amber-400 transition"
              >
                <option value="CLIENTE (Armario Personal)">CLIENTE (Armario Personal & Wishlist)</option>
                <option value="SELLER (Diseñador / Vendedor)">SELLER (Diseñador / Vendedor - Publicar Prendas)</option>
              </select>
            </div>

            <div>
              <label className="block text-neutral-400 mb-1">Correo Electrónico</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white outline-none focus:border-amber-400 transition"
                placeholder="correo@ejemplo.com"
              />
            </div>

            <div>
              <label className="block text-neutral-400 mb-1">Contraseña</label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white outline-none focus:border-amber-400 transition"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black rounded-xl transition cursor-pointer shadow-lg mt-2 disabled:opacity-50"
            >
              {loading ? "Registrando..." : "Registrarse y Enviar OTP"}
            </button>

            <div className="text-center pt-3">
              <p className="text-xs text-neutral-400">
                ¿Ya tienes cuenta?{" "}
                <a href="/login" className="text-amber-400 hover:underline font-semibold">
                  Inicia sesión
                </a>
              </p>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtpSubmit} className="space-y-4 text-xs">
            <p className="text-neutral-300 text-center text-xs">
              Hemos enviado un código de 6 dígitos a <span className="text-amber-400 font-bold">{registeredEmail}</span>.
            </p>

            <div>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-center text-lg tracking-widest font-black outline-none focus:border-amber-400 transition"
                placeholder="123456"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black rounded-xl transition cursor-pointer shadow-lg disabled:opacity-50"
            >
              {loading ? "Verificando..." : "Confirmar Código y Entrar"}
            </button>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleResend}
                className="text-neutral-400 hover:text-amber-400 underline transition text-xs"
              >
                Reenviar código
              </button>
              <button
                type="button"
                onClick={() => setStep("form")}
                className="text-neutral-400 hover:text-white underline transition text-xs"
              >
                Volver al registro
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}