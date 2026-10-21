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
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="max-w-md w-full bg-zinc-900 p-8 rounded-2xl shadow-2xl border border-yellow-500/20">
        
        <h2 className="text-3xl font-extrabold mb-2 text-center text-yellow-400 tracking-wide">
          {step === "form" ? "Crear una cuenta en RËVA" : "Verifica tu Correo"}
        </h2>
        <p className="text-xs text-zinc-400 mb-6 text-center">
          {step === "form"
            ? "Ingresa tus datos para comenzar tu experiencia virtual"
            : `Hemos enviado un código de 6 dígitos a ${emailForOtp}`}
        </p>

        {/* Mensajes de Alerta */}
        {message.text && (
          <div
            className={`p-3 mb-5 rounded-xl text-xs font-medium text-center border ${
              message.success
                ? "bg-yellow-500/10 border-yellow-500/50 text-yellow-300"
                : "bg-red-500/10 border-red-500/50 text-red-400"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* VISTA 1: Formulario de Registro */}
        {step === "form" ? (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Nombre Completo</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-white placeholder-zinc-500 outline-none transition"
                placeholder="Tu nombre"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Teléfono</label>
              <input
                type="text"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-white placeholder-zinc-500 outline-none transition"
                placeholder="3001234567"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Rol</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-white outline-none transition"
              >
                <option value="Cliente (Usuario Estándar)">Cliente (Usuario Estándar)</option>
                <option value="Diseñador / Marca">Diseñador / Marca</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Correo Electrónico</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-white placeholder-zinc-500 outline-none transition"
                placeholder="correo@ejemplo.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Contraseña</label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-white placeholder-zinc-500 outline-none transition"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-xl transition duration-200 disabled:opacity-50 mt-2 shadow-lg shadow-yellow-500/10"
            >
              {loading ? "Procesando registro..." : "Registrarse"}
            </button>

            <p className="text-center text-xs text-zinc-400 mt-4">
              ¿Ya tienes una cuenta?{" "}
              <Link href="/login" className="text-yellow-400 hover:underline font-semibold">
                Inicia sesión
              </Link>
            </p>
          </form>
        ) : (
          /* VISTA 2: Código OTP y Verificación */
          <div className="space-y-4">
            {!isVerifiedSuccess ? (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1 text-center">
                    Código OTP (6 dígitos)
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-center tracking-widest text-2xl font-bold focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-yellow-400 outline-none transition"
                    placeholder="123456"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-xl transition duration-200 disabled:opacity-50 shadow-lg shadow-yellow-500/10"
                >
                  {loading ? "Verificando..." : "Verificar Cuenta"}
                </button>

                <div className="text-center mt-3">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendLoading}
                    className="text-xs text-yellow-400 hover:underline font-medium disabled:opacity-50"
                  >
                    {resendLoading ? "Enviando..." : "¿No recibiste el código? Reenviar código OTP"}
                  </button>
                </div>
              </form>
            ) : (
              /* Botón directo una vez verificado */
              <div className="pt-2 text-center space-y-4">
                <Link
                  href="/login"
                  className="block w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-center rounded-xl transition duration-200 shadow-lg shadow-yellow-500/20"
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