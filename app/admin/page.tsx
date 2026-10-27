"use client";

import { useState, useEffect } from "react";
import { getUsersList, updateUserRole, getAuditLogs } from "../actions/admin";
export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"users" | "audit">("users");
  const [loading, setLoading] = useState(true);

  const adminEmail = "admin@reva.com"; // Cambiar por tu correo de sesión de admin

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const userList = await getUsersList(adminEmail);
      const auditData = await getAuditLogs(adminEmail);
      setUsers(userList);
      setLogs(auditData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRoleChange(userId: string, newRole: "CLIENT" | "SELLER" | "ADMIN") {
    const res = await updateUserRole(adminEmail, userId, newRole);
    if (res.success) {
      alert(res.message);
      loadData();
    } else {
      alert(res.message);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-neutral-900 p-6 rounded-2xl border border-neutral-800">
          <div>
            <h1 className="text-xl font-black text-amber-400">PANEL DE ADMINISTRACIÓN RËVA</h1>
            <p className="text-xs text-neutral-400 mt-1">Control de accesos, roles y registros de auditoría</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("users")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === "users" ? "bg-amber-400 text-neutral-950" : "bg-neutral-800 text-neutral-300"
              }`}
            >
              Usuarios
            </button>
            <button
              onClick={() => setActiveTab("audit")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === "audit" ? "bg-amber-400 text-neutral-950" : "bg-neutral-800 text-neutral-300"
              }`}
            >
              Auditoría
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-neutral-500 text-xs">Cargando panel seguro...</div>
        ) : activeTab === "users" ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="bg-neutral-950 text-neutral-400 uppercase text-[10px] border-b border-neutral-800">
                <tr>
                  <th className="p-4">Nombre</th>
                  <th className="p-4">Correo</th>
                  <th className="p-4">Rol Actual</th>
                  <th className="p-4 text-right">Modificar Rol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-neutral-800/40">
                    <td className="p-4 font-semibold text-white">{u.name || "Sin nombre"}</td>
                    <td className="p-4 text-neutral-400">{u.email}</td>
                    <td className="p-4 font-bold text-amber-400">{u.role}</td>
                    <td className="p-4 text-right">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as any)}
                        className="bg-neutral-950 border border-neutral-700 rounded-lg px-2 py-1 text-xs text-white outline-none focus:border-amber-400"
                      >
                        <option value="CLIENT">CLIENT</option>
                        <option value="SELLER">SELLER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="bg-neutral-950 text-neutral-400 uppercase text-[10px] border-b border-neutral-800">
                <tr>
                  <th className="p-4">Fecha / Hora</th>
                  <th className="p-4">Admin</th>
                  <th className="p-4">Acción</th>
                  <th className="p-4">Detalles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-800/40">
                    <td className="p-4 text-neutral-400">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="p-4 font-medium text-white">{log.admin.email}</td>
                    <td className="p-4 font-bold text-amber-400">{log.action}</td>
                    <td className="p-4 text-neutral-400">{log.details}</td>
                  </tr>
                ))}probables</tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}