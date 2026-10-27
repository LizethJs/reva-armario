"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUsers, updateUserRole, getAuditLogs } from "../actions/admin";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "audit" | "security" | "analytics">("overview");
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState("");
  const [actionMessage, setActionMessage] = useState({ text: "", success: false });

  useEffect(() => {
    const session = localStorage.getItem("user_session");
    
    if (!session) {
      router.push("/login");
      return;
    }

    const parsed = JSON.parse(session);

    // CONTROL DE ACCESO ESTRICTO (ISO 27001 - RBAC)
    if (parsed.role !== "ADMIN") {
      alert("Acceso denegado: Violación de política de control de acceso. Se requieren privilegios de Administrador.");
      router.push("/");
      return;
    }

    const email = parsed.email || "admin@reva.com";
    setAdminEmail(email);
    loadData(email);
  }, [router]);

  async function loadData(email: string) {
    setLoading(true);
    try {
      const usersRes = await getUsers(email);
      if (usersRes.success) setUsers(usersRes.users || []);

      const auditRes = await getAuditLogs(email);
      if (auditRes.success) setAuditLogs(auditRes.logs || []);
    } catch (err) {
      console.error("Error cargando metadatos de auditoría:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleRoleChange = async (targetUserId: string, newRole: "CLIENT" | "SELLER" | "ADMIN") => {
    setActionMessage({ text: "Ejecutando cambio de privilegios, validando firmas criptográficas y firmando bitácora...", success: true });
    const res = await updateUserRole(adminEmail, targetUserId, newRole);
    if (res.success) {
      setActionMessage({ text: res.message || "Modificación registrada con éxito en la bitácora inmutable ISO 27001", success: true });
      loadData(adminEmail);
    } else {
      setActionMessage({ text: res.error || "Error crítico al actualizar el rol", success: false });
    }
    setTimeout(() => setActionMessage({ text: "", success: false }), 5000);
  };

  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === "ADMIN").length;
  const sellerCount = users.filter((u) => u.role === "SELLER").length;
  const clientCount = users.filter((u) => u.role === "CLIENT").length;
  const totalLogs = auditLogs.length;

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ENCABEZADO EJECUTIVO */}
        <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-950 p-6 rounded-3xl border border-neutral-800 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-amber-400/10 border border-amber-400/30 text-amber-400 text-[10px] font-black rounded-lg uppercase tracking-widest">
                ISO/IEC 27001 Compliance & Business Intelligence
              </span>
              <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-bold bg-emerald-950/50 px-3 py-0.5 rounded-full border border-emerald-800/40">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Secure Tunnel & Analytics OK
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white mt-2 tracking-wide">
              PANEL EJECUTIVO DE GESTIÓN & <span className="text-amber-400">ANALÍTICA</span>
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Control de Accesos, Trazabilidad Inmutable, Modelos Descriptivos e Inferencia de Datos
            </p>
          </div>

          <div className="flex flex-wrap gap-2 bg-neutral-950/80 p-1.5 rounded-2xl border border-neutral-800">
            {[
              { id: "overview", label: "📊 Resumen Ejecutivo" },
              { id: "users", label: "👥 Gobierno de Identidades" },
              { id: "audit", label: "🛡️ Bitácora Inmutable ISO" },
              { id: "security", label: "🔒 Controles SSDLC" },
              { id: "analytics", label: "📈 Analítica & Modelos" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? "bg-amber-400 text-neutral-950 shadow-md scale-105"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {actionMessage.text && (
          <div
            className={`p-3.5 rounded-2xl text-xs font-bold text-center border transition-all ${
              actionMessage.success
                ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
                : "bg-red-950/60 border-red-500/40 text-red-300"
            }`}
          >
            {actionMessage.text}
          </div>
        )}

        {/* PESTAÑA 1: RESUMEN EJECUTIVO */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl shadow-lg">
                <p className="text-neutral-400 text-[11px] font-bold uppercase tracking-wider">Identidades Totales</p>
                <div className="flex items-baseline justify-between mt-2">
                  <h3 className="text-3xl font-black text-white">{totalUsers}</h3>
                  <span className="text-xs text-amber-400 font-bold">Base Activa</span>
                </div>
                <div className="w-full bg-neutral-950 h-1.5 rounded-full mt-4 overflow-hidden">
                  <div className="bg-amber-400 h-full w-full"></div>
                </div>
                <p className="text-[10px] text-neutral-500 mt-3">Cuentas validadas por base de datos Supabase PostgreSQL.</p>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl shadow-lg">
                <p className="text-neutral-400 text-[11px] font-bold uppercase tracking-wider">Superadministradores</p>
                <div className="flex items-baseline justify-between mt-2">
                  <h3 className="text-3xl font-black text-amber-400">{adminCount}</h3>
                  <span className="text-xs text-neutral-400">Control Total</span>
                </div>
                <div className="w-full bg-neutral-950 h-1.5 rounded-full mt-4 overflow-hidden">
                  <div className="bg-amber-400 h-full" style={{ width: `${(adminCount / (totalUsers || 1)) * 100}%` }}></div>
                </div>
                <p className="text-[10px] text-neutral-500 mt-3">Privilegios altos restringidos por política RBAC.</p>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl shadow-lg">
                <p className="text-neutral-400 text-[11px] font-bold uppercase tracking-wider">Vendedores / Diseñadores</p>
                <div className="flex items-baseline justify-between mt-2">
                  <h3 className="text-3xl font-black text-blue-400">{sellerCount}</h3>
                  <span className="text-xs text-neutral-400">Catálogo Habilitado</span>
                </div>
                <div className="w-full bg-neutral-950 h-1.5 rounded-full mt-4 overflow-hidden">
                  <div className="bg-blue-400 h-full" style={{ width: `${(sellerCount / (totalUsers || 1)) * 100}%` }}></div>
                </div>
                <p className="text-[10px] text-neutral-500 mt-3">Permisos de subida de prendas y gestión de tienda.</p>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl shadow-lg">
                <p className="text-neutral-400 text-[11px] font-bold uppercase tracking-wider">Eventos de Auditoría</p>
                <div className="flex items-baseline justify-between mt-2">
                  <h3 className="text-3xl font-black text-emerald-400">{totalLogs}</h3>
                  <span className="text-xs text-emerald-400 font-semibold">Trazabilidad OK</span>
                </div>
                <div className="w-full bg-neutral-950 h-1.5 rounded-full mt-4 overflow-hidden">
                  <div className="bg-emerald-400 h-full w-full"></div>
                </div>
                <p className="text-[10px] text-neutral-500 mt-3">Registros inmutables firmados con marca de tiempo.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 p-6 rounded-3xl space-y-4">
                <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider">
                  Matriz de Distribución de Permisos y Gobernanza (RBAC)
                </h3>
                <div className="space-y-4 pt-2">
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-neutral-300">Clientes Finales (CLIENT)</span>
                      <span className="text-amber-400">{clientCount} usuarios ({Math.round((clientCount / (totalUsers || 1)) * 100)}%)</span>
                    </div>
                    <div className="w-full bg-neutral-950 h-3 rounded-full overflow-hidden p-0.5 border border-neutral-800">
                      <div className="bg-amber-400 h-full rounded-full" style={{ width: `${(clientCount / (totalUsers || 1)) * 100}%` }}></div>
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-1">Acceso limitado al probador virtual, carrito de compras y perfil personal.</p>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-neutral-300">Vendedores Autorizados (SELLER)</span>
                      <span className="text-blue-400">{sellerCount} usuarios ({Math.round((sellerCount / (totalUsers || 1)) * 100)}%)</span>
                    </div>
                    <div className="w-full bg-neutral-950 h-3 rounded-full overflow-hidden p-0.5 border border-neutral-800">
                      <div className="bg-blue-400 h-full rounded-full" style={{ width: `${(sellerCount / (totalUsers || 1)) * 100}%` }}></div>
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-1">Capacidad operativa para integrar prendas al catálogo con saneamiento de archivos adjuntos.</p>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-neutral-300">Administradores de Sistema (ADMIN)</span>
                      <span className="text-emerald-400">{adminCount} usuarios ({Math.round((adminCount / (totalUsers || 1)) * 100)}%)</span>
                    </div>
                    <div className="w-full bg-neutral-950 h-3 rounded-full overflow-hidden p-0.5 border border-neutral-800">
                      <div className="bg-emerald-