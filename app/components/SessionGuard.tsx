"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, Clock, LogOut, CheckCircle2 } from "lucide-react";

export default function SessionGuard() {
  const router = useRouter();
  const [expired, setExpired] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); // 60 segundos de cuenta regresiva

  useEffect(() => {
    const checkSession = () => {
      const sessionData = localStorage.getItem("user_session");
      if (sessionData) {
        try {
          const parsed = JSON.parse(sessionData);
          if (parsed.sessionExpiresAt) {
            const timeLeftMs = parsed.sessionExpiresAt - Date.now();

            // Si ya expiró por completo
            if (timeLeftMs <= 0) {
              setExpired(true);
              setShowWarning(false);
              setTimeout(() => {
                localStorage.removeItem("user_session");
                router.push("/login");
              }, 3000);
            } 
            // Si falta 1 minuto (60,000 ms) o menos para expirar, mostramos la advertencia con el botón
            else if (timeLeftMs <= 60 * 1000 && !expired) {
              setShowWarning(true);
              setTimeLeft(Math.floor(timeLeftMs / 1000));
            }
          }
        } catch (e) {
          console.error("Error al validar la sesión:", e);
        }
      }
    };

    checkSession();

    window.addEventListener("click", checkSession);
    window.addEventListener("focus", checkSession);
    const interval = setInterval(checkSession, 1000); // Revisar cada segundo para sincronizar el temporizador

    return () => {
      window.removeEventListener("click", checkSession);
      window.removeEventListener("focus", checkSession);
      clearInterval(interval);
    };
  }, [router, expired]);

  // Función para extender la sesión (añade 5 minutos más al timestamp actual)
  const handleExtendSession = () => {
    const sessionData = localStorage.getItem("user_session");
    if (sessionData) {
      try {
        const parsed = JSON.parse(sessionData);
        parsed.sessionExpiresAt = Date.now() + 5 * 60 * 1000; // Renueva por 5 min más
        localStorage.setItem("user_session", JSON.stringify(parsed));
        setShowWarning(false);
      } catch (e) {
        console.error("Error al extender sesión:", e);
      }
    }
  };

  const handleForceLogout = () => {
    localStorage.removeItem("user_session");
    setShowWarning(false);
    router.push("/login");
  };

  return (
    <>
      {/* 1. MODAL DE ADVERTENCIA INTERACTIVO (CON BOTÓN DE CONTINUAR) */}
      {showWarning && !expired && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-6 text-white font-sans">
            
            <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
              <div className="p-3 bg-amber-400/10 border border-amber-400/30 rounded-2xl text-amber-400">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-amber-400">
                  Aviso de Inactividad (ISO/IEC 27001)
                </h3>
                <p className="text-xs text-neutral-400">Control de Sesión de Usuario</p>
              </div>
            </div>

            <div className="text-center space-y-3">
              <p className="text-xs text-neutral-300 leading-relaxed">
                Tu sesión está a punto de expirar por inactividad. ¿Deseas mantener tu sesión abierta?
              </p>
              
              <div className="py-3 px-4 bg-neutral-950 border border-neutral-800 rounded-2xl flex items-center justify-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-mono text-neutral-400">Cierre automático en:</span>
                <span className="text-lg font-black font-mono text-amber-400">{timeLeft}s</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleExtendSession}
                className="flex-1 py-3 px-4 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <CheckCircle2 className="w-4 h-4" /> Continuar Sesión
              </button>

              <button
                onClick={handleForceLogout}
                className="py-3 px-4 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" /> Salir
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 2. ALERTA DE CIERRE DEFINITIVO (CUANDO YA EXPIRÓ) */}
      {expired && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-md bg-red-950/95 border-2 border-red-500 text-red-200 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-md flex items-center justify-between animate-bounce">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h4 className="font-black text-sm uppercase text-red-400">Sesión Expirada</h4>
              <p className="text-xs text-red-200">Se han cumplido los 5 minutos de inactividad. Cerrando sesión...</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}