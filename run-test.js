const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function run() {
  const users = await prisma.user.findMany({ take: 2 });
  if (users.length < 2) {
    console.log("Faltan usuarios en la BD");
    return;
  }

  // 1. Crear rol nuevo
  const role = await prisma.roleModel.create({
    data: { name: "SUPERVISOR_CALIDAD", description: "Rol de prueba" }
  });

  // 2. Asignar a 2 usuarios diferentes
  await prisma.userRole.createMany({
    data: [
      { userId: users[0].id, roleId: role.id },
      { userId: users[1].id, roleId: role.id }
    ]
  });

  // 3. Crear y configurar 2 permisos distintos para cada uno
  const p1 = await prisma.permission.create({ data: { name: "VER_REPORTES" } });
  const p2 = await prisma.permission.create({ data: { name: "AUDITAR_LOGS" } });
  const p3 = await prisma.permission.create({ data: { name: "EDITAR_PRECIOS" } });
  const p4 = await prisma.permission.create({ data: { name: "EXPORTAR_DATOS" } });

  await prisma.userPermission.createMany({
    data: [
      { userId: users[0].id, permissionId: p1.id },
      { userId: users[0].id, permissionId: p2.id },
      { userId: users[1].id, permissionId: p3.id },
      { userId: users[1].id, permissionId: p4.id }
    ]
  });

  console.log("¡Prueba de RBAC ejecutada con éxito en Supabase!");
}

run().catch(console.error).finally(() => prisma.$disconnect());