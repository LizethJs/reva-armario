"use client";

import { useState } from "react";
import { loginUser, forgotPassword, resetPasswordWithOtp } from "../actions/auth";

export default function LoginPage() {
  const [view, setView] = useState<"login" | "forgot_email" | "forgot_otp">("login");
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [forgotEmail, setForgotEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await loginUser(formData);

      if (res && res.success && res.user) {
        localStorage.setItem("user_session", JSON.stringify(res.user));
        window.location.href = "/";
      } else {
        setErrorMessage(res?.message || "Correo o contraseña incorrectos.");
        setLoading(false);
      }
    } catch (err: any) {
      setErrorMessage("Error al conectar con la base de datos.");
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      setErrorMessage("Por favor ingresa tu correo electrónico.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await forgotPassword(forgotEmail);

      if (res && res.success) {
        setLoading(false);
        setView("forgot_otp");
        setSuccessMessage("✓ ¡Código OTP enviado literalmente a tu correo! Revisa tu bandeja.");
      } else {
        setErrorMessage(res?.message || "No se pudo enviar el correo de recuperación.");
        setLoading(false);
      }
    } catch (err: any) {
      setErrorMessage("Error al conectar con el servidor de correo.");
      setLoading(false);
    }
  };

  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const isPasswordValid = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(newPassword);
    if (!isPasswordValid) {
      setErrorMessage("La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo especial (@$!%*?&).");
      return;
    }

    setLoading(true);

    try {
      const res = await resetPasswordWithOtp({
        email: forgotEmail,
        otp: otpCode,
        newPassword: newPassword,
      });

      if (res && res.success) {
        setLoading(false);
        setSuccessMessage("✓ ¡Contraseña actualizada exitosamente! Redirigiendo al login...");
        setTimeout(() => {
          setView("login");
          setFormData({ email: forgotEmail, password: "" });
          setSuccessMessage("");
        }, 2500);
      } else {
        setErrorMessage(res?.message || "Código OTP incorrecto o expirado.");
        setLoading(false);
      }
    } catch (err: any) {
      setErrorMessage("Error al actualizar la contraseña en la base de datos.");
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
          <p className="text-xs text-zinc-400 mt-1">
            {view === "login" && "Acceso al armario digital y probador"}
            {view === "forgot_email" && "Recuperación de Contraseña (Paso 1)"}
            {view === "forgot_otp" && "Verificación OTP y Seguridad (Paso 2)"}
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 mb-4 rounded-xl text-xs font-medium text-center bg-red-950/50 border border-red-800 text-red-300">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="p-3 mb-4 rounded-xl text-xs font-medium text-center bg-emerald-950/60 border border-emerald-800 text-emerald-300">
            {successMessage}
          </div>
        )}

        {/* VISTA 1: INICIO DE SESIÓN */}
        {view === "login" && (
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
              disabled={loading}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-black font-extrabold rounded-xl text-xs transition cursor-pointer disabled:opacity-50"
            >
              {loading ? "Validando cuenta..." : "Iniciar Sesión"}
            </button>

            <div className="text-center pt-2 space-y-2">
              <p className="text-xs text-zinc-400">
                ¿No tienes cuenta? <a href="/register" className="text-amber-400 underline">Regístrate</a>
              </p>
              <p className="text-xs">
                <button
                  type="button"
                  onClick={() => { setView("forgot_email"); setErrorMessage(""); setSuccessMessage(""); }}
                  className="text-zinc-400 hover:text-amber-400 underline cursor-pointer"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </p>
            </div>
          </form>
        )}

        {/* VISTA 2: SOLICITAR CORREO PARA ENVÍO REAL */}
        {view === "forgot_email" && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <input
              type="email"
              required
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#101010] border border-zinc-800 rounded-xl text-white text-xs outline-none focus:border-amber-500"
              placeholder="Ingresa tu correo registrado"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-black font-extrabold rounded-xl text-xs transition cursor-pointer disabled:opacity-50"
            >
              {loading ? "Enviando correo real..." : "Enviar Código al Correo"}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => { setView("login"); setErrorMessage(""); setSuccessMessage(""); }}
                className="text-xs text-amber-400 underline cursor-pointer"
              >
                ← Volver al Inicio de Sesión
              </button>
            </div>
          </form>
        )}

        {/* VISTA 3: INGRESAR OTP Y NUEVA CONTRASEÑA CON VALIDACIÓN */}
        {view === "forgot_otp" && (
          <form onSubmit={handleVerifyAndReset} className="space-y-4">
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1.5 font-medium">
                Código OTP (6 Dígitos)
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#101010] border border-zinc-800 rounded-xl text-white text-xs outline-none tracking-widest text-center font-mono focus:border-amber-500"
                placeholder="123456"
              />
            </div>

            <div>
              <label className="block text-[11px] text-zinc-400 mb-1.5 font-medium">
                Nueva Contraseña (Mín. 8 caracteres, Mayúscula, Número y Símbolo)
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#101010] border border-zinc-800 rounded-xl text-white text-xs outline-none focus:border-amber-500"
                placeholder="Ej: Reva2026*"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-black font-extrabold rounded-xl text-xs transition cursor-pointer disabled:opacity-50"
            >
              {loading ? "Actualizando..." : "Confirmar Cambio"}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => { setView("forgot_email"); setErrorMessage(""); setSuccessMessage(""); }}
                className="text-xs text-zinc-400 underline cursor-pointer"
              >
                ← Reintentar con otro correo
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}