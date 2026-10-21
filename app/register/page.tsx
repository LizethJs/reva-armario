"use client";

import { useState } from "react";
import { registerUser, verifyOtp, resendOtp } from "../actions/auth";

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

  const goToLogin = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    window.location.href = "/login";
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", success: false });

    try {
      const res = await registerUser(formData);

      if (res.redirectToOtp) {
        setEmailForOtp(res.email || formData.email);
        setStep("otp");
        setMessage({ text: res.message, success: true });
      } else {
        setMessage({ text: res.message, success: res.success });
      }
    } catch (error) {
      setMessage({ text: "Ocurrió un error en el servidor al procesar tu solicitud.", success: false });
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
      setMessage({ text: "Error al solicitar el reenvío del código OTP.", success: false });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="relative max-w-sm w-full bg-[#181818] p-8 rounded-2xl shadow-2xl border-t-2 border-amber-500">
        
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="w-12 h-12 bg-amber-500 text-black font-extrabold text-xl rounded-xl flex items-center justify-center mb-3 shadow-md shadow-amber-500/20">
            R
          </div>
          <h1 className="text-xl font-extrabold tracking-wider text-white">
            PORTAL RËVA
          </h1>
          <p className="text-xs text-zinc-400 mt-1 text-center font-light">
            {step === "form"
              ? "Acceso seguro al probador virtual"
              : `Ingresa el código enviado a ${emailForOtp}`}
          </p>
        </div>

        {message.text && (
          <div
            className={`p-3 mb-5 rounded-xl text-xs font-medium text-center border ${
              message.success
                ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                : "bg-red-950/50 border-red-800/60 text-red-300"
            }`}
          >
            {message.text}
          </div>
        )}

        {step === "form" ? (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-zinc-400 text-sm">👤</span>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#101010] border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:border-amber-500 outline-none text-xs transition"
                placeholder="Nombre completo"
              />
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-3 text-zinc-400 text-sm">📞</span>
              <input
                type="text"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#101010] border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:border-amber-500 outline-none text-xs transition"
                placeholder="Teléfono"
              />
            </div>

            <div>
              <label className="block text-[11px] text-zinc-400 mb-1 ml-1">
                Rol en la Plataforma:
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-[#101010] border border-zinc-800 rounded-xl text-white focus:border-amber-500 outline-none text-xs transition"
              >
                <option value="Cliente (Usuario Estándar)">Cliente (Usuario Estándar)</option>
                <option value="Diseñador / Marca">Diseñador / Marca</option>
              </select>
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-3 text-zinc-400 text-sm">✉️</span>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#101010] border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:border-amber-500 outline-none text-xs transition"
                placeholder="Correo electrónico"
              />
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-3 text-zinc-400 text-sm">🔒</span>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#101010] border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:border-amber-500 outline-none text-xs transition"
                placeholder="Contraseña"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#b38308] hover:bg-amber-600 text-black font-extrabold rounded-xl transition duration-200 disabled:opacity-50 text-xs cursor-pointer mt-2 shadow-md"
            >
              {loading ? "Procesando..." : "Continuar con Verificación OTP"}
            </button>

            <div className="text-center pt-3">
              <p className="text-xs text-zinc-400">
                ¿Ya tienes cuenta?{" "}
                <button
                  type="button"
                  onClick={goToLogin}
                  className="text-zinc-300 hover:text-amber-400 font-semibold underline transition cursor-pointer bg-transparent border-none p-0 inline"
                >
                  Inicia sesión
                </button>
              </p>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            {!isVerifiedSuccess ? (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs text-zinc-400 mb-2 text-center">
                    Código OTP de 6 dígitos
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    className="w-full px-4 py-3 bg-[#101010] border border-zinc-800 rounded-xl text-center tracking-[0.4em] text-xl font-bold text-amber-400 focus:border-amber-500 outline-none transition"
                    placeholder="123456"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#b38308] hover:bg-amber-600 text-black font-extrabold rounded-xl transition duration-200 disabled:opacity-50 text-xs cursor-pointer shadow-md"
                >
                  {loading ? "Validando..." : "Verificar Código OTP"}
                </button>

                <div className="text-center mt-3 space-y-2">
                  <div>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendLoading}
                      className="text-xs text-zinc-400 hover:text-amber-400 transition font-medium disabled:opacity-50 cursor-pointer bg-transparent border-none"
                    >
                      {resendLoading ? "Enviando..." : "¿No recibiste el código? Reenviar OTP"}
                    </button>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => setStep("form")}
                      className="text-xs text-amber-400 hover:underline font-semibold cursor-pointer bg-transparent border-none mr-3"
                    >
                      ← Cambiar datos
                    </button>
                    <button
                      type="button"
                      onClick={goToLogin}
                      className="text-xs text-zinc-400 hover:text-amber-400 underline font-semibold cursor-pointer bg-transparent border-none"
                    >
                      Inicia sesión
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="pt-2 text-center space-y-4">
                <button
                  type="button"
                  onClick={goToLogin}
                  className="w-full py-3 bg-[#b38308] hover:bg-amber-600 text-black font-extrabold text-center rounded-xl transition duration-200 text-xs shadow-md cursor-pointer"
                >
                  Iniciar Sesión de una vez
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}