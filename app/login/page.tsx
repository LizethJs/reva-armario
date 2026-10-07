'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
// Importa aquí tu Server Action o función de autenticación real:
// import { loginUser } from '@/app/actions/auth'; 

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Si usas un Server Action o fetch propio, reemplaza esto por tu llamada:
      // const res = await loginUser(formData);
      
      // SIMULACIÓN DE LLAMADA (Ajusta según tu backend/Server Action real):
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);

      // Ejemplo de respuesta esperada de tu servidor:
      // const res = await loginUser(formData);
      
      // --- SUPONIENDO QUE TU FUNCIÖN DEVUELVE EL OBJETO DE RESPUESTA ---
      // (Si tu función se llama distinto, adapta 'res' a tu variable)
      const mockBackendResponse = {
        success: true,
        user: {
          name: email.split('@')[0],
          role: email.includes('admin') ? 'ADMIN' : email.includes('seller') ? 'SELLER' : 'USER',
          contact: email
        },
        error: null
      };

      const res = mockBackendResponse; 
      // -------------------------------------------------------------

      if (!res || !res.success) {
        setError(res?.error || 'Correo o contraseña incorrectos.');
        setIsLoading(false);
        return;
      }

      // 🔑 AQUÍ ESTÁ LA CLAVE PARA QUE FUNCIONE TU HOME Y EVITE EL 404:
      // Guardamos el objeto exacto que app/page.tsx lee con 'user_session'
      const userSessionData = {
        name: res.user?.name || email.split('@')[0],
        email: email,
        role: res.user?.role || 'USER', // ADMIN, SELLER, o USER
        contact: res.user?.contact || email
      };
      
      localStorage.setItem('user_session', JSON.stringify(userSessionData));

      setIsLoading(false);

      // Redirigimos de forma limpia a la raíz
      router.push('/');
      router.refresh();

    } catch (err) {
      setError('Ocurrió un error inesperado al iniciar sesión.');
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-4 sm:p-6 selection:bg-amber-400 selection:text-neutral-950">
      <div className="w-full max-w-md bg-neutral-900/60 backdrop-blur-2xl border border-neutral-800 p-8 rounded-3xl shadow-2xl flex flex-col gap-6">
        
        {/* Cabecera */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-neutral-950 font-black shadow-xl text-2xl tracking-wider mb-2">
            R
          </div>
          <h1 className="text-xl font-black tracking-widest text-white">RËVA</h1>
          <p className="text-xs text-neutral-400">Inicia sesión para acceder a tu entorno</p>
        </div>

        {/* Mensaje de Error */}
        {error && (
          <div className="bg-red-950/40 border border-red-900/50 text-red-300 p-3.5 rounded-2xl text-xs flex items-center gap-2.5 animate-shake">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-neutral-400 tracking-wider uppercase">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tucorreo@dominio.com"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-10 py-3 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400 transition"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-neutral-400 tracking-wider uppercase">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-10 py-3 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full bg-amber-400 hover:bg-amber-300 active:scale-[0.99] text-neutral-950 font-black text-xs py-3.5 rounded-2xl flex items-center justify-center gap-2 transition shadow-lg cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-neutral-950" />
                <span>Validando acceso...</span>
              </>
            ) : (
              <>
                <span>Ingresar a RËVA</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center">
          <p className="text-[11px] text-neutral-500">
            ¿Problemas con tu acceso? Contacta al soporte técnico de la plataforma.
          </p>
        </div>

      </div>
    </main>
  );
}