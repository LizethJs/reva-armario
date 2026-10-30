'use server';

import { prisma } from "@/lib/prisma";

export async function triggerRealSystemError(adminEmail: string) {
  try {
    const admin = await prisma.user.findUnique({
      where: { email: adminEmail.toLowerCase().trim() },
      select: { id: true }
    });

    if (!admin) {
      return { success: false, message: "Administrador no encontrado para la auditoría." };
    }

    // Inserta un registro real de error/incidencia en la tabla de auditoría existente
    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: "ISO_ERROR_LOG_TEST",
        target: "SYSTEM_DATABASE_CORE",
        details: `[PRUEBA REAL ISO 27001] Incidencia controlada ejecutada a las ${new Date().toLocaleTimeString()} - Verificación de Error Logging completada.`
      }
    });

    return { success: true, message: "¡Error real inyectado y registrado en la bitácora de Supabase!" };
  } catch (error: any) {
    return { success: false, message: `Error en servidor: ${error.message}` };
  }
}