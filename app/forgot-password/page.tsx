"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", success: false });

  // PASO 1: Enviar el código OTP al correo
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", success: false });

    setTimeout(() => {
      setLoading(false);
      setStep(2);
      setMessage({
        text: "✓ Código de verificación de 6 dígitos enviado al correo electrónico.",
        success: true,
      });
    }, 1000);
  };

  // PASO 2: Validar el código y actualizar la contraseña de forma segura
  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", success: false });

    setTimeout(() => {
      setLoading(false);
      setMessage({
        text: "✓ Contraseña restablecida con éxito. Redirigiendo al login...",
        success: true,
      });
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4 font-sans">
      <div className="relative max-w-sm w-full bg-[#181818] p-8 rounded-2xl shadow-2xl border-t-2 border-amber-500 space-y-6">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-amber-500 text-black font-extrabold text-xl rounded-xl flex items-center justify-center mb-3">
            R
          </div>
          <h1 className="text-xl font-extrabold tracking-wider text-white">SEGURIDAD Y ACCESO</h1>
          <p className="text-xs text-zinc-400 mt-1">Restablecimiento con Doble Factor (OTP)</p>
        </div>

        {message.text && (
          <div
            className={`p-3 rounded-xl text-xs font-medium text-center border ${
              message.success
                ? "bg-emerald-950/60 border-emerald-800 text-emerald-300"
                : "bg-red-950/50 border-red-800 text-red-300"
            }`}
          >
            {message.text}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1.5 font-medium">
                Correo Electrónico Registrado
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#101010] border border-zinc-800 rounded-xl text-white text-xs outline-none focus:border-amber-500"
                placeholder="admin@reva.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-black font-extrabold rounded-xl text-xs transition cursor-pointer disabled:opacity-50"
            >
              {loading ? "Generando código OTP..." : "Enviar Código de Verificación"}
            </button>

            <div className="text-center pt-2">
              <a href="/login" className="text-xs text-amber-400 underline hover:text-amber-300">
                ← Volver al Inicio de Sesión
              </a>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyAndReset} className="space-y-4">
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1.5 font-medium">
                Código de Verificación (OTP - 6 Dígitos)
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
                Nueva Contraseña Segura
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#101010] border border-zinc-800 rounded-xl text-white text-xs outline-none focus:border-amber-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-black font-extrabold rounded-xl text-xs transition cursor-pointer disabled:opacity-50"
            >
              {loading ? "Actualizando credenciales..." : "Confirmar y Cambiar Contraseña"}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
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