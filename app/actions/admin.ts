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

// 1. Obtiene la lista de usuarios para el panel (Solo accesible por ADMIN)
export async function getUsersList(adminEmail: string) {
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin || admin.role !== "ADMIN") {
    throw new Error("Acceso denegado: Se requieren privilegios de Administrador.");
  }

  return await prisma.user.findMany({
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
}

// 2. Modifica el rol de un usuario y registra el evento de auditoría
export async function updateUserRole(
  adminEmail: string,
  targetUserId: string,
  newRole: "CLIENT" | "SELLER" | "ADMIN"
) {
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin || admin.role !== "ADMIN") {
    return { success: false, message: "No estás autorizado para esta acción." };
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
}

// 3. Obtiene la bitácora de auditoría para el Administrador
export async function getAuditLogs(adminEmail: string) {
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin || admin.role !== "ADMIN") {
    throw new Error("Acceso denegado.");
  }

  return await prisma.auditLog.findMany({
    include: { admin: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}