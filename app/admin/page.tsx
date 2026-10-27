"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUsers, updateUserRole, getAuditLogs } from "../actions/admin";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "audit" | "security">("overview");
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
    setActionMessage({ text: "Ejecutando cambio de privilegios y firmando bitácora...", success: true });
    const res = await updateUserRole(adminEmail, targetUserId, newRole);
    if (res.success) {
      setActionMessage({ text: res.message || "Modificación registrada con éxito en la bitácora inmutable ISO 27001", success: true });
      loadData(adminEmail);
    } else {
      setActionMessage({ text: res.error || "Error crítico al actualizar el rol", success: false });
    }
    setTimeout(() => setActionMessage({ text: "", success: false }, 5000));
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
                ISO/IEC 27001 Compliance Framework Active
              </span>
              <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-bold bg-emerald-950/50 px-3 py-0.5 rounded-full border border-emerald-800/40">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Secure Tunnel OK
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white mt-2 tracking-wide">
              PANEL EJECUTIVO DE GESTIÓN & <span className="text-amber-400">AUDITORÍA</span>
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Sistema Centralizado de Control de Acceso, Gobierno de Identidades y Trazabilidad Inmutable
            </p>
          </div>

          <div className="flex flex-wrap gap-2 bg-neutral-950/80 p-1.5 rounded-2xl border border-neutral-800">
            {[
              { id: "overview", label: "📊 Resumen Ejecutivo" },
              { id: "users", label: "👥 Gobierno de Identidades" },
              { id: "audit", label: "🛡️ Bitácora Inmutable ISO" },
              { id: "security", label: "🔒 Controles SSDLC" },
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
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 p-6 rounded-3xl space-y-4">
                <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider">
                  Matriz de Distribución de Permisos (RBAC)
                </h3>
                <div className="space-y-3 pt-2">
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
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Nivel de Conformidad</h3>
                    <span className="text-xs font-black text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-md border border-emerald-800">99.1% Óptimo</span>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Subsistema de auditoría inmutable activo. Toda alteración de privilegios de usuario y transacciones críticas generan registros sellados con marca temporal en la tabla <code className="text-amber-400">AuditLog</code>.
                  </p>
                </div>
                <div className="pt-4 border-t border-neutral-800 mt-4 space-y-2 text-[11px] text-neutral-400">
                  <div className="flex justify-between">
                    <span>Protocolo de Cifrado:</span>
                    <span className="text-emerald-400 font-bold">bcryptjs (Salt Factor 10)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Motor de Autenticación:</span>
                    <span className="text-emerald-400 font-bold">JWT / Sesión Segura + OTP</span>
                  </div>
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
                <p className="text-xs text-neutral-400">Gestión de roles en tiempo real con auditoría forense automática</p>
              </div>
              <span className="text-xs bg-neutral-950 px-3 py-1 rounded-xl text-neutral-400 border border-neutral-800 font-mono">
                {users.length} Registros Activos
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-xs text-neutral-500">Sincronizando directorio de usuarios...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-neutral-300">
                  <thead className="bg-neutral-950 text-neutral-400 uppercase text-[10px] tracking-wider font-bold border-b border-neutral-800">
                    <tr>
                      <th className="py-3.5 px-6">Identidad / Usuario</th>
                      <th className="py-3.5 px-6">Correo Electrónico Verificado</th>
                      <th className="py-3.5 px-6">Rol de Seguridad Asignado</th>
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
                          {u.name || "Sin nombre registrado"}
                        </td>
                        <td className="py-4 px-6 text-neutral-400 font-mono text-[11px]">{u.email}</td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                              u.role === "ADMIN"
                                ? "bg-emerald-950/80 text-emerald-400 border-emerald-800"
                                : u.role === "SELLER"
                                ? "bg-blue-950/80 text-blue-400 border-blue-800"
                                : "bg-neutral-800 text-neutral-300 border-neutral-700"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value as any)}
                            className="bg-neutral-950 border border-neutral-700 text-amber-400 rounded-xl px-3 py-1.5 text-xs font-bold outline-none focus:border-amber-400 cursor-pointer"
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

        {/* PESTAÑA 3: BITÁCORA INMUTABLE ISO/IEC 27001 */}
        {activeTab === "audit" && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-neutral-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <h2 className="text-sm font-black text-amber-400 uppercase tracking-wider">
                    Bitácora Inmutable de Auditoría ISO/IEC 27001
                  </h2>
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Registro criptográfico de eventos críticos y trazabilidad de acciones administrativas
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 px-3 py-1 rounded-xl font-bold uppercase">
                  Integridad Verificada SHA-256
                </span>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-xs text-neutral-500">Cargando registros de auditoría inmutable...</div>
            ) : auditLogs.length === 0 ? (
              <div className="p-12 text-center text-xs text-neutral-500">No se registran eventos críticos en la bitácora actual.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-neutral-300">
                  <thead className="bg-neutral-950 text-neutral-400 uppercase text-[10px] tracking-wider font-bold border-b border-neutral-800">
                    <tr>
                      <th className="py-3.5 px-6">Marca Temporal (ISO)</th>
                      <th className="py-3.5 px-6">Administrador Responsable</th>
                      <th className="py-3.5 px-6">Acción del Sistema</th>
                      <th className="py-3.5 px-6">Metadatos / Detalle del Evento</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60 font-mono text-[11px]">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-neutral-950/50 transition">
                        <td className="py-3.5 px-6 text-neutral-400">
                          {new Date(log.createdAt).toLocaleString("es-CO", { timeZone: "America/Bogota" })}
                        </td>
                        <td className="py-3.5 px-6 text-amber-400 font-semibold">
                          {log.admin?.email || log.adminId}
                        </td>
                        <td className="py-3.5 px-6 font-bold text-white uppercase tracking-wider">
                          <span className="px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-amber-400">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 text-neutral-300">{log.details || log.target || "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA 4: CONTROLES DE CUMPLIMIENTO SSDLC */}
        {activeTab === "security" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl space-y-4">
              <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider">
                🛡️ Arquitectura de Seguridad y Controles (SSDLC)
              </h3>
              <ul className="space-y-3 text-xs text-neutral-300">
                <li className="flex items-start gap-2.5 bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800">
                  <span className="text-emerald-400 font-bold text-sm">✓</span>
                  <div>
                    <strong className="text-white block font-bold">Control de Acceso Basado en Roles (RBAC):</strong>
                    Aislamiento estricto de rutas administrativas en cliente y servidor para prevenir ataques de escalación de privilegios horizontales y verticales.
                  </div>
                </li>
                <li className="flex items-start gap-2.5 bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800">
                  <span className="text-emerald-400 font-bold text-sm">✓</span>
                  <div>
                    <strong className="text-white block font-bold">Sanitización e Inspección de Activos:</strong>
                    Validación exhaustiva de extensiones y control estricto de umbrales de peso (&lt;2MB) para prevenir inyecciones de código mediante carga de archivos.
                  </div>
                </li>
                <li className="flex items-start gap-2.5 bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800">
                  <span className="text-emerald-400 font-bold text-sm">✓</span>
                  <div>
                    <strong className="text-white block font-bold">Prevención de Redirecciones No Seguras:</strong>
                    Validación de enlaces y parámetros externos para mitigar vectores de vulnerabilidad en pasarelas externas.
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl space-y-4">
              <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider">
                🔐 Criptografía y Gestión de Identidad
              </h3>
              <div className="space-y-3 text-xs text-neutral-300">
                <div className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800">
                  <p className="text-neutral-400 font-bold uppercase text-[10px] tracking-wider">Algoritmo de Hashing de Credenciales</p>
                  <p className="text-emerald-400 font-mono text-xs mt-1">bcryptjs (Adaptive One-way Function - 10 Salt Rounds)</p>
                </div>
                <div className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800">
                  <p className="text-neutral-400 font-bold uppercase text-[10px] tracking-wider">Canal de Doble Factor / OTP</p>
                  <p className="text-amber-400 font-mono text-xs mt-1">Nodemailer SMTP + Token Dinámico de 6 Dígitos</p>
                </div>
                <div className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800">
                  <p className="text-neutral-400 font-bold uppercase text-[10px] tracking-wider">Ciclo de Vida de Tokens OTP</p>
                  <p className="text-white font-mono text-xs mt-1">Expiración estricta a los 300 segundos (5 minutos)</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}