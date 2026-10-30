'use server';

import { prisma } from "@/lib/prisma";

// ============================================================================
// BANDERA DE REMEDIACIÓN Y CONTROL
// - true: El módulo inyecta la excepción real de servidor para la prueba.
// - false: El sistema bloquea la inyección y opera en modo remediado/seguro.
// ============================================================================
const ENABLE_FAULT_INJECTION = true;

export async function triggerRealSystemError(adminEmail: string) {
  // REMEDIACIÓN: Si el módulo está desactivado, el servidor rehúsa la ejecución
  if (!ENABLE_FAULT_INJECTION) {
    return { 
      success: false, 
      message: "⚠️ Módulo de pruebas inactivo. El sistema se encuentra en estado remediado y seguro." 
    };
  }

  try {
    // ------------------------------------------------------------------------
    // EXCEPCIÓN REAL DE SERVIDOR (Runtime Null Pointer Exception)
    // Intentamos invocar un método sobre una referencia nula en Node.js.
    // Esto genera una excepción TypeError real en el motor de ejecución.
    // ------------------------------------------------------------------------
    const nullObject: any = null;
    nullObject.triggerRealExecutionCrash(); 

    return { success: true, message: "OK" };
  } catch (error: any) {
    // ------------------------------------------------------------------------
    // INTERCEPTOR DE ERRORES Y PERSISTENCIA FORENSE EN SUPABASE
    // Capturamos el fallo real sin que colapse la aplicación y guardamos
    // la traza forense (Stack Trace) en la tabla AuditLog de Supabase.
    // ------------------------------------------------------------------------
    try {
      const admin = await prisma.user.findFirst({
        where: { email: adminEmail.toLowerCase().trim() },
        select: { id: true }
      });

      if (admin) {
        await prisma.auditLog.create({
          data: {
            adminId: admin.id,
            action: "REAL_RUNTIME_SERVER_CRASH",
            target: "SYSTEM_CORE_RUNTIME",
            details: `[EXCEPCIÓN REAL DE SERVIDOR] ${error.name}: ${error.message} | Stack: ${error.stack ? error.stack.slice(0, 150) : "N/A"}`
          }
        });
      }

      return { 
        success: true, 
        message: "¡Excepción real de servidor (TypeError) capturada y registrada con éxito en Supabase!" 
      };
    } catch (dbError: any) {
      return { 
        success: false, 
        message: `Error al intentar registrar el fallo en Supabase: ${dbError.message}` 
      };
    }
  }
}