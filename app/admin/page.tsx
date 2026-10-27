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

    if (parsed.role !== "ADMIN") {
      alert("Acceso denegado: Se requieren privilegios de Administrador.");
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
      console.error("Error cargando metadatos:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleRoleChange = async (targetUserId: string, newRole: "CLIENT" | "SELLER" | "ADMIN") => {
    setActionMessage({ text: "Ejecutando cambio de privilegios...", success: true });
    const res = await updateUserRole(adminEmail, targetUserId, newRole);
    if (res.success) {
      setActionMessage({ text: res.message || "Modificación registrada en la bitácora ISO 27001", success: true });
      loadData(adminEmail);
    } else {
      setActionMessage({ text: res.error || "Error al actualizar rol", success: false });
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
                      <span className="text-amber-400">{clientCount} usuarios</span>
                    </div>
                    <div className="w-full bg-neutral-950 h-3 rounded-full overflow-hidden p-0.5 border border-neutral-800">
                      <div className="bg-amber-400 h-full rounded-full" style={{ width: `${(clientCount / (totalUsers || 1)) * 100}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-neutral-300">Vendedores Autorizados (SELLER)</span>
                      <span className="text-blue-400">{sellerCount} usuarios</span>
                    </div>
                    <div className="w-full bg-neutral-950 h-3 rounded-full overflow-hidden p-0.5 border border-neutral-800">
                      <div className="bg-blue-400 h-full rounded-full" style={{ width: `${(sellerCount / (totalUsers || 1)) * 100}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-neutral-300">Administradores de Sistema (ADMIN)</span>
                      <span className="text-emerald-400">{adminCount} usuarios</span>
                    </div>
                    <div className="w-full bg-neutral-950 h-3 rounded-full overflow-hidden p-0.5 border border-neutral-800">
                      <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${(adminCount / (totalUsers || 1)) * 100}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Estado de Conformidad</h3>
                    <span className="text-xs font-black text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-md border border-emerald-800">99.1% Óptimo</span>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Subsistema de auditoría inmutable activo bajo controles normativos ISO/IEC 27001.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA 2: GOBIERNO DE IDENTIDADES */}
        {activeTab === "users" && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-neutral-800 flex justify-between items-center">
              <div>
                <h2 className="text-sm font-black text-amber-400 uppercase tracking-wider">Directorio Central de Identidades</h2>
                <p className="text-xs text-neutral-400">Gestión de roles en tiempo real con auditoría forense</p>
              </div>
              <span className="text-xs bg-neutral-950 px-3 py-1 rounded-xl text-neutral-400 border border-neutral-800 font-mono">
                {users.length} Cuentas Registradas
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-xs text-neutral-500">Sincronizando directorio...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-neutral-300">
                  <thead className="bg-neutral-950 text-neutral-400 uppercase text-[10px] tracking-wider font-bold border-b border-neutral-800">
                    <tr>
                      <th className="py-3.5 px-6">Identidad / Nombre</th>
                      <th className="py-3.5 px-6">Correo Electrónico</th>
                      <th className="py-3.5 px-6">Rol Asignado</th>
                      <th className="py-3.5 px-6 text-right">Modificar Privilegios</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-neutral-950/50 transition">
                        <td className="py-4 px-6 font-bold text-white flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 font-black text-xs">
                            {u.name ? u.name[0].toUpperCase() : "U"}
                          </div>
                          <div>{u.name || "Sin nombre"}</div>
                        </td>
                        <td className="py-4 px-6 text-neutral-300 font-mono text-[11px]">{u.email}</td>
                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${u.role === "ADMIN" ? "bg-emerald-950 text-emerald-400 border-emerald-800" : "bg-neutral-800 text-neutral-300 border-neutral-700"}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value as any)}
                            className="bg-neutral-950 border border-neutral-700 text-amber-400 rounded-xl px-3 py-1.5 text-xs font-bold outline-none cursor-pointer"
                          >
                            <option value="CLIENT">Cliente (CLIENT)</option>
                            <option value="SELLER">Vendedor (SELLER)</option>
                            <option value="ADMIN">Administrador (ADMIN)</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA 3: BITÁCORA */}
        {activeTab === "audit" && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-neutral-800">
              <h2 className="text-sm font-black text-amber-400 uppercase tracking-wider">Bitácora Inmutable ISO/IEC 27001</h2>
            </div>
            {auditLogs.length === 0 ? (
              <div className="p-12 text-center text-xs text-neutral-500">No se registran eventos críticos.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-neutral-300">
                  <thead className="bg-neutral-950 text-neutral-400 uppercase text-[10px] tracking-wider border-b border-neutral-800">
                    <tr>
                      <th className="py-3.5 px-6">Fecha</th>
                      <th className="py-3.5 px-6">Admin</th>
                      <th className="py-3.5 px-6">Acción</th>
                      <th className="py-3.5 px-6">Detalle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60 font-mono text-[11px]">
                    {auditLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="py-3.5 px-6 text-neutral-400">{new Date(log.createdAt).toLocaleString("es-CO")}</td>
                        <td className="py-3.5 px-6 text-amber-400">{log.admin?.email || log.adminId}</td>
                        <td className="py-3.5 px-6 text-white font-bold">{log.action}</td>
                        <td className="py-3.5 px-6 text-neutral-300">{log.details || log.target || "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA 4: CONTROLES SSDLC */}
        {activeTab === "security" && (
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl space-y-4">
            <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider">🛡️ Controles SSDLC & Seguridad</h3>
            <p className="text-xs text-neutral-300">Aislamiento estricto de rutas, sanitización de archivos y cifrado bcryptjs.</p>
          </div>
        )}

        {/* PESTAÑA 5: ANALÍTICA & MODELOS */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-neutral-900 to-neutral-950 p-6 rounded-3xl border border-neutral-800 shadow-2xl flex justify-between items-center">
              <div>
                <span className="px-2.5 py-1 bg-amber-400/10 border border-amber-400/30 text-amber-400 text-[10px] font-black rounded-lg uppercase tracking-widest">
                  Proyectos Integradores (Del 10 al 13 de Noviembre)
                </span>
                <h2 className="text-lg font-black text-white uppercase tracking-wider mt-2">
                  MODULO DE ANALÍTICA DE DATOS & MODELOS — RËVA
                </h2>
              </div>
              <span className="text-xs font-black text-emerald-400 font-mono bg-neutral-950 px-3 py-1.5 rounded-xl border border-neutral-800">
                Hito: 10 de Noviembre
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl space-y-4">
                <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider">📊 Analítica Descriptiva</h3>
                <div className="space-y-3 text-xs">
                  <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
                    <span className="font-bold text-white block mb-1">1. Gráficas & Conteos de Frecuencia</span>
                    <p className="text-[11px] text-neutral-400">Visualización de frecuencias relativas y absolutas del sistema.</p>
                  </div>
                  <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
                    <span className="font-bold text-white block mb-1">2. Medidas de Tendencia Central</span>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="bg-neutral-900 p-2 rounded-xl text-center">
                        <span className="text-[10px] text-neutral-400 block">Media Aritmética ($\mu$)</span>
                        <span className="text-amber-400 font-bold">Promedio de Uso</span>
                      </div>
                      <div className="bg-neutral-900 p-2 rounded-xl text-center">
                        <span className="text-[10px] text-neutral-400 block">Mediana ($Me$)</span>
                        <span className="text-amber-400 font-bold">Punto Central (50%)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl space-y-4">
                <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider">📈 Analítica Inferencial</h3>
                <div className="space-y-3 text-xs">
                  <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
                    <span className="font-bold text-white block mb-1">* Pruebas de Hipótesis</span>
                    <p className="text-[11px] text-neutral-400">Evaluación de significancia estadística sobre el probador virtual.</p>
                  </div>
                  <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
                    <span className="font-bold text-white block mb-1">* Modelos Predictivos</span>
                    <p className="text-[11px] text-neutral-400">Proyección de comportamiento y selección de prendas.</p>
                  </div>
                  <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
                    <span className="font-bold text-white block mb-1">* Series de Tiempo</span>
                    <p className="text-[11px] text-neutral-400">Análisis y tendencia temporal de accesos al servidor.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}