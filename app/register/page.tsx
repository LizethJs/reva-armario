"use client";

import { useState } from "react";
import { registerUser, verifyOtp, resendOtp } from "../actions/auth";

export default function RegisterPage() {
  const [step, setStep] = useState<"form" | "otp">("form");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    role: "SELLER (Diseñador / Vendedor)",
    email: "",
    password: "",
  });

  const [otp, setOtp] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("SELLER");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", success: false });

  // Expresiones Regulares para Sanitización y Validación de Entrada
  const isNameValid = /^[a-zA-AáéíóúÁÉÍÓÚñÑ\s]{3,50}$/.test(formData.name.trim());
  const isPhoneValid = /^[3][0-9]{9}$/.test(formData.phone.trim()); // 10 dígitos numéricos comenzando en 3
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim());
  const isPasswordValid = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!\%*?&]{8,}$/.test(formData.password);

  const isFormValid = isNameValid && isPhoneValid && isEmailValid && isPasswordValid;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      setMessage({
        text: "Por favor corrige los campos en rojo antes de enviar.",
        success: false,
      });
      return;
    }

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
        setMessage({ text: res.message || "Error al procesar el registro.", success: false });
      }
    } catch (err) {
      setMessage({ text: "Fallo de comunicación con el servidor.", success: false });
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
        const userSession = {
          name: userName || "Usuario RËVA",
          email: registeredEmail,
          role: userRole,
        };
        localStorage.setItem("user_session", JSON.stringify(userSession));
        setMessage({ text: "¡Cuenta verificada exitosamente! Entrando...", success: true });

        setTimeout(() => {
          window.location.href = "/";
        }, 400);
      } else {
        setMessage({ text: res.message || "Código OTP incorrecto o expirado.", success: false });
      }
    } catch (err) {
      setMessage({ text: "Error en la validación del código.", success: false });
    } finally {
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
          <h1 className="text-xl font-black tracking-widest text-white">PORTAL RËVA</h1>
          <p className="text-xs text-neutral-400 mt-1 text-center">
            {step === "form" ? "Registro seguro de usuarios" : "Verificación OTP requerida"}
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
                className={`w-full px-3.5 py-2.5 bg-neutral-950 border rounded-xl text-white outline-none transition ${
                  formData.name && !isNameValid ? "border-red-500" : "border-neutral-800 focus:border-amber-400"
                }`}
                placeholder="Ej: Paula Gómez"
              />
              {formData.name && !isNameValid && (
                <p className="text-[10px] text-red-400 mt-1">Solo letras y espacios (mínimo 3 caracteres).</p>
              )}
            </div>

            <div>
              <label className="block text-neutral-400 mb-1">Teléfono Móvil</label>
              <input
                type="text"
                name="phone"
                maxLength={10}
                required
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-3.5 py-2.5 bg-neutral-950 border rounded-xl text-white outline-none transition ${
                  formData.phone && !isPhoneValid ? "border-red-500" : "border-neutral-800 focus:border-amber-400"
                }`}
                placeholder="3001234567"
              />
              {formData.phone && !isPhoneValid && (
                <p className="text-[10px] text-red-400 mt-1">Formato inválido. Debe ser de 10 dígitos (ej: 3001234567).</p>
              )}
            </div>

            <div>
              <label className="block text-neutral-400 mb-1">Rol de Acceso</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white outline-none focus:border-amber-400 transition"
              >
                <option value="SELLER (Diseñador / Vendedor)">SELLER (Diseñador / Vendedor)</option>
                <option value="CLIENTE (Armario Personal)">CLIENTE (Armario Personal)</option>
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
                className={`w-full px-3.5 py-2.5 bg-neutral-950 border rounded-xl text-white outline-none transition ${
                  formData.email && !isEmailValid ? "border-red-500" : "border-neutral-800 focus:border-amber-400"
                }`}
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
                className={`w-full px-3.5 py-2.5 bg-neutral-950 border rounded-xl text-white outline-none transition ${
                  formData.password && !isPasswordValid ? "border-red-500" : "border-neutral-800 focus:border-amber-400"
                }`}
                placeholder="••••••••"
              />
              {formData.password && !isPasswordValid && (
                <div className="text-[10px] text-red-400 mt-1 space-y-0.5">
                  <p>La contraseña debe incluir:</p>
                  <p>• Mínimo 8 caracteres</p>
                  <p>• Al menos 1 mayúscula, 1 número y 1 símbolo (@$!%*?&)</p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black rounded-xl transition cursor-pointer shadow-lg mt-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "Procesando..." : "Registrarse y Enviar OTP"}
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
              Ingresa el código OTP enviado a <span className="text-amber-400 font-bold">{registeredEmail}</span>.
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
              disabled={loading || otp.trim().length !== 6}
              className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black rounded-xl transition cursor-pointer shadow-lg disabled:opacity-40"
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
                Volver
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}