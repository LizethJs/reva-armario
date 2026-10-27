"use client";

import React, { useState, useEffect } from "react";
import { 
  getAdminStats, 
  getUsers, 
  updateUserRole, 
  getAuditLogs, 
  createRole, 
  assignRoleToUser, 
  assignPermissionToUser, 
  getUsersWithRolesAndPermissions 
} from "@/actions/admin";

export default function AdminPage() {
  const [adminEmailInput, setAdminEmailInput] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<"rbac" | "stats" | "users" | "audit">("rbac");

  const [stats, setStats] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Estados específicos para el Requisito 5 (RBAC)
  const [roleName, setRoleName] = useState("");
  const [roleDesc, setRoleDesc] = useState("");
  const [createdRole, setCreatedRole] = useState<any>(null);
  const [selectedUser1, setSelectedUser1] = useState("");
  const [selectedUser2, setSelectedUser2] = useState("");
  const [perm1User1, setPerm1User1] = useState("MANAGE_CATALOG");
  const [perm2User1, setPerm2User1] = useState("VIEW_ANALYTICS");
  const [perm1User2, setPerm1User2] = useState("EDIT_PRICES");
  const [perm2User2, setPerm2User2] = useState("EXPORT_REPORTS");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuthorize = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await getUsers(adminEmailInput);
    if (res.success) {
      setAuthorized(true);
      loadAllAdminData();
      setMessage("✓ Acceso de Administrador autorizado.");
    } else {
      setMessage(`⚠️ ${res.error}`);
    }
    setLoading(false);
  };

  const loadAllAdminData = async () => {
    if (!adminEmailInput) return;
    
    // Cargar estadísticas
    const statsRes = await getAdminStats();
    if (statsRes.success) setStats(statsRes.stats);

    // Cargar usuarios
    const usersRes = await getUsers(adminEmailInput);
    if (usersRes.success) setUsersList(usersRes.users);

    // Cargar logs de auditoría ISO 27001
    const logsRes = await getAuditLogs(adminEmailInput);
    if (logsRes.success) setAuditLogs(logsRes.logs);

    // Cargar usuarios con roles y permisos para RBAC
    const rbacUsersRes = await getUsersWithRolesAndPermissions();
    if (rbacUsersRes.success && rbacUsersRes.users.length >= 2) {
      setSelectedUser1(rbacUsersRes.users[0].id);
      setSelectedUser2(rbacUsersRes.users[1].id);
    }
  };

  const handleUpdateRole = async (targetUserId: string, newRole: "CLIENT" | "SELLER" | "ADMIN") => {
    const res = await updateUserRole(adminEmailInput, targetUserId, newRole);
    if (res.success) {
      setMessage(`✓ ${res.message}`);
      loadAllAdminData();
    } else {
      setMessage(`⚠️ ${res.error}`);
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await createRole(roleName, roleDesc);
    if (res.success) {
      setCreatedRole(res.role);
      setMessage(`✓ ${res.message}`);
    } else {
      setMessage(`⚠️ ${res.message}`);
    }
    setLoading(false);
  };

  const handleExecuteFullRequirement = async () => {
    if (!createdRole) {
      setMessage("⚠️ Primero debe crear un nuevo rol.");
      return;
    }
    if (!selectedUser1 || !selectedUser2 || selectedUser1 === selectedUser2) {
      setMessage("⚠️ Seleccione 2 usuarios diferentes de la lista.");
      return;
    }

    setLoading(true);
    try {
      await assignRoleToUser(selectedUser1, createdRole.id);
      await assignRoleToUser(selectedUser2, createdRole.id);

      await assignPermissionToUser(selectedUser1, perm1User1, "Permiso 1 U1");
      await assignPermissionToUser(selectedUser1, perm2User1, "Permiso 2 U1");

      await assignPermissionToUser(selectedUser2, perm1User2, "Permiso 1 U2");
      await assignPermissionToUser(selectedUser2, perm2User2, "Permiso 2 U2");

      setMessage(`✓ ¡Éxito! Rol '${createdRole.name}' asignado a 2 usuarios y 2 permisos configurados para cada uno.`);
      loadAllAdminData();
    } catch (err: any) {
      setMessage("⚠️ Error al configurar las asignaciones.");
    } finally {
      setLoading(false);
    }
  };

  if (!authorized) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center p-6">
        <div className="bg-[#181818] p-8 rounded-2xl border border-zinc-800 max-w-md w-full space-y-6">
          <div>
            <h1 className="text-xl font-extrabold text-amber-500">Panel de Administración RËVA</h1>
            <p className="text-xs text-zinc-400 mt-1">Ingrese su correo de Administrador para validar el acceso y la auditoría.</p>
          </div>
          {message && <div className="p-3 bg-zinc-900 border border-amber-500/30 text-amber-300 text-xs rounded-xl">{message}</div>}
          <form onSubmit={handleAuthorize} className="space-y-4">
            <input
              type="email"
              required
              placeholder="admin@reva.com"
              value={adminEmailInput}
              onChange={(e) => setAdminEmailInput(e.target.value)}
              className="w-full px-4 py-3 bg-[#101010] border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs rounded-xl cursor-pointer"
            >
              {loading ? "Validando..." : "Acceder al Panel"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8 max-w-5xl mx-auto space-y-8">
      {/* ENCABEZADO Y PESTAÑAS */}
      <div className="border-b border-zinc-800 pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-amber-500 tracking-wider">PANEL ADMINISTRATIVO RËVA</h1>
          <p className="text-xs text-zinc-400 mt-1">Sesión activa como: <span className="text-amber-400 font-mono">{adminEmailInput}</span></p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab("rbac")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition ${activeTab === "rbac" ? "bg-amber-500 text-black" : "bg-zinc-900 text-zinc-400 border border-zinc-800"}`}
          >
            Requisito 5 (RBAC)
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition ${activeTab === "stats" ? "bg-amber-500 text-black" : "bg-zinc-900 text-zinc-400 border border-zinc-800"}`}
          >
            Estadísticas
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition ${activeTab === "users" ? "bg-amber-500 text-black" : "bg-zinc-900 text-zinc-400 border border-zinc-800"}`}
          >
            Gestión de Usuarios
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition ${activeTab === "audit" ? "bg-amber-500 text-black" : "bg-zinc-900 text-zinc-400 border border-zinc-800"}`}
          >
            Bitácora ISO 27001
          </button>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-xl text-xs font-semibold bg-zinc-900 border border-amber-500/40 text-amber-300">
          {message}
        </div>
      )}

      {/* PESTAÑA: REQUISITO 5 (ROLES & PERMISOS RBAC) */}
      {activeTab === "rbac" && (
        <div className="space-y-8">
          <div className="bg-[#181818] p-6 rounded-2xl border border-zinc-800 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Paso 1: Crear Rol Nuevo</h2>
            <form onSubmit={handleCreateRole} className="flex gap-4">
              <input
                type="text"
                required
                placeholder="Ej: DISENADOR_SENIOR"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                className="flex-1 px-4 py-2 bg-[#101010] border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-amber-500"
              />
              <input
                type="text"
                placeholder="Descripción corta"
                value={roleDesc}
                onChange={(e) => setRoleDesc(e.target.value)}
                className="flex-1 px-4 py-2 bg-[#101010] border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs rounded-xl cursor-pointer"
              >
                Crear Rol
              </button>
            </form>
          </div>

          {createdRole && (
            <div className="bg-[#181818] p-6 rounded-2xl border border-zinc-800 space-y-6">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Paso 2: Asignar Rol '{createdRole.name}' y Permisos a 2 Usuarios
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-[#101010] rounded-xl border border-zinc-800 space-y-3">
                  <span className="text-xs font-bold text-amber-400">Usuario 1</span>
                  <select
                    value={selectedUser1}
                    onChange={(e) => setSelectedUser1(e.target.value)}
                    className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-xs text-white outline-none"
                  >
                    {usersList.map((u) => (
                      <option key={u.id} value={u.id}>{u.name || u.email} ({u.email})</option>
                    ))}
                  </select>
                  <div className="space-y-2">
                    <label className="text-[10px] text-zinc-400">Permiso 1:</label>
                    <input
                      type="text"
                      value={perm1User1}
                      onChange={(e) => setPerm1User1(e.target.value)}
                      className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-xs text-white"
                    />
                    <label className="text-[10px] text-zinc-400">Permiso 2:</label>
                    <input
                      type="text"
                      value={perm2User1}
                      onChange={(e) => setPerm2User1(e.target.value)}
                      className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-xs text-white"
                    />
                  </div>
                </div>

                <div className="p-4 bg-[#101010] rounded-xl border border-zinc-800 space-y-3">
                  <span className="text-xs font-bold text-amber-400">Usuario 2</span>
                  <select
                    value={selectedUser2}
                    onChange={(e) => setSelectedUser2(e.target.value)}
                    className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-xs text-white outline-none"
                  >
                    {usersList.map((u) => (
                      <option key={u.id} value={u.id}>{u.name || u.email} ({u.email})</option>
                    ))}
                  </select>
                  <div className="space-y-2">
                    <label className="text-[10px] text-zinc-400">Permiso 1:</label>
                    <input
                      type="text"
                      value={perm1User2}
                      onChange={(e) => setPerm1User2(e.target.value)}
                      className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-xs text-white"
                    />
                    <label className="text-[10px] text-zinc-400">Permiso 2:</label>
                    <input
                      type="text"
                      value={perm2User2}
                      onChange={(e) => setPerm2User2(e.target.value)}
                      className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleExecuteFullRequirement}
                disabled={loading}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-black font-extrabold rounded-xl text-xs cursor-pointer"
              >
                Confirmar y Asignar Roles y Permisos Granulares
              </button>
            </div>
          )}
        </div>
      )}

      {/* PESTAÑA: ESTADÍSTICAS */}
      {activeTab === "stats" && stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#181818] p-6 rounded-2xl border border-zinc-800">
            <span className="text-xs text-zinc-400 uppercase tracking-wider">Total Usuarios</span>
            <p className="text-4xl font-extrabold text-white mt-2">{stats.totalUsers}</p>
            <p className="text-[10px] text-emerald-400 mt-1">{stats.verifiedUsers} Verificados</p>
          </div>
          <div className="bg-[#181818] p-6 rounded-2xl border border-zinc-800">
            <span className="text-xs text-zinc-400 uppercase tracking-wider">Total Prendas</span>
            <p className="text-4xl font-extrabold text-white mt-2">{stats.totalGarments}</p>
          </div>
          <div className="bg-[#181818] p-6 rounded-2xl border border-zinc-800">
            <span className="text-xs text-zinc-400 uppercase tracking-wider">Roles Base</span>
            <div className="mt-2 text-xs space-y-1 text-zinc-300">
              <p>Clientes: {stats.rolesBreakdown.CLIENT}</p>
              <p>Vendedores: {stats.rolesBreakdown.SELLER}</p>
              <p>Admins: {stats.rolesBreakdown.ADMIN}</p>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA: GESTIÓN DE USUARIOS Y ROLES BASE */}
      {activeTab === "users" && (
        <div className="bg-[#181818] p-6 rounded-2xl border border-zinc-800 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Usuarios Registrados en el Sistema</h2>
          <div className="space-y-3">
            {usersList.map((u) => (
              <div key={u.id} className="p-4 bg-[#101010] border border-zinc-800 rounded-xl flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold text-white">{u.name || "Sin nombre"} <span className="text-zinc-500">({u.email})</span></p>
                  <p className="text-[10px] text-emerald-400 mt-0.5">Verificado: {u.isVerified ? "Sí" : "No"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={u.role}
                    onChange={(e) => handleUpdateRole(u.id, e.target.value as any)}
                    className="p-2 bg-black border border-zinc-800 rounded-lg text-xs text-amber-400 outline-none"
                  >
                    <option value="CLIENT">CLIENT</option>
                    <option value="SELLER">SELLER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PESTAÑA: BITÁCORA DE AUDITORÍA (ISO 27001) */}
      {activeTab === "audit" && (
        <div className="bg-[#181818] p-6 rounded-2xl border border-zinc-800 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Bitácora de Auditoría de Seguridad (ISO 27001)</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3 bg-[#101010] border border-zinc-800 rounded-xl text-xs space-y-1">
                <div className="flex justify-between text-amber-400 font-mono">
                  <span>{log.action}</span>
                  <span className="text-[10px] text-zinc-500">{new Date(log.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-zinc-300">{log.details}</p>
                <p className="text-[10px] text-zinc-500">Admin responsable: {log.admin?.email}</p>
              </div>
            ))}
            {auditLogs.length === 0 && <p className="text-xs text-zinc-500">No hay registros de auditoría aún.</p>}
          </div>
        </div>
      )}
    </div>
  );
}