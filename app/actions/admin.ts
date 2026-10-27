"use server";

import { prisma } from "@/lib/prisma";

// --- AUDITORÍA ISO 27001 ---
async function logAuditAction(adminId: string, action: string, target: string, details?: string) {
  try {
    await prisma.auditLog.create({
      data: { adminId, action, target, details },
    });
  } catch (error) {
    console.error("Error registrando log de auditoría:", error);
  }
}

// 1. Obtiene la lista de usuarios para el panel
export async function getUsers(adminEmail: string) {
  try {
    const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (!admin || admin.role !== "ADMIN") {
      return { success: false, error: "Acceso denegado: Se requieren privilegios de Administrador." };
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, users };
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return { success: false, error: "Error interno del servidor al consultar usuarios." };
  }
}

export async function getUsersList(adminEmail: string) {
  const res = await getUsers(adminEmail);
  if (!res.success) throw new Error(res.error);
  return res.users;
}

// 2. Modifica el rol básico de un usuario y registra auditoría
export async function updateUserRole(
  adminEmail: string,
  targetUserId: string,
  newRole: "CLIENT" | "SELLER" | "ADMIN"
) {
  try {
    const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (!admin || admin.role !== "ADMIN") {
      return { success: false, error: "No estás autorizado para esta acción." };
    }

    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: { role: newRole },
    });

    await logAuditAction(
      admin.id,
      "UPDATE_USER_ROLE",
      targetUserId,
      `El administrador ${admin.email} actualizó el rol de ${updatedUser.email} a ${newRole}`
    );

    return { success: true, message: `Rol de ${updatedUser.email} actualizado a ${newRole} con éxito.` };
  } catch (error) {
    console.error("Error al actualizar rol:", error);
    return { success: false, error: "Error al intentar actualizar el rol." };
  }
}

// 3. Obtiene la bitácora de auditoría
export async function getAuditLogs(adminEmail: string) {
  try {
    const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (!admin || admin.role !== "ADMIN") {
      return { success: false, error: "Acceso denegado." };
    }

    const logs = await prisma.auditLog.findMany({
      include: { admin: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return { success: true, logs };
  } catch (error) {
    console.error("Error al obtener registros de auditoría:", error);
    return { success: false, error: "Error interno al consultar bitácora." };
  }
}

// --- FUNCIONES PARA EL REQUISITO 5: GESTIÓN DE ROLES Y PERMISOS (RBAC) ---

export async function createRole(roleName: string, description: string) {
  try {
    // @ts-ignore
    const role = await prisma.role.create({
      data: { name: roleName.trim().toUpperCase(), description },
    });
    return { success: true, role, message: `Rol '${role.name}' creado exitosamente.` };
  } catch (error: any) {
    return { success: false, message: error.message || "Error al crear el rol." };
  }
}

export async function assignRoleToUser(userId: string, roleId: string) {
  try {
    // @ts-ignore
    await prisma.userRole.create({
      data: { userId, roleId },
    });
    return { success: true, message: "Rol asignado correctamente al usuario." };
  } catch (error: any) {
    return { success: false, message: "El usuario ya tiene asignado este rol o no existe." };
  }
}

export async function assignPermissionToUser(userId: string, permissionName: string, description: string) {
  try {
    // @ts-ignore
    let permission = await prisma.permission.findUnique({
      where: { name: permissionName.trim().toUpperCase() },
    });

    if (!permission) {
      // @ts-ignore
      permission = await prisma.permission.create({
        data: { name: permissionName.trim().toUpperCase(), description },
      });
    }

    // @ts-ignore
    await prisma.userPermission.create({
      data: { userId, permissionId: permission.id },
    });

    return { success: true, message: `Permiso asignado al usuario.` };
  } catch (error: any) {
    return { success: false, message: "El usuario ya cuenta con este permiso asignado." };
  }
}

export async function getUsersWithRolesAndPermissions() {
  try {
    const users = await prisma.user.findMany({
      take: 10,
      include: {
        // @ts-ignore
        userRoles: { include: { role: true } },
        // @ts-ignore
        userPermissions: { include: { permission: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, users };
  } catch (error: any) {
    return { success: false, users: [], message: error.message };
  }
}