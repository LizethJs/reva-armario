"use server";

import { prisma } from "@/lib/prisma";

// Registra acciones críticas en la tabla AuditLog (Cumplimiento ISO 27001)
async function logAuditAction(adminId: string, action: string, target: string, details?: string) {
  try {
    await prisma.auditLog.create({
      data: { adminId, action, target, details },
    });
  } catch (error) {
    console.error("Error registrando log de auditoría:", error);
  }
}

// 1. Obtiene las estadísticas generales del panel
export async function getAdminStats() {
  try {
    const totalUsers = await prisma.user.count();
    const verifiedUsers = await prisma.user.count({ where: { isVerified: true } });
    const totalGarments = await prisma.garment.count();

    const clientCount = await prisma.user.count({ where: { role: "CLIENT" } });
    const sellerCount = await prisma.user.count({ where: { role: "SELLER" } });
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });

    return {
      success: true,
      stats: {
        totalUsers,
        verifiedUsers,
        totalGarments,
        rolesBreakdown: { CLIENT: clientCount, SELLER: sellerCount, ADMIN: adminCount },
      },
    };
  } catch (error: any) {
    console.error("Error al obtener estadísticas:", error);
    return { success: false, error: "Error interno al calcular estadísticas." };
  }
}

// 2. Obtiene la lista de usuarios para el panel
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

// 3. Modifica el rol base de un usuario y registra el evento de auditoría
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
      `El administrador ${admin.email} actualizó el rol base de ${updatedUser.email} a ${newRole}`
    );

    return { success: true, message: `Rol de ${updatedUser.email} actualizado a ${newRole} con éxito.` };
  } catch (error) {
    console.error("Error al actualizar rol:", error);
    return { success: false, error: "Error al intentar actualizar el rol." };
  }
}

// 4. Obtiene la bitácora de auditoría para el Administrador
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

// --- FUNCIONALIDAD DE ROLES Y PERMISOS RBAC ---

export async function getUsersWithRolesAndPermissions() {
  try {
    const users = await prisma.user.findMany({
      take: 10,
      include: {
        userRoles: { include: { role: true } },
        userPermissions: { include: { permission: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, users };
  } catch (error: any) {
    return { success: false, users: [], message: error.message };
  }
}

// 5. Actualiza el rol avanzado (RBAC) interactivamente desde la web
export async function updateAdvancedRbacRole(userId: string, newRoleName: string) {
  try {
    let role = await prisma.roleModel.findFirst({ where: { name: newRoleName } });
    if (!role) {
      role = await prisma.roleModel.create({
        data: { name: newRoleName, description: "Rol avanzado gestionado desde el panel web" },
      });
    }

    await prisma.userRole.deleteMany({ where: { userId } });
    await prisma.userRole.create({
      data: { userId, roleId: role.id },
    });

    return { success: true, message: "Rol avanzado actualizado en Supabase con éxito." };
  } catch (error: any) {
    console.error("Error al actualizar rol RBAC avanzado:", error);
    return { success: false, message: error.message || "Error al actualizar el rol en la base de datos." };
  }
}

// 6. Actualiza los permisos granulares de un usuario de forma interactiva desde la web
export async function updateUserPermissions(userId: string, permissionNames: string[]) {
  try {
    await prisma.userPermission.deleteMany({ where: { userId } });

    for (const permName of permissionNames) {
      let permission = await prisma.permission.findUnique({
        where: { name: permName.trim().toUpperCase() },
      });

      if (!permission) {
        permission = await prisma.permission.create({
          data: { name: permName.trim().toUpperCase(), description: "Permiso dinámico gestionado desde la web" },
        });
      }

      await prisma.userPermission.create({
        data: { userId, permissionId: permission.id },
      });
    }

    return { success: true, message: "Permisos granulares actualizados correctamente en Supabase." };
  } catch (error: any) {
    console.error("Error al actualizar permisos granulares:", error);
    return { success: false, message: error.message || "Error al actualizar los permisos." };
  }
}