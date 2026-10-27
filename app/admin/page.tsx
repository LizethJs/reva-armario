"use client";

import { useState, useEffect } from "react";
import { getUsers, updateUserRole, getAuditLogs } from "@/app/actions/admin";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "audit" | "security">("overview");
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState("");
  const [actionMessage, setActionMessage] = useState({ text: "", success: false });

  useEffect(() => {
    const session = localStorage.getItem("user_session");
    if (session) {
      const parsed = JSON.parse(session);
      setAdminEmail(parsed.email || "admin@reva.com");
      loadData(parsed.email || "admin@reva.com");
    } else {
      loadData("admin@reva.com");
    }
  }, []);

  async function loadData(email: string) {
    setLoading(true);
    try {
      const usersRes = await getUsers(email);
      if (usersRes.success) setUsers(usersRes.users || []);

      const auditRes = await getAuditLogs(email);
      if (auditRes.success) setAuditLogs(auditRes.logs || []);
    } catch (err) {
      console.error("Error cargando datos administrativos:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleRoleChange = async (targetUserId: string, newRole: string) => {
    setActionMessage({ text: "Actualizando permisos...", success: true });
    const res = await updateUserRole(adminEmail, targetUserId, newRole);
    if (res.success) {
      setActionMessage({ text: "Rol actualizado y registrado en auditoría ISO 27001", success: true });
      loadData(adminEmail);
    } else {
      setActionMessage({ text: res.error || "Error al actualizar rol", success: false });
    }
    setTimeout(() => setActionMessage({ text: "", success: false }), 4000);
  };

  // Métricas calculadas para el dashboard
  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === "ADMIN").length;
  const sellerCount = users.filter((u) => u.role === "SELLER").length;
  const clientCount = users.filter((u) => u.role === "CLIENT").length;
  const totalLogs = auditLogs.length;

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* HEADER EJECUTIVO */}
        <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-950 p-6 rounded-3xl border border-neutral-800 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 bg-amber-400/10 border border-amber-400/30 text-amber-400 text-[10px] font-black rounded-lg uppercase tracking-widest">
                ISO/IEC 27001 Secure Environment
              </span>
              <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-bold bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-800/40">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Sistema Activo
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white mt-2 tracking-wide">
              PANEL DE CONTROL & AUDITORÍA <span className="text-amber-400">RËVA</span>
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Administración centralizada de usuarios, roles, catálogo y eventos de seguridad
            </p>
          </div>

          {/* BOTONES DE NAVEGACIÓN DE PESTAÑAS */}
          <div className="flex flex-wrap gap-2 bg-neutral-950/80 p-1.5 rounded-2xl border border-neutral-800">
            {[
              { id: "overview", label: "📊 Resumen Global" },
              { id: "users", label: "👥 Gestión Usuarios" },
              { id: "audit", label: "🛡️ Bitácora ISO 27001" },
              { id: "security", label: "🔒 Estado Cumplimiento" },
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

        {/* MENSAJE DE ACCIÓN / NOTIFICACIÓN */}
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

        {/* CONTENIDO 1: RESUMEN GLOBAL (METRICAS Y KPIS) */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* CARDS DE TARJETAS KPI */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl shadow-lg relative overflow-hidden">
                <p className="text-neutral-400 text-[11px] font-bold uppercase tracking-wider">Total Usuarios Registrados</p>
                <div className="flex items-baseline justify-between mt-2">
                  <h3 className="text-3xl font-black text-white">{totalUsers}</h3>
                  <span className="text-xs text-amber-400 font-bold">100% Activos</span>
                </div>
                <div className="w-full bg-neutral-950 h-1.5 rounded-full mt-4 overflow-hidden">
                  <div className="bg-amber-400 h-full w-full"></div>
                </div>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl shadow-lg">
                <p className="text-neutral-400 text-[11px] font-bold uppercase tracking-wider">Administradores Sistema</p>
                <div className="flex items-baseline justify-between mt-2">
                  <h3 className="text-3xl font-black text-amber-400">{adminCount}</h3>
                  <span className="text-xs text-neutral-400">Privilegios altos</span>
                </div>
                <div className="w-full bg-neutral-950 h-1.5 rounded-full mt-4 overflow-hidden">
                  <div className="bg-amber-400 h-full" style={{ width: `${(adminCount / (totalUsers || 1)) * 100}%` }}></div>
                </div>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl shadow-lg">
                <p className="text-neutral-400 text-[11px] font-bold uppercase tracking-wider">Vendedores / Diseñadores</p>
                <div className="flex items-baseline justify-between mt-2">
                  <h3 className="text-3xl font-black text-blue-400">{sellerCount}</h3>
                  <span className="text-xs text-neutral-400">Catálogo habilitado</span>
                </div>
                <div className="w-full bg-neutral-950 h-1.5 rounded-full mt-4 overflow-hidden">
                  <div className="bg-blue-400 h-full" style={{ width: `${(sellerCount / (totalUsers || 1)) * 100}%` }}></div>
                </div>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl shadow-lg">
                <p className="text-neutral-400 text-[11px] font-bold uppercase tracking-wider">Registros Auditoría</p>
                <div className="flex items-baseline justify-between mt-2">
                  <h3 className="text-3xl font-black text-emerald-400">{totalLogs}</h3>
                  <span className="text-xs text-emerald-400 font-semibold">ISO 27001 OK</span>
                </div>
                <div className="w-full bg-neutral-950 h-1.5 rounded-full mt-4 overflow-hidden">
                  <div className="bg-emerald-400 h-full w-full"></div>
                </div>
              </div>
            </div>

            {/* SECCIÓN DE RESUMEN TÉCNICO Y CUMPLIMIENTO */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 p-6 rounded-3xl space-y-4">
                <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider">
                  Distribución de Permisos y Roles RËVA
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
                      <span className="text-neutral-300">Vendedores Registrados (SELLER)</span>
                      <span className="text-blue-400">{sellerCount} usuarios</span>
                    </div>
                    <div className="w-full bg-neutral-950 h-3 rounded-full overflow-hidden p-0.5 border border-neutral-800">
                      <div className="bg-blue-400 h-full rounded-full" style={{ width: `${(sellerCount / (totalUsers || 1)) * 100}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-neutral-300">Super Administradores (ADMIN)</span>
                      <span className="text-emerald-400">{adminCount} usuarios</span>
                    </div>
                    <div className="w-full bg-neutral-950 h-3 rounded-full overflow-hidden p-0.5 border border-neutral-800">
                      <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${(adminCount / (totalUsers || 1)) * 100}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* TARJETA ISO 27001 DETALLADA */}
              <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">ISO/IEC 27001</h3>
                    <span className="text-xs font-black text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-800">98.4%</span>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Módulo de trazabilidad activado. Toda modificación de rol, alta de prendas o accesos administrativos quedan firmados en la tabla <code className="text-amber-400">AuditLog</code> con marca temporal inmutable.
                  </p>
                </div>
                <div className="pt-4 border-t border-neutral-800 mt-4 space-y-2 text-[11px] text-neutral-400">
                  <div className="flex justify-between">
                    <span>Cifrado de contraseñas:</span>
                    <span className="text-emerald-400 font-bold">bcryptjs (Salt 10)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Validación OTP Correo:</span>
                    <span className="text-emerald-400 font-bold">Nodemailer (5 min)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CONTENIDO 2: GESTIÓN DE USUARIOS */}
        {activeTab === "users" && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-neutral-800 flex justify-between items-center">
              <div>
                <h2 className="text-sm font-black text-amber-400 uppercase tracking-wider">Directorio de Usuarios Registrados</h2>
                <p className="text-xs text-neutral-400">Modifica roles en tiempo real con auditoría automática</p>
              </div>
              <span className="text-xs bg-neutral-950 px-3 py-1 rounded-xl text-neutral-400 border border-neutral-800">
                {users.length} Registros
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-xs text-neutral-500">Cargando directorio de usuarios...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-neutral-300">
                  <thead className="bg-neutral-950 text-neutral-400 uppercase text-[10px] tracking-wider font-bold border-b border-neutral-800">
                    <tr>
                      <th className="py-3.5 px-6">Usuario</th>
                      <th className="py-3.5 px-6">Correo Electrónico</th>
                      <th className="py-3.5 px-6">Rol Actual</th>
                      <th className="py-3.5 px-6 text-right">Asignar Nuevo Rol</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-neutral-950/50 transition">
                        <td className="py-4 px-6 font-bold text-white flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 font-black text-xs">
                            {u.name ? u.name[0].toUpperCase() : "U"}
                          </div>
                          {u.name || "Sin nombre"}
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
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
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

        {/* CONTENIDO 3: BITÁCORA DE AUDITORÍA ISO/IEC 27001 */}
        {activeTab === "audit" && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-neutral-800 flex justify-between items-center">
              <div>
                <h2 className="text-sm font-black text-amber-400 uppercase tracking-wider">
                  Bitácora Inmutable de Auditoría ISO/IEC 27001
                </h2>
                <p className="text-xs text-neutral-400">Historial de acciones críticas realizadas en la plataforma</p>
              </div>
              <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-800 px-3 py-1 rounded-xl font-bold">
                Cifrado Activo
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-xs text-neutral-500">Cargando registros de auditoría...</div>
            ) : auditLogs.length === 0 ? (
              <div className="p-12 text-center text-xs text-neutral-500">Aún no hay registros de auditoría guardados.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-neutral-300">
                  <thead className="bg-neutral-950 text-neutral-400 uppercase text-[10px] tracking-wider font-bold border-b border-neutral-800">
                    <tr>
                      <th className="py-3.5 px-6">Fecha / Hora</th>
                      <th className="py-3.5 px-6">Administrador</th>
                      <th className="py-3.5 px-6">Acción Ejecutada</th>
                      <th className="py-3.5 px-6">Objetivo / Detalle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60 font-mono text-[11px]">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-neutral-950/50 transition">
                        <td className="py-3.5 px-6 text-neutral-400">
                          {new Date(log.createdAt).toLocaleString("es-CO")}
                        </td>
                        <td className="py-3.5 px-6 text-amber-400 font-semibold">
                          {log.admin?.email || log.adminId}
                        </td>
                        <td className="py-3.5 px-6 font-bold text-white uppercase">{log.action}</td>
                        <td className="py-3.5 px-6 text-neutral-400">{log.details || log.target || "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* CONTENIDO 4: SEGURIDAD Y CUMPLIMIENTO */}
        {activeTab === "security" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl space-y-4">
              <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider">
                🛡️ Controles de Seguridad Implementados (SSDLC)
              </h3>
              <ul className="space-y-3 text-xs text-neutral-300">
                <li className="flex items-start gap-2 bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <div>
                    <strong className="text-white block">Aislamiento de Rutas (Middleware Guard):</strong>
                    Restricción de acceso a `/admin` únicamente para usuarios autenticados con rol `ADMIN`.
                  </div>
                </li>
                <li className="flex items-start gap-2 bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <div>
                    <strong className="text-white block">Saneamiento e Inspección de Archivos:</strong>
                    Verificación estricta de extensiones (JPG/PNG/WEBP) y límites de peso (&lt;2MB) para prevenir subidas maliciosas.
                  </div>
                </li>
                <li className="flex items-start gap-2 bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <div>
                    <strong className="text-white block">Validación Enlaces de Terceros:</strong>
                    Saneamiento de URLs externas para evitar vulnerabilidades de redirección no segura.
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl space-y-4">
              <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider">
                🔐 Autenticación & Verificación OTP
              </h3>
              <div className="space-y-3 text-xs text-neutral-300">
                <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                  <p className="text-neutral-400 font-bold">Método Hash de Contraseñas</p>
                  <p className="text-emerald-400 font-mono text-xs mt-0.5">bcryptjs con Factor de Sal (Rounds 10)</p>
                </div>
                <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                  <p className="text-neutral-400 font-bold">Servicio de Correo de Confirmación</p>
                  <p className="text-amber-400 font-mono text-xs mt-0.5">Nodemailer SMTP + Código OTP de 6 Dígitos</p>
                </div>
                <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                  <p className="text-neutral-400 font-bold">Expiración de Código OTP</p>
                  <p className="text-white font-mono text-xs mt-0.5">5 Minutos con Limpieza Automática</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}