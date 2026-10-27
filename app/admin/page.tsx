"use client";

import { useState, useEffect } from "react";
import { 
  getAdminStats, 
  getUsersWithRolesAndPermissions, 
  createRole, 
  assignRoleToUser, 
  assignPermissionToUser 
} from "@/actions/admin";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"stats" | "rbac">("rbac");
  
  // ESTADOS DE ESTADÍSTICAS
  const [stats, setStats] = useState<any>(null);

  // ESTADOS DE RBAC (REQUISITO 5)
  const [roleName, setRoleName] = useState("");
  const [roleDesc, setRoleDesc] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [createdRole, setCreatedRole] = useState<any>(null);
  
  const [selectedUser1, setSelectedUser1] = useState("");
  const [selectedUser2, setSelectedUser2] = useState("");
  
  const [perm1User1, setPerm1User1] = useState("MANAGE_CATALOG");
  const [perm2User1, setPerm2User1] = useState("VIEW_ANALYTICS");
  
  const [perm1User2, setPerm1User2] = useState("EDIT_PRICES");
  const [perm2User2, setPerm2User2] = useState("EXPORT_REPORTS");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const loadAllData = async () => {
    // Cargar Estadísticas
    const statsRes = await getAdminStats();
    if (statsRes.success) {
      setStats(statsRes.stats);
    }

    // Cargar Usuarios con Roles y Permisos RBAC
    const usersRes = await getUsersWithRolesAndPermissions();
    if (usersRes.success && usersRes.users) {
      setUsers(usersRes.users);
      if (usersRes.users.length >= 2) {
        setSelectedUser1(usersRes.users[0].id);
        setSelectedUser2(usersRes.users[1].id);
      }
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

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

      await assignPermissionToUser(selectedUser1, perm1User1, "Permiso 1 Usuario 1");
      await assignPermissionToUser(selectedUser1, perm2User1, "Permiso 2 Usuario 1");

      await assignPermissionToUser(selectedUser2, perm1User2, "Permiso 1 Usuario 2");
      await assignPermissionToUser(selectedUser2, perm2User2, "Permiso 2 Usuario 2");

      setMessage(`✓ ¡Éxito! Rol '${createdRole.name}' asignado a 2 usuarios y 2 permisos configurados para cada uno.`);
      await loadAllData();
    } catch (err: any) {
      setMessage("⚠️ Ocurrió un error al configurar la asignación de permisos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 max-w-5xl mx-auto space-y-8">
      {/* ENCABEZADO Y NAVEGACIÓN */}
      <div className="border-b border-zinc-800 pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-amber-500 tracking-wider">PANEL ADMINISTRATIVO RËVA</h1>
          <p className="text-xs text-zinc-400 mt-1">Gestión del sistema, auditoría ISO 27001 y control de acceso RBAC.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("rbac")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === "rbac" ? "bg-amber-500 text-black" : "bg-zinc-900 text-zinc-400 border border-zinc-800"
            }`}
          >
            Requisito 5: Roles & Permisos
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === "stats" ? "bg-amber-500 text-black" : "bg-zinc-900 text-zinc-400 border border-zinc-800"
            }`}
          >
            Estadísticas Globales
          </button>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-xl text-xs font-semibold bg-zinc-900 border border-amber-500/40 text-amber-300">
          {message}
        </div>
      )}

      {/* PESTAÑA 1: ESTADÍSTICAS */}
      {activeTab === "stats" && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-[#181818] p-6 rounded-2xl border border-zinc-800">
              <span className="text-xs text-zinc-400 uppercase tracking-wider">Total Usuarios</span>
              <p className="text-4xl font-extrabold text-white mt-2">{stats.totalUsers}</p>
              <p className="text-[10px] text-emerald-400 mt-1">{stats.verifiedUsers} Verificados</p>
            </div>
            <div className="bg-[#181818] p-6 rounded-2xl border border-zinc-800">
              <span className="text-xs text-zinc-400 uppercase tracking-wider">Total Prendas</span>
              <p className="text-4xl font-extrabold text-white mt-2">{stats.totalGarments}</p>
              <p className="text-[10px] text-zinc-500 mt-1">En catálogo virtual</p>
            </div>
            <div className="bg-[#181818] p-6 rounded-2xl border border-zinc-800">
              <span className="text-xs text-zinc-400 uppercase tracking-wider">Desglose por Rol</span>
              <div className="mt-2 text-xs space-y-1 text-zinc-300">
                <p>Clientes: <span className="font-bold text-amber-400">{stats.rolesBreakdown.CLIENT}</span></p>
                <p>Vendedores: <span className="font-bold text-amber-400">{stats.rolesBreakdown.SELLER}</span></p>
                <p>Admins: <span className="font-bold text-amber-400">{stats.rolesBreakdown.ADMIN}</span></p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 2: REQUISITO 5 (ROLES & PERMISOS RBAC) */}
      {activeTab === "rbac" && (
        <div className="space-y-8">
          {/* PASO 1: CREAR ROL NUEVO */}
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
                placeholder="Descripción del rol"
                value={roleDesc}
                onChange={(e) => setRoleDesc(e.target.value)}
                className="flex-1 px-4 py-2 bg-[#101010] border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs rounded-xl cursor-pointer disabled:opacity-50"
              >
                {loading ? "Creando..." : "Crear Rol"}
              </button>
            </form>
          </div>

          {/* PASO 2: ASIGNAR ROL Y PERMISOS */}
          {createdRole && (
            <div className="bg-[#181818] p-6 rounded-2xl border border-zinc-800 space-y-6">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Paso 2: Asignar Rol '{createdRole.name}' y Permisos a 2 Usuarios
              </h2>

              <div className="grid grid-cols-2 gap-6">
                <div className="p-4 bg-[#101010] rounded-xl border border-zinc-800 space-y-3">
                  <span className="text-xs font-bold text-amber-400">Usuario 1</span>
                  <select
                    value={selectedUser1}
                    onChange={(e) => setSelectedUser1(e.target.value)}
                    className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-xs text-white outline-none"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
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
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
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
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-black font-extrabold rounded-xl text-xs cursor-pointer disabled:opacity-50"
              >
                {loading ? "Procesando asignaciones..." : "Confirmar y Asignar Roles y Permisos"}
              </button>
            </div>
          )}

          {/* MONITORIZACIÓN DE ESTADO */}
          <div className="bg-[#181818] p-6 rounded-2xl border border-zinc-800 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Estado de Usuarios, Roles y Permisos Granulares</h2>
            <div className="space-y-3">
              {users.map((u) => (
                <div key={u.id} className="p-3 bg-[#101010] border border-zinc-800 rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-white">{u.name || "Usuario"} <span className="text-zinc-500">({u.email})</span></p>
                    <p className="text-[10px] text-amber-400 mt-0.5">
                      Rol Principal: <span className="text-zinc-300 font-mono">{u.role}</span> | Roles RBAC: {u.userRoles?.map((r: any) => r.role.name).join(", ") || "Ninguno"}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-emerald-400 block font-mono">
                      Permisos: {u.userPermissions?.map((p: any) => p.permission.name).join(" | ") || "Sin permisos asignados"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}