"use client";

import { useState } from "react";
import { registerUser, verifyOtp, resendOtp } from "../actions/auth";
import Link from "next/link";

export default function RegisterPage() {
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
      setMessage({ text: "Ocurrió un error en el servidor.", success: false });
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
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="max-w-md w-full bg-[#121316] p-8 rounded-3xl border border-zinc-800 shadow-2xl">
        
        {/* LOGO E INSI GNIA DE TU CAPTURA */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="w-14 h-14 bg-[#facc15] text-black font-black text-2xl rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-yellow-500/10">
            R
          </div>
          <h1 className="text-2xl font-extrabold tracking-wider text-white">
            PORTAL RËVA
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            {step === "form"
              ? "Registro de cuenta con validación OTP"
              : `Código de verificación enviado a ${emailForOtp}`}
          </p>
        </div>

        {/* ALERTA VISUAL IDÉNTICA A TU CAPTURA */}
        {message.text && (
          <div
            className={`p-3.5 mb-6 rounded-2xl text-xs font-medium text-center border ${
              message.success
                ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-300"
                : "bg-red-950/40 border-red-800/60 text-red-300"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <span>⚠️</span>
              <span>{message.text}</span>
            </div>
          </div>
        )}

        {/* VISTA 1: FORMULARIO */}
        {step === "form" ? (
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Nombre */}
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-zinc-500 text-sm">👤</span>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 bg-[#181a1f] border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:border-yellow-400 outline-none text-sm font-light transition"
                placeholder="Nombre completo"
              />
            </div>

            {/* Teléfono */}
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-zinc-500 text-sm">📞</span>
              <input
                type="text"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 bg-[#181a1f] border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:border-yellow-400 outline-none text-sm font-light transition"
                placeholder="Teléfono"
              />
            </div>

            {/* Rol */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1 ml-1">
                Rol en la Plataforma:
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#181a1f] border border-zinc-800 rounded-xl text-white focus:border-yellow-400 outline-none text-sm font-light transition"
              >
                <option value="Cliente (Usuario Estándar)">Cliente (Usuario Estándar)</option>
                <option value="Diseñador / Marca">Diseñador / Marca</option>
              </select>
            </div>

            {/* Correo */}
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-zinc-500 text-sm">✉️</span>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 bg-[#181a1f] border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:border-yellow-400 outline-none text-sm font-light transition"
                placeholder="Correo electrónico"
              />
            </div>

            {/* Contraseña */}
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-zinc-500 text-sm">🔒</span>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 bg-[#181a1f] border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:border-yellow-400 outline-none text-sm font-light transition"
                placeholder="Contraseña"
              />
            </div>

            {/* BOTÓN AMARILLO DE TU CAPTURA */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#facc15] hover:bg-yellow-300 text-black font-extrabold rounded-xl transition duration-200 disabled:opacity-50 text-sm cursor-pointer mt-2 shadow-md shadow-yellow-500/10"
            >
              {loading ? "Procesando..." : "Continuar con Verificación OTP"}
            </button>

            {/* ENLACE FUNCIONAL A LOGIN */}
            <div className="text-center pt-3">
              <p className="text-xs text-zinc-400">
                ¿Ya tienes cuenta?{" "}
                <Link
                  href="/login"
                  className="text-zinc-300 hover:text-yellow-400 font-semibold underline transition cursor-pointer"
                >
                  Inicia sesión
                </Link>
              </p>
            </div>
          </form>
        ) : (
          /* VISTA 2: CÓDIGO OTP */
          <div className="space-y-4">
            {!isVerifiedSuccess ? (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-2 text-center">
                    Ingresa el código OTP (6 dígitos)
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    className="w-full px-4 py-3.5 bg-[#181a1f] border border-zinc-800 rounded-xl text-center tracking-[0.4em] text-2xl font-black text-yellow-400 focus:border-yellow-400 outline-none transition"
                    placeholder="123456"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#facc15] hover:bg-yellow-300 text-black font-extrabold rounded-xl transition duration-200 disabled:opacity-50 text-sm cursor-pointer shadow-md"
                >
                  {loading ? "Validando..." : "Verificar Código OTP"}
                </button>

                <div className="text-center mt-3 space-y-2">
                  <div>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendLoading}
                      className="text-xs text-zinc-400 hover:text-yellow-400 transition font-medium disabled:opacity-50 cursor-pointer"
                    >
                      {resendLoading ? "Enviando..." : "¿No recibiste el código? Reenviar OTP"}
                    </button>
                  </div>
                  <div>
                    <Link
                      href="/login"
                      className="text-xs text-yellow-400 hover:underline font-semibold"
                    >
                      Volver a Iniciar Sesión
                    </Link>
                  </div>
                </div>
              </form>
            ) : (
              /* TRAS VERIFICAR CON ÉXITO */
              <div className="pt-2 text-center space-y-4">
                <Link
                  href="/login"
                  className="block w-full py-3.5 bg-[#facc15] hover:bg-yellow-300 text-black font-extrabold text-center rounded-xl transition duration-200 text-sm shadow-md"
                >
                  Iniciar Sesión de una vez
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}