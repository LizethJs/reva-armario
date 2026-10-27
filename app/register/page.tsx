"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser, verifyOtp, resendOtp } from "../actions/auth";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "otp">("form");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    role: "SELLER (Diseñador / Vendedor)",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Estados para controlar la visibilidad de las contraseñas (Ojo)
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [otp, setOtp] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", success: false });

  // --- REGLAS Y DESGLOSE DE VALIDACIÓN ESTRICTA EN TIEMPO REAL ---
  // Nombre: Solo letras y espacios, entre 3 y 50 caracteres (Expresión regular corregida)
  const isNameValid = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,50}$/.test(formData.name.trim());

  // Teléfono: Celular en Colombia (10 dígitos exactos iniciando por 3)
  const isPhoneDigitsOnly = /^[0-9]*$/.test(formData.phone.trim());
  const startsWithThree = formData.phone.trim().startsWith("3");
  const isPhoneValid = /^[3][0-9]{9}$/.test(formData.phone.trim());

  // Correo: Desglose específico de formato y dominio
  const hasAtSymbol = formData.email.includes("@");
  const hasDomain = /@[^\s@]+\.[^\s@]+$/.test(formData.email.trim());
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim());

  // Contraseña Estricta: Checklist completo (Mayúscula, Minúscula, Número, Símbolo)
  const hasMinLength = formData.password.length >= 8;
  const hasUppercase = /[A-Z]/.test(formData.password);
  const hasLowercase = /[a-z]/.test(formData.password);
  const hasNumber = /\d/.test(formData.password);
  const hasSpecialChar = /[@$!%*?&#._-]/.test(formData.password);
  
  const isPasswordValid =
    hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;

  // Confirmación de Contraseña
  const isConfirmPasswordValid =
    formData.confirmPassword.length > 0 && formData.confirmPassword === formData.password;

  // El formulario solo es válido si TODAS las reglas estrictas se cumplen
  const isFormValid =
    isNameValid && isPhoneValid && isEmailValid && isPasswordValid && isConfirmPasswordValid;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      setMessage({
        text: "Por favor corrige los campos marcados antes de continuar.",
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
        setStep("otp");
        setMessage({ text: res.message, success: true });
      } else {
        setMessage({ text: res.message || "Error al procesar el registro.", success: false });
      }
    } catch (err) {
      setMessage({ text: "Error de comunicación con el servidor.", success: false });
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
        setMessage({
          text: "¡Cuenta verificada exitosamente! Redirigiendo al inicio de sesión...",
          success: true,
        });

        // 🔒 FLUJO SEGURO: Redirige a /login para exigir inicio de sesión manual
        setTimeout(() => {
          router.push("/login?verified=true");
        }, 1200);
      } else {
        setMessage({ text: res.message || "Código OTP incorrecto.", success: false });
      }
    } catch (err) {
      setMessage({ text: "Error en la validación del código.", success: false });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setMessage({ text: "", success: false });
    try {
      const res = await resendOtp(registeredEmail);
      setMessage({ text: res.message, success: res.success });
    } catch (err) {
      setMessage({ text: "Error al reenviar el código.", success: false });
    } finally {
      setLoading(false);
    }
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
            {step === "form"
              ? "Registro seguro con validación estricta en tiempo real"
              : "Verificación OTP por correo"}
          </p>
        </div>

        {message.text && (
          <div
            className={`p-3 mb-5 rounded-xl text-xs font-medium text-center border ${
              message.success
                ? "bg-amber-400/10 border-amber-400/30 text-amber-300"
                : "bg-red-950/50 border-red-900/40 text-red-300"
            }`}
          >
            {message.text}
          </div>
        )}

        {step === "form" ? (
          <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
            {/* NOMBRE COMPLETO */}
            <div>
              <label className="block text-neutral-400 mb-1 font-medium">Nombre Completo</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3.5 py-2.5 bg-neutral-950 border rounded-xl text-white outline-none transition ${
                  !formData.name
                    ? "border-neutral-800 focus:border-amber-400"
                    : isNameValid
                    ? "border-emerald-500 focus:border-emerald-400"
                    : "border-red-500"
                }`}
                placeholder="Ej: Paula Gómez"
              />
              {formData.name && (
                <p
                  className={`text-[10px] mt-1 font-medium ${
                    isNameValid ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {isNameValid ? "✓ Nombre válido" : "✗ Solo letras y mínimo 3 caracteres."}
                </p>
              )}
            </div>

            {/* TELÉFONO MÓVIL */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-neutral-400 font-medium">Teléfono Móvil (Colombia)</label>
                {formData.phone && (
                  <span className="text-[10px] text-neutral-500">
                    {formData.phone.length}/10 dígitos
                  </span>
                )}
              </div>
              <input
                type="text"
                name="phone"
                maxLength={10}
                required
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-3.5 py-2.5 bg-neutral-950 border rounded-xl text-white outline-none transition ${
                  !formData.phone
                    ? "border-neutral-800 focus:border-amber-400"
                    : isPhoneValid
                    ? "border-emerald-500 focus:border-emerald-400"
                    : "border-red-500"
                }`}
                placeholder="3001234567"
              />
              {formData.phone && (
                <div className="text-[10px] mt-1 space-y-0.5 font-medium">
                  {!isPhoneDigitsOnly && (
                    <p className="text-red-400">✗ Debe contener únicamente números.</p>
                  )}
                  {!startsWithThree && (
                    <p className="text-red-400">
                      ✗ Debe iniciar con el número 3 (formato celular Colombia).
                    </p>
                  )}
                  {formData.phone.length !== 10 && (
                    <p className="text-red-400">
                      ✗ Debe tener exactamente 10 dígitos (llevas {formData.phone.length}).
                    </p>
                  )}
                  {isPhoneValid && (
                    <p className="text-emerald-400 font-bold">✓ Teléfono móvil válido</p>
                  )}
                </div>
              )}
            </div>

            {/* ROL DE ACCESO */}
            <div>
              <label className="block text-neutral-400 mb-1 font-medium">Rol de Acceso</label>
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

            {/* CORREO ELECTRÓNICO */}
            <div>
              <label className="block text-neutral-400 mb-1 font-medium">Correo Electrónico</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3.5 py-2.5 bg-neutral-950 border rounded-xl text-white outline-none transition ${
                  !formData.email
                    ? "border-neutral-800 focus:border-amber-400"
                    : isEmailValid
                    ? "border-emerald-500 focus:border-emerald-400"
                    : "border-red-500"
                }`}
                placeholder="correo@ejemplo.com"
              />
              {formData.email && (
                <div className="text-[10px] mt-1 space-y-0.5 font-medium">
                  {!hasAtSymbol && (
                    <p className="text-red-400">✗ Falta el carácter '@' en el correo.</p>
                  )}
                  {hasAtSymbol && !hasDomain && (
                    <p className="text-red-400">
                      ✗ Falta un dominio válido después del '@' (ejemplo: .com o .edu.co).
                    </p>
                  )}
                  {isEmailValid && (
                    <p className="text-emerald-400 font-bold">✓ Estructura de correo válida</p>
                  )}
                </div>
              )}
            </div>

            {/* CONTRASEÑA SEGURA ESTRICTA */}
            <div>
              <label className="block text-neutral-400 mb-1 font-medium">Contraseña Segura</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-3.5 pr-10 py-2.5 bg-neutral-950 border rounded-xl text-white outline-none transition ${
                    !formData.password
                      ? "border-neutral-800 focus:border-amber-400"
                      : isPasswordValid
                      ? "border-emerald-500 focus:border-emerald-400"
                      : "border-red-500"
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-amber-400 transition"
                  title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* LISTA DE CONTROL DE REQUISITOS DE SEGURIDAD EN TIEMPO REAL */}
              {formData.password && (
                <div className="mt-2 bg-neutral-950 p-2.5 rounded-xl border border-neutral-800 text-[10px] space-y-1 font-medium">
                  <p className={hasMinLength ? "text-emerald-400" : "text-red-400"}>
                    {hasMinLength ? "✓ Mínimo 8 caracteres" : "✗ Falta alcanzar 8 caracteres"}
                  </p>
                  <p className={hasUppercase ? "text-emerald-400" : "text-red-400"}>
                    {hasUppercase ? "✓ Al menos una mayúscula (A-Z)" : "✗ Falta incluir una mayúscula (A-Z)"}
                  </p>
                  <p className={hasLowercase ? "text-emerald-400" : "text-red-400"}>
                    {hasLowercase ? "✓ Al menos una minúscula (a-z)" : "✗ Falta incluir una minúscula (a-z)"}
                  </p>
                  <p className={hasNumber ? "text-emerald-400" : "text-red-400"}>
                    {hasNumber ? "✓ Al menos un número (0-9)" : "✗ Falta incluir un número (0-9)"}
                  </p>
                  <p className={hasSpecialChar ? "text-emerald-400" : "text-red-400"}>
                    {hasSpecialChar ? "✓ Al menos un símbolo especial" : "✗ Falta incluir un símbolo (@, $, !, %, *, ?, &, #, ., _, -)"}
                  </p>
                </div>
              )}
            </div>

            {/* CONFIRMAR CONTRASEÑA */}
            <div>
              <label className="block text-neutral-400 mb-1 font-medium">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full pl-3.5 pr-10 py-2.5 bg-neutral-950 border rounded-xl text-white outline-none transition ${
                    !formData.confirmPassword
                      ? "border-neutral-800 focus:border-amber-400"
                      : isConfirmPasswordValid
                      ? "border-emerald-500 focus:border-emerald-400"
                      : "border-red-500"
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-amber-400 transition"
                  title={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {formData.confirmPassword && (
                <p
                  className={`text-[10px] mt-1 font-medium ${
                    isConfirmPasswordValid ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {isConfirmPasswordValid
                    ? "✓ Las contraseñas coinciden"
                    : "✗ Las contraseñas no coinciden."}
                </p>
              )}
            </div>

            {/* BOTÓN DE REGISTRO */}
            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black rounded-xl transition cursor-pointer shadow-lg mt-2 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {loading ? "Validando credenciales..." : "Registrarse y Enviar OTP"}
            </button>

            <div className="text-center pt-2">
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
              Hemos enviado un código de 6 dígitos a{" "}
              <span className="text-amber-400 font-bold">{registeredEmail}</span>.
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
              {loading ? "Verificando..." : "Confirmar Código e Iniciar Sesión"}
            </button>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleResend}
                disabled={loading}
                className="text-neutral-400 hover:text-amber-400 underline transition text-xs disabled:opacity-50"
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