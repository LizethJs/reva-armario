"use client";

import { useState } from "react";
import { loginUser, forgotPassword, resetPasswordWithOtp, resendOtp } from "../actions/auth";

export default function LoginPage() {
  const [view, setView] = useState<"login" | "forgot_email" | "forgot_otp">("login");
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [forgotEmail, setForgotEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [emailInputError, setEmailInputError] = useState("");

  const hasMinLength = newPassword.length >= 8;
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasNumberOrSymbol = /(?=.*\d)(?=.*[@$!%*?&])/.test(newPassword);

  const validateEmailInput = (value: string) => {
    const forbiddenCharsRegex = /[!#$%^&*()+=\[\]{};':"\\|,<>/?`~]/;
    
    if (forbiddenCharsRegex.test(value)) {
      setEmailInputError("⚠️ Error: El campo contiene caracteres especiales no permitidos.");
    } else {
      setEmailInputError("");
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, email: value });
    validateEmailInput(value);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInputError) return;

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await loginUser(formData);

      if (res && res.success && res.user) {
        localStorage.setItem("user_session", JSON.stringify(res.user));
        
        if (res.user.role === "ADMIN") {
          window.location.href = "/admin";
        } else {
          window.location.href = res.redirectTo || "/";
        }
      } else {
        setErrorMessage(res?.message || "Credenciales incorrectas. Verifique sus datos.");
        setLoading(false);
      }
    } catch (err: any) {
      setErrorMessage("Error de conexión con el servidor de base de datos.");
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      setErrorMessage("Por favor, ingrese su correo electrónico institucional o registrado.");
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
        setSuccessMessage("✓ Código OTP de verificación enviado de forma segura a su bandeja de correo.");
      } else {
        setErrorMessage(res?.message || "No se pudo procesar la solicitud de recuperación.");
        setLoading(false);
      }
    } catch (err: any) {
      setErrorMessage("Error crítico al despachar el correo de verificación.");
      setLoading(false);
    }
  };

  const handleResendOtpCode = async () => {
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await resendOtp(forgotEmail);
      if (res && res.success) {
        setSuccessMessage("✓ Nuevo código OTP reenviado a su correo exitosamente.");
      } else {
        setErrorMessage(res?.message || "No se pudo reenviar el código.");
      }
    } catch (err) {
      setErrorMessage("Error al conectar con el servidor para el reenvío.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!hasMinLength || !hasUpperCase || !hasNumberOrSymbol) {
      setErrorMessage("La nueva contraseña no cumple con todos los protocolos de seguridad requeridos.");
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
        setSuccessMessage("✓ Contraseña actualizada exitosamente. Redirigiendo al portal...");
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
      setErrorMessage("Error al actualizar las credenciales en el sistema.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4 py-8">
      <div className="relative max-w-md w-full bg-[#181818] p-8 rounded-2xl shadow-2xl border-t-2 border-amber-500">
        
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="w-12 h-12 bg-amber-500 text-black font-extrabold text-xl rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-amber-500/20">
            R
          </div>
          <h1 className="text-xl font-extrabold tracking-wider text-white">PORTAL RËVA</h1>
          <p className="text-xs text-zinc-400 mt-1">
            {view === "login" && "Gestión de identidad y acceso digital (Sesión: 5 min)"}
            {view === "forgot_email" && "Recuperación de Credenciales (Paso 1)"}
            {view === "forgot_otp" && "Doble Factor de Autenticación (Paso 2)"}
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

        {view === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1.5 font-medium">Correo Electrónico o Usuario</label>
              <input
                type="text"
                name="email"
                required
                value={formData.email}
                onChange={handleEmailChange}
                className={`w-full px-3.5 py-2.5 bg-[#101010] border rounded-xl text-white text-xs outline-none transition ${
                  emailInputError ? "border-red-500 focus:border-red-500" : "border-zinc-800 focus:border-amber-500"
                }`}
                placeholder="usuario@reva.com"
              />
              {emailInputError && (
                <p className="text-[11px] text-red-400 mt-1.5 font-medium animate-pulse">
                  {emailInputError}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[11px] text-zinc-400 mb-1.5 font-medium">Contraseña</label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#101010] border border-zinc-800 rounded-xl text-white text-xs outline-none focus:border-amber-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading || Boolean(emailInputError)}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-black font-extrabold rounded-xl text-xs transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Validando credenciales..." : "Iniciar Sesión"}
            </button>

            <div className="text-center pt-3 space-y-2">
              <p className="text-xs text-zinc-400">
                ¿No cuenta con un registro? <a href="/register" className="text-amber-400 underline hover:text-amber-300">Crear cuenta</a>
              </p>
              <p className="text-xs">
                <button
                  type="button"
                  onClick={() => { setView("forgot_email"); setErrorMessage(""); setSuccessMessage(""); }}
                  className="text-zinc-400 hover:text-amber-400 underline cursor-pointer"
                >
                  ¿Olvidó su contraseña?
                </button>
              </p>
            </div>
          </form>
        )}

        {view === "forgot_email" && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1.5 font-medium">Correo Electrónico Registrado</label>
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#101010] border border-zinc-800 rounded-xl text-white text-xs outline-none focus:border-amber-500"
                placeholder="usuario@reva.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-black font-extrabold rounded-xl text-xs transition cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? "Despachando código..." : "Enviar Código de Verificación"}
            </button>

            <div className="text-center pt-3">
              <button
                type="button"
                onClick={() => { setView("login"); setErrorMessage(""); setSuccessMessage(""); }}
                className="text-xs text-amber-400 underline hover:text-amber-300 cursor-pointer"
              >
                ← Regresar al Inicio de Sesión
              </button>
            </div>
          </form>
        )}

        {view === "forgot_otp" && (
          <form onSubmit={handleVerifyAndReset} className="space-y-4">
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1.5 font-medium">Código OTP (6 Dígitos)</label>
              <input
                type="text"
                required
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#101010] border border-zinc-800 rounded-xl text-white text-xs tracking-widest text-center font-mono outline-none focus:border-amber-500"
                placeholder="123456"
              />
              <div className="flex justify-between items-center mt-1.5 px-1">
                <span className="text-[10px] text-zinc-400">Vigencia del código: 5 minutos</span>
                <button
                  type="button"
                  onClick={handleResendOtpCode}
                  disabled={loading}
                  className="text-[10px] text-amber-400 underline hover:text-amber-300 cursor-pointer"
                >
                  ¿No llegó? Reenviar código
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-zinc-400 mb-1.5 font-medium">Nueva Contraseña</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#101010] border border-zinc-800 rounded-xl text-white text-xs outline-none focus:border-amber-500"
                placeholder="••••••••"
              />
              
              <div className="mt-2.5 p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-[10px] space-y-1.5">
                <p className="font-semibold text-zinc-300 mb-1">Verificación de seguridad en tiempo real:</p>
                <p className={hasMinLength ? "text-emerald-400 font-medium" : "text-zinc-400"}>
                  {hasMinLength ? "✓" : "○"} Mínimo 8 caracteres de longitud
                </p>
                <p className={hasUpperCase ? "text-emerald-400 font-medium" : "text-zinc-400"}>
                  {hasUpperCase ? "✓" : "○"} Al menos una letra mayúscula
                </p>
                <p className={hasNumberOrSymbol ? "text-emerald-400 font-medium" : "text-zinc-400"}>
                  {hasNumberOrSymbol ? "✓" : "○"} Al menos un número y un símbolo especial (@$!%*?&)
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-black font-extrabold rounded-xl text-xs transition cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? "Actualizando credenciales..." : "Confirmar y Restablecer"}
            </button>

            <div className="text-center pt-3">
              <button
                type="button"
                onClick={() => { setView("forgot_email"); setErrorMessage(""); setSuccessMessage(""); }}
                className="text-xs text-zinc-400 underline hover:text-amber-400 cursor-pointer"
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