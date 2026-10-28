'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SessionGuard() {
  const router = useRouter();
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    // Revisa la validez de la sesión cada 3 segundos
    const interval = setInterval(() => {
      const sessionData = localStorage.getItem("user_session");

      if (sessionData) {
        try {
          const parsed = JSON.parse(sessionData);

          // Si existe sessionExpiresAt y el tiempo actual superó el límite de 5 minutos
          if (parsed.sessionExpiresAt && Date.now() > parsed.sessionExpiresAt) {
            setExpired(true);
            clearInterval(interval);

            // Espera 3 segundos mostrando la alerta y luego redirige al login
            setTimeout(() => {
              localStorage.removeItem("user_session");
              router.push("/login");
            }, 3000);
          }
        } catch (e) {
          console.error("Error leyendo la sesión:", e);
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [router]);

  if (!expired) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-md bg-red-950/90 border-2 border-red-500 text-red-200 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-md flex items-center justify-between animate-bounce">
      <div className="flex items-center gap-3">
        <span className="text-2xl">⚠️</span>
        <div>
          <h4 className="font-black text-sm uppercase text-red-400">Sesión Expirada</h4>
          <p className="text-xs text-red-200">Has superado el límite de 5 minutos de inactividad. Redirigiendo...</p>
        </div>
      </div>
    </div>
  );
}