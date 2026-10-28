"use client";

import { useEffect, useState } from "react";
// Aquí puedes mantener todas tus importaciones de componentes reales:
// import VirtualTryOnCam from "@/components/VirtualTryOnCam";
// import WardrobeGrid from "@/components/WardrobeGrid";

export default function SellerPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const session = localStorage.getItem("user_session");
    if (session) {
      setUser(JSON.parse(session));
    }
  }, []);

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-bold text-amber-500">Portal de Vendedores / Diseñadores</h1>
      <p className="text-sm text-zinc-400 mt-1">Bienvenido, {user?.name || "Vendedor"}</p>
      
      {/* Aquí van tus componentes intactos de la cámara, probador y gestión */}
      <div className="mt-6">
        {/* Ejemplo: <VirtualTryOnCam /> */}
      </div>
    </main>
  );
}