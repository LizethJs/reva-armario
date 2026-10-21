"use client";

import { useState } from "react";
import { registerUser, verifyOtp } from "@/actions/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  
  // Estados del formulario y vistas
  const [step, setStep] = useState<"form" | "otp">("form");
  const [emailForOtp, setEmailForOtp] = useState("");
  
  // Datos del formulario de registro
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    role: "Cliente (Usuario Estándar)",
    email: "",
    password: "",
  });

  // Estados de UI (Carga y Mensajes)
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", success: false });
  const [otpInput, setOtpInput] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Manejar el envío del registro
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

  // Manejar la verificación del código OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", success: false });

    try {
      const res = await verifyOtp(emailForOtp, otpInput);

      if (res.success) {
        setMessage({ text: res.message, success: true });
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setMessage({ text: res.message, success: false });
      }
    } catch (error) {
      setMessage({ text: "Error al validar el código OTP.", success: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white px-4">
      <div className="max-w-md w-full bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700">
        
        <h2 className="text-2xl font-bold mb-2 text-center text-indigo-400">
          {step === "form" ? "Crear una cuenta en RËVA" : "Verifica tu Correo"}
        </h2>
        <p className="text-sm text-gray-400 mb-6 text-center">
          {step === "form"
            ? "Ingresa tus datos para comenzar tu experiencia virtual"
            : `Hemos enviado un código de 6 dígitos a ${emailForOtp}`}
        </p>

        {/* Mensajes de alerta dinámicos (Validaciones y Errores) */}
        {message.text && (
          <div
            className={`p-3 mb-4 rounded-lg text-sm ${
              message.success
                ? "bg-emerald-900/50 border border-emerald-500 text-emerald-200"
                : "bg-rose-900/50 border border-rose-500 text-rose-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Vista 1: Formulario de Registro */}
        {step === "form" ? (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Nombre Completo</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 text-white outline-none"
                placeholder="Tu nombre"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Teléfono</label>
              <input
                type="text"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 text-white outline-none"
                placeholder="3001234567"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Rol</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 text-white outline-none"
              >
                <option value="Cliente (Usuario Estándar)">Cliente (Usuario Estándar)</option>
                <option value="Diseñador / Marca">Diseñador / Marca</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Correo Electrónico</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 text-white outline-none"
                placeholder="correo@ejemplo.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Contraseña</label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 text-white outline-none"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition duration-200 disabled:opacity-50"
            >
              {loading ? "Procesando registro..." : "Registrarse"}
            </button>

            <p className="text-center text-sm text-gray-400 mt-4">
              ¿Ya tienes una cuenta?{" "}
              <Link href="/login" className="text-indigo-400 hover:underline">
                Inicia sesión
              </Link>
            </p>
          </form>
        ) : (
          /* Vista 2: Ingreso de Código OTP */
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Código OTP (6 dígitos)</label>
              <input
                type="text"
                maxLength={6}
                required
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-center tracking-widest text-2xl font-bold focus:ring-2 focus:ring-indigo-500 text-white outline-none"
                placeholder="123456"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition duration-200 disabled:opacity-50"
            >
              {loading ? "Verificando..." : "Verificar Cuenta"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}