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

// 1. Obtiene la lista de usuarios para el panel (Compatible con formato de éxito)
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

// Mantiene compatibilidad si otra parte del código llama a getUsersList
export async function getUsersList(adminEmail: string) {
  const res = await getUsers(adminEmail);
  if (!res.success) throw new Error(res.error);
  return res.users;
}

// 2. Modifica el rol de un usuario y registra el evento de auditoría
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

// 3. Obtiene la bitácora de auditoría para el Administrador
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