"use client";

import { useState } from "react";
import { registerUser, verifyOtp, resendOtp } from "@/app/actions/authActions";

export default function AuthPage() {
  const [isRegistering, setIsRegistering] = useState(true); // Alterna entre Registro y Login
  const [step, setStep] = useState<"form" | "otp">("form"); // 'form' o 'otp'

  // Estados del Formulario de Registro
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    role: "Cliente (Usuario Estándar)",
    email: "",
    password: "",
  });

  // Estados de Verificación OTP
  const [activeEmail, setActiveEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");

  // Mensajes de Alerta/Estado
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Manejador del Registro
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    const res = await registerUser(formData);
    setLoading(false);

    if (res.success && res.redirectToOtp) {
      setActiveEmail(res.email || formData.email);
      setSuccessMessage(res.message);
      setStep("otp");
    } else {
      setErrorMessage(res.message);
    }
  };

  // Manejador de Confirmación de OTP
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    const res = await verifyOtp(activeEmail, otpCode);
    setLoading(false);

    if (res.success) {
      setSuccessMessage(res.message);
      setTimeout(() => {
        setStep("form");
        setIsRegistering(false); // Redirigir al inicio de sesión
        setSuccessMessage("Cuenta verificada. Por favor ingresa tus credenciales.");
      }, 2000);
    } else {
      setErrorMessage(res.message);
    }
  };

  // Manejador para Reenviar OTP manualmente
  const handleResend = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    const res = await resendOtp(activeEmail);
    setLoading(false);

    if (res.success) {
      setSuccessMessage(res.message);
    } else {
      setErrorMessage(res.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4 text-white">
      <div className="w-full max-w-md rounded-2xl bg-zinc-900/90 p-8 shadow-2xl border border-zinc-800">
        
        {/* Encabezado Logo */}
        <div className="text-center mb-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500 text-black font-bold text-xl mb-2">
            R
          </div>
          <h1 className="text-2xl font-black tracking-wider uppercase">PORTAL RËVA</h1>
          <p className="text-xs text-zinc-400 mt-1">
            {step === "otp"
              ? "Ingresa el código enviado a tu correo"
              : isRegistering
              ? "Registro de cuenta con validación OTP"
              : "Iniciar Sesión"}
          </p>
        </div>

        {/* Mensajes de Estado */}
        {errorMessage && (
          <div className="mb-4 rounded-lg bg-red-950/80 border border-red-800 p-3 text-xs text-red-200">
            ⚠️ {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 rounded-lg bg-emerald-950/80 border border-emerald-800 p-3 text-xs text-emerald-200">
            ✅ {successMessage}
          </div>
        )}

        {/* PASO 1: VISTA DE CÓDIGO OTP */}
        {step === "otp" ? (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Código de Verificación (OTP) enviado a <span className="text-amber-400">{activeEmail}</span>
              </label>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                required
                className="w-full rounded-xl bg-zinc-800 px-4 py-3 text-center text-2xl tracking-widest font-mono text-white placeholder-zinc-500 border border-zinc-700 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-amber-500 py-3 font-semibold text-black transition hover:bg-amber-400 disabled:opacity-50"
            >
              {loading ? "Validando..." : "Verificar y Completar Registro"}
            </button>

            <div className="text-center mt-3">
              <button
                type="button"
                onClick={handleResend}
                disabled={loading}
                className="text-xs text-amber-500 hover:underline"
              >
                ¿No recibiste el código? Volver a enviar
              </button>
            </div>
          </form>
        ) : (
          /* PASO 2: FORMULARIO DE REGISTRO / LOGIN */
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            {isRegistering && (
              <>
                <div>
                  <input
                    type="text"
                    name="name"
                    placeholder="Nombre completo"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-xl bg-zinc-800/80 px-4 py-2.5 text-sm text-white border border-zinc-700 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    name="phone"
                    placeholder="Teléfono"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-xl bg-zinc-800/80 px-4 py-2.5 text-sm text-white border border-zinc-700 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Rol en la Plataforma:</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full rounded-xl bg-zinc-800/80 px-4 py-2.5 text-sm text-white border border-zinc-700 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Cliente (Usuario Estándar)">Cliente (Usuario Estándar)</option>
                    <option value="Administrador">Administrador</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <input
                type="email"
                name="email"
                placeholder="Correo electrónico"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full rounded-xl bg-zinc-800/80 px-4 py-2.5 text-sm text-white border border-zinc-700 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <input
                type="password"
                name="password"
                placeholder="Contraseña"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full rounded-xl bg-zinc-800/80 px-4 py-2.5 text-sm text-white border border-zinc-700 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-amber-500 py-3 font-semibold text-black transition hover:bg-amber-400 disabled:opacity-50 mt-2"
            >
              {loading
                ? "Procesando..."
                : isRegistering
                ? "Continuar con Verificación OTP"
                : "Iniciar Sesión"}
            </button>
          </form>
        )}

        {/* Conmutador entre Registro y Login */}
        {step === "form" && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setErrorMessage("");
                setSuccessMessage("");
              }}
              className="text-xs text-zinc-400 hover:text-amber-400 transition"
            >
              {isRegistering
                ? "¿Ya tienes cuenta? Inicia sesión"[cite: 8]
                : "¿No tienes cuenta? Regístrate aquí"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}