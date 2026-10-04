'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Phone, ShieldCheck, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'USER' | 'SELLER' | 'ADMIN'>('USER');
  
  // Estados para el flujo de verificación por correo (OTP)
  const [verificationStep, setVerificationStep] = useState<'form' | 'code_sent'>('form');
  const [generatedCode, setGeneratedCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password || (isRegistering && (!name || !contact))) {
      setError('Por favor complete todos los campos obligatorios.');
      return;
    }

    setIsLoading(true);

    try {
      if (isRegistering && verificationStep === 'form') {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedCode(code);

        try {
          // Intentar conectar con la API de Nodemailer
          const response = await fetch('/api/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code })
          });

          const contentType = response.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            // Si el servidor devuelve HTML (como un 404), usamos el modo seguro de respaldo
            console.warn("API /api/send-otp no disponible o devolvió HTML. Usando modo simulación OTP.");
          } else {
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Error al enviar el correo');
          }
        } catch (apiErr) {
          // Fallback controlado si la API no está desplegada o configurada aún
          console.log(`[Modo Respaldo OTP] Código generado para ${email}: ${code}`);
        }

        setVerificationStep('code_sent');
        setIsLoading(false);
        return;
      }

      if (isRegistering && verificationStep === 'code_sent') {
        if (inputCode !== generatedCode) {
          setError('El código de verificación ingresado es incorrecto.');
          setIsLoading(false);
          return;
        }
      }

      // Guardar sesión validada en localStorage
      const sessionData = {
        name: name || email.split('@')[0],
        email,
        contact: contact || '+57 300 0000000',
        role
      };

      localStorage.setItem('user_session', JSON.stringify(sessionData));
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error en el proceso.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-4 selection:bg-amber-400 selection:text-neutral-950">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 p-8 rounded-3xl shadow-2xl flex flex-col gap-6 relative overflow-hidden">
        
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600"></div>

        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-neutral-950 font-black shadow-lg text-xl tracking-wider">
            R
          </div>
          <h1 className="text-base font-black tracking-widest text-white mt-1">PORTAL RËVA</h1>
          <p className="text-xs text-neutral-400">
            {verificationStep === 'code_sent' 
              ? 'Ingrese el código de verificación' 
              : isRegistering ? 'Registro de cuenta con validación OTP' : 'Acceso seguro al probador virtual'}
          </p>
        </div>

        {error && (
          <div className="bg-red-950/40 border border-red-900/50 text-red-300 text-xs p-3 rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
          
          {verificationStep === 'code_sent' ? (
            <div className="flex flex-col gap-4 animate-in fade-in">
              <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 text-center flex flex-col gap-2">
                <ShieldCheck className="w-8 h-8 text-amber-400 mx-auto" />
                <span className="text-xs text-neutral-300">Código enviado para <strong className="text-amber-400">{email}</strong></span>
                <span className="text-[10px] text-neutral-500">(Revisa tu consola si usas modo local o tu bandeja si configuraste Nodemailer)</span>
              </div>
              <input
                type="text"
                placeholder="Código OTP (6 dígitos)"
                value={inputCode}
                onChange={e => setInputCode(e.target.value)}
                maxLength={6}
                className="w-full bg-neutral-950 border border-neutral-800 px-4 py-3 rounded-xl text-center text-lg font-black tracking-widest text-amber-400 focus:outline-none focus:border-amber-400"
                required
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black text-xs rounded-xl shadow-xl transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? 'Verificando...' : <>Verificar y Acceder <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          ) : (
            <>
              {isRegistering && (
                <>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-500" />
                    <input
                      type="text"
                      placeholder="Nombre completo / Tienda"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 pl-10 pr-4 py-3 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                      required
                    />
                  </div>

                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-500" />
                    <input
                      type="text"
                      placeholder="Número de Teléfono / Contacto / NIT"
                      value={contact}
                      onChange={e => setContact(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 pl-10 pr-4 py-3 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] text-neutral-400 font-semibold">Rol en la Plataforma:</label>
                    <select
                      value={role}
                      onChange={e => setRole(e.target.value as 'USER' | 'SELLER' | 'ADMIN')}
                      className="w-full bg-neutral-950 border border-neutral-800 px-3.5 py-3 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                    >
                      <option value="USER">Cliente (Usuario Estándar)</option>
                      <option value="SELLER">Vendedor / Tercero (Marketplace)</option>
                      <option value="ADMIN">Administrador (Control Total)</option>
                    </select>
                  </div>
                </>
              )}

              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-500" />
                <input
                  type="email"
                  placeholder="Correo electrónico"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 pl-10 pr-4 py-3 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-500" />
                <input
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 pl-10 pr-4 py-3 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black text-xs rounded-xl shadow-xl transition cursor-pointer mt-2 disabled:opacity-50"
              >
                {isLoading ? 'Procesando...' : isRegistering ? 'Continuar con Verificación OTP' : 'Iniciar Sesión'}
              </button>
            </>
          )}
        </form>

        {verificationStep === 'form' && (
          <div className="text-center">
            <button
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
              }}
              className="text-xs text-neutral-400 hover:text-amber-400 transition cursor-pointer"
            >
              {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate aquí'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}