'use client';

import { useState } from 'react';
import { registerUser, verifyUserCode } from '../actions/auth';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

export default function RegisterPage() {
  const [step, setStep] = useState<'register' | 'verify'>('register');
  const [emailForVerification, setEmailForVerification] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData(event.currentTarget);
      const result = await registerUser(formData);

      setLoading(false);

      if (!result.success) {
        setError(result.error || 'Error al registrarse');
      } else {
        setEmailForVerification(result.email || '');
        setStep('verify');
      }
    } catch (err) {
      console.error('Error en registro:', err);
      setError('Ocurrió un error inesperado al registrar');
      setLoading(false);
    }
  }

  async function handleVerify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData(event.currentTarget);
      formData.append('email', emailForVerification);

      const result = await verifyUserCode(formData);

      setLoading(false);

      if (!result.success) {
        setError(result.error || 'Código incorrecto');
      } else {
        router.push('/login');
      }
    } catch (err) {
      console.error('Error en verificación:', err);
      setError('Ocurrió un error al verificar el código');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-4 selection:bg-amber-400 selection:text-neutral-950">
      <div className="w-full max-w-md bg-neutral-900/80 backdrop-blur-xl border border-neutral-800 p-8 rounded-3xl shadow-2xl shadow-neutral-950/50 flex flex-col gap-6">
        
        {/* Cabecera */}
        <div className="text-center flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-neutral-950 font-black shadow-lg shadow-amber-500/20 text-xl tracking-wider">
            R
          </div>
          <h1 className="text-xl font-black tracking-widest text-white mt-1">RËVA</h1>
          <p className="text-xs text-neutral-400 font-medium">
            {step === 'register' ? 'Crea tu cuenta profesional' : 'Verificación de Seguridad OTP'}
          </p>
        </div>

        {error && (
          <div className="bg-red-950/40 border border-red-900/60 text-red-300 p-3.5 rounded-2xl text-xs text-center font-medium animate-in fade-in">
            {error}
          </div>
        )}

        {step === 'register' ? (
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Nombre de Usuario</label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 w-4 h-4 text-neutral-500" />
                <input 
                  name="name" 
                  type="text" 
                  placeholder="Tu nombre completo" 
                  required 
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-400 text-white text-xs rounded-2xl py-3 pl-10 pr-4 outline-none transition" 
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Correo Electrónico</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 w-4 h-4 text-neutral-500" />
                <input 
                  name="email" 
                  type="email" 
                  placeholder="correo@ejemplo.com" 
                  required 
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-400 text-white text-xs rounded-2xl py-3 pl-10 pr-4 outline-none transition" 
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Contraseña</label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 w-4 h-4 text-neutral-500" />
                <input 
                  name="password" 
                  type="password" 
                  placeholder="••••••••" 
                  required 
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-400 text-white text-xs rounded-2xl py-3 pl-10 pr-4 outline-none transition" 
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Rol en la Plataforma</label>
              <select 
                name="role" 
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-400 text-white text-xs rounded-2xl py-3 px-4 outline-none transition cursor-pointer"
              >
                <option value="USER">Cliente (Probador y Armario Digital)</option>
                <option value="SELLER">Vendedor (Gestión y Catálogo)</option>
                <option value="ADMIN">Administrador (Control Total)</option>
              </select>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full mt-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold py-3 px-4 rounded-2xl text-xs shadow-lg shadow-amber-400/10 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Generando código...' : <>Continuar al Registro <ArrowRight className="w-3.5 h-3.5" /></>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="flex flex-col gap-4">
            <div className="bg-neutral-950 border border-neutral-800 p-4 rounded-2xl text-center flex flex-col gap-1">
              <span className="text-xs text-neutral-400">Enviamos un código de 6 dígitos a</span>
              <span className="text-xs font-bold text-amber-400">{emailForVerification}</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider text-center">Código OTP</label>
              <input 
                name="code" 
                type="text" 
                maxLength={6} 
                placeholder="123456" 
                required 
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-400 text-emerald-400 text-center text-2xl font-black rounded-2xl py-3 tracking-[10px] outline-none transition" 
              />
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full mt-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 px-4 rounded-2xl text-xs shadow-lg shadow-emerald-500/10 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? 'Validando...' : <>Verificar y Activar Cuenta <ShieldCheck className="w-4 h-4" /></>}
            </button>
          </form>
        )}

        <div className="text-center text-xs text-neutral-400 border-t border-neutral-800/60 pt-4">
          ¿Ya tienes una cuenta? <a href="/login" className="text-amber-400 font-bold hover:underline">Inicia Sesión</a>
        </div>

      </div>
    </div>
  );
}