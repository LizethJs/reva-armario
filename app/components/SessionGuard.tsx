"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SessionGuard() {
  const router = useRouter();
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    // Verificamos cada segundo si la sesión ha expirado de forma real
    const interval = setInterval(() => {
      const sessionData = localStorage.getItem("user_session");

      if (sessionData) {
        try {
          const parsed = JSON.parse(sessionData);

          // Si el objeto tiene la estampa de tiempo y la hora actual ya la superó
          if (parsed.sessionExpiresAt && Date.now() > parsed.sessionExpiresAt) {
            setExpired(true);
            clearInterval(interval);

            // Muestra la alerta 3 segundos y redirige al login de forma automática
            setTimeout(() => {
              localStorage.removeItem("user_session");
              router.push("/login");
            }, 3000);
          }
        } catch (e) {
          console.error("Error al validar la sesión:", e);
        }
      }
    }, 1000); // Revisa cada 1 segundo en tiempo real

    return () => clearInterval(interval);
  }, [router]);

  if (!expired) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-md bg-red-950/95 border-2 border-red-500 text-red-200 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-md flex items-center justify-between animate-bounce">
      <div className="flex items-center gap-3">
        <span className="text-2xl">⚠️</span>
        <div>
          <h4 className="font-black text-sm uppercase text-red-400">Sesión Expirada</h4>
          <p className="text-xs text-red-200">Se han cumplido los 5 minutos de inactividad. Cerrando sesión...</p>
        </div>
      </div>
    </div>
  );
}