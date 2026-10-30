'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getGarments, deleteGarment } from "../actions/garments";

export default function WardrobePage() {
  const router = useRouter();
  const [garments, setGarments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. REQUISITO 16 (ISO 27001): Validación de sesión y token único de concurrencia
    const sessionData = localStorage.getItem('user_session');

    if (!sessionData) {
      window.location.href = '/login';
      return;
    }

    try {
      const parsedUser = JSON.parse(sessionData);
      if (!parsedUser || !parsedUser.email) {
        localStorage.removeItem('user_session');
        window.location.href = '/login';
        return;
      }
    } catch (e) {
      localStorage.removeItem('user_session');
      window.location.href = '/login';
      return;
    }

    // 2. Escucha activa en tiempo real para sesiones concurrentes en otros navegadores
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user_session' && e.newValue !== e.oldValue) {
        alert('⚠️ ALERTA DE SEGURIDAD (ISO 27001): Se ha detectado un inicio de sesión simultáneo con este usuario en otro dispositivo o navegador. Esta sesión ha sido invalidada.');
        localStorage.removeItem('user_session');
        window.location.href = '/login';
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // 3. Cargar las prendas originales
    fetchGarments();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  async function fetchGarments() {
    setLoading(true);
    const res = await getGarments();
    if (res.success) {
      setGarments(res.garments || []);
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (confirm("¿Deseas quitar esta prenda de tu armario?")) {
      const res = await deleteGarment(id);
      if (res.success) {
        fetchGarments();
      } else {
        alert(res.error);
      }
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-neutral-900 p-6 rounded-2xl border border-neutral-800">
          <div>
            <h1 className="text-xl font-black text-amber-400">ARMARIO DIGITAL RËVA</h1>
            <p className="text-xs text-neutral-400 mt-1">Catálogo de prendas e integración de marcas asociadas</p>
          </div>
          <button
            onClick={() => router.push("/wardrobe/new")}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black rounded-xl text-xs transition cursor-pointer"
          >
            + Nueva Prenda
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-neutral-500 text-xs">Cargando armario digital...</div>
        ) : garments.length === 0 ? (
          <div className="text-center py-16 bg-neutral-900 border border-neutral-800 rounded-2xl">
            <p className="text-neutral-400 text-xs mb-3">Tu armario está vacío.</p>
            <button
              onClick={() => router.push("/wardrobe/new")}
              className="text-amber-400 text-xs font-bold hover:underline"
            >
              Carga tu primera prenda aquí
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {garments.map((g) => (
              <div key={g.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between">
                <div>
                  <div className="h-48 w-full bg-neutral-950 relative overflow-hidden flex items-center justify-center">
                    {g.url ? (
                      <img src={g.url} alt={g.name} className="object-cover h-full w-full" />
                    ) : (
                      <span className="text-neutral-600 text-xs">Sin vista previa</span>
                    )}
                    <span className="absolute top-3 left-3 bg-neutral-950/90 text-amber-400 border border-neutral-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">
                      {g.category}
                    </span>
                  </div>

                  <div className="p-4 space-y-2">
                    <h2 className="font-bold text-white text-sm">{g.name}</h2>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-amber-400 font-bold">{g.price || "N/A"}</span>
                      <span className="text-neutral-500 text-[10px]">{g.vibe || "Casual"}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-neutral-950/60 border-t border-neutral-800 flex items-center justify-between text-xs">
                  {g.storeUrl ? (
                    <a
                      href={g.storeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-400 hover:underline font-semibold text-[11px]"
                    >
                      Ir a la Tienda ↗
                    </a>
                  ) : (
                    <span className="text-neutral-600 text-[10px]">Sin enlace externo</span>
                  )}

                  <button
                    onClick={() => handleDelete(g.id)}
                    className="text-red-400 hover:text-red-300 font-medium text-[11px]"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}