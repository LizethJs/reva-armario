"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Setea la sesión activa e ingresa inmediatamente al armario y cámara
    const sessionUser = {
      name: "Diseñador RËVA",
      email: "admin@reva.com",
      role: "SELLER"
    };
    localStorage.setItem("user_session", JSON.stringify(sessionUser));
    
    // Redirección inmediata
    window.location.href = "/";
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 text-amber-400 flex flex-col items-center justify-center font-bold tracking-widest text-sm gap-3">
      <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
      ABRIENDO ARMARIO Y CÁMARA RËVA...
    </div>
  );
}