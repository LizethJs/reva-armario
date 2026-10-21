"use client";

import { useState } from "react";
import { registerUser, verifyOtp, resendOtp } from "../actions/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  
  const [step, setStep] = useState<"form" | "otp">("form");
  const [emailForOtp, setEmailForOtp] = useState("");
  const [isVerifiedSuccess, setIsVerifiedSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    role: "Cliente (Usuario Estándar)",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", success: false });
  const [otpInput, setOtpInput] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", success: false });

    try {
      const res = await registerUser(formData);

      if (res.success && res.redirectToOtp) {
        setEmailForOtp(res.email || formData.email);
        setStep("otp");
        setMessage({ text: res.message, success: true });
      } else {
        setMessage({ text: res.message, success: false });
      }
    } catch (error) {
      setMessage({ text: "Ocurrió un error inesperado al registrarse.", success: false });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", success: false });

    try {
      const res = await verifyOtp(emailForOtp, otpInput);

      if (res.success) {
        setMessage({ text: res.message, success: true });
        setIsVerifiedSuccess(true);
      } else {
        setMessage({ text: res.message, success: false });
      }
    } catch (error) {
      setMessage({ text: "Error al validar el código OTP.", success: false });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    setMessage({ text: "", success: false });

    try {
      const res = await resendOtp(emailForOtp);
      setMessage({ text: res.message, success: res.success });
    } catch (error) {
      setMessage({ text: "Error al solicitar reenvío de OTP.", success: false });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4 selection:bg-yellow-400 selection:text-black">
      {/* Fondo con resplandor sutil amarillo estilo RËVA */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-500/10 via-black to-black pointer-events-none" />

      <div className="relative max-w-md w-full bg-zinc-950/80 backdrop-blur-xl p-8 rounded-3xl border border-yellow-500/20 shadow-[0_0_50px_-12px_rgba(234,179,8,0.15)]">
        
        {/* Header con marca RËVA */}
        <div className="text-center mb-8">
          <span className="inline-block text-[10px] uppercase tracking-[0.3em] font-bold text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-full border border-yellow-500/20 mb-3">
            Plataforma RËVA
          </span>
          <h2 className="text-3xl font-black text-white tracking-tight">
            {step === "form" ? "Crear Cuenta" : "Verificación OTP"}
          </h2>
          <p className="text-xs text-zinc-400 mt-2 font-light">
            {step === "form"
              ? "Ingresa tus datos para acceder al probador virtual"
              : `Hemos enviado un código de 6 dígitos a ${emailForOtp}`}
          </p>
        </div>

        {/* Notificaciones de estado */}
        {message.text && (
          <div
            className={`p-3.5 mb-6 rounded-2xl text-xs font-medium text-center border backdrop-blur-md transition-all ${
              message.success
                ? "bg-yellow-400/10 border-yellow-400/40 text-yellow-300"
                : "bg-red-500/10 border-red-500/40 text-red-400"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* VISTA 1: Formulario de Registro */}
        {step === "form" ? (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-zinc-400 mb-1.5">
                Nombre Completo
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-zinc-900/90 border border-zinc-800 rounded-xl focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-white placeholder-zinc-600 outline-none transition text-sm font-light"
                placeholder="Ej. Valeria Gómez"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-zinc-400 mb-1.5">
                Teléfono
              </label>
              <input
                type="text"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-zinc-900/90 border border-zinc-800 rounded-xl focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-white placeholder-zinc-600 outline-none transition text-sm font-light"
                placeholder="3001234567"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-zinc-400 mb-1.5">
                Rol
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-zinc-900/90 border border-zinc-800 rounded-xl focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-white outline-none transition text-sm font-light"
              >
                <option value="Cliente (Usuario Estándar)">Cliente (Usuario Estándar)</option>
                <option value="Diseñador / Marca">Diseñador / Marca</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-zinc-400 mb-1.5">
                Correo Electrónico
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-zinc-900/90 border border-zinc-800 rounded-xl focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-white placeholder-zinc-600 outline-none transition text-sm font-light"
                placeholder="correo@ejemplo.com"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-zinc-400 mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-zinc-900/90 border border-zinc-800 rounded-xl focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-white placeholder-zinc-600 outline-none transition text-sm font-light"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold rounded-xl transition-all duration-300 disabled:opacity-50 mt-4 text-sm tracking-wide shadow-[0_0_20px_rgba(250,204,21,0.3)] hover:shadow-[0_0_25px_rgba(250,204,21,0.5)] active:scale-[0.99]"
            >
              {loading ? "Procesando registro..." : "REGISTRARSE"}
            </button>

            {/* Enlace directo a Login */}
            <div className="pt-2 text-center">
              <p className="text-xs text-zinc-400">
                ¿Ya tienes una cuenta?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="text-yellow-400 hover:text-yellow-300 underline font-semibold transition cursor-pointer"
                >
                  Iniciar sesión
                </button>
              </p>
            </div>
          </form>
        ) : (
          /* VISTA 2: Inserción de OTP y acceso directo */
          <div className="space-y-4">
            {!isVerifiedSuccess ? (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-zinc-400 mb-2 text-center">
                    Código de 6 dígitos
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    className="w-full px-4 py-3.5 bg-zinc-900/90 border border-zinc-800 rounded-xl text-center tracking-[0.4em] text-2xl font-black focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-yellow-400 outline-none transition"
                    placeholder="123456"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold rounded-xl transition-all duration-300 disabled:opacity-50 text-sm tracking-wide shadow-[0_0_20px_rgba(250,204,21,0.3)] hover:shadow-[0_0_25px_rgba(250,204,21,0.5)] active:scale-[0.99]"
                >
                  {loading ? "Verificando..." : "VERIFICAR CUENTA"}
                </button>

                <div className="text-center mt-3">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendLoading}
                    className="text-xs text-zinc-400 hover:text-yellow-400 transition font-medium disabled:opacity-50 cursor-pointer"
                  >
                    {resendLoading ? "Enviando..." : "¿No recibiste el código? Reenviar OTP"}
                  </button>
                </div>
              </form>
            ) : (
              /* Botón de acceso inmediato a la app tras verificar */
              <div className="pt-2 text-center space-y-4">
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="w-full py-3.5 bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold text-center rounded-xl transition-all duration-300 text-sm tracking-wide shadow-[0_0_25px_rgba(250,204,21,0.4)] cursor-pointer active:scale-[0.99]"
                >
                  INICIAR SESIÓN AHORA
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}