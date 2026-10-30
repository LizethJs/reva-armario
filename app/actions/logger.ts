'use server';

import { prisma } from "@/lib/prisma";

export async function logSystemError(data: {
  adminEmail?: string;
  action: string;
  errorDetails: string;
  severity?: 'LOW' | 'MEDIUM' | 'CRITICAL';
}) {
  try {
    let adminId = null;
    
    // Si se pasa el correo del administrador, buscamos su ID
    if (data.adminEmail) {
      const adminUser = await prisma.user.findUnique({
        where: { email: data.adminEmail.toLowerCase().trim() },
        select: { id: true }
      });
      if (adminUser) adminId = adminUser.id;
    }

    // Si no hay un administrador específico, asignamos el primer ADMIN disponible
    if (!adminId) {
      const defaultAdmin = await prisma.user.findFirst({
        where: { role: 'ADMIN' },
        select: { id: true }
      });
      if (defaultAdmin) adminId = defaultAdmin.id;
    }

    if (!adminId) {
      return { success: false, message: "No se encontró un usuario ADMIN para asociar al AuditLog." };
    }

    // Guardamos el registro del error en la base de datos
    await prisma.auditLog.create({
      data: {
        adminId: adminId,
        action: `ERROR_EVENT_${data.action.toUpperCase()}`,
        target: "SYSTEM_CORE",
        details: `[Severidad: ${data.severity || 'CRITICAL'}] ${data.errorDetails} - Timestamp: ${new Date().toISOString()}`
      }
    });

    return { success: true, message: "Error registrado y auditado correctamente en la base de datos." };
  } catch (err: any) {
    console.error("⚠️ Error crítico escribiendo en el AuditLog:", err);
    return { success: false, message: err.message };
  }
}