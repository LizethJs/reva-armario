const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function run() {
  // 1. Obtener al menos 2 usuarios existentes
  const users = await prisma.user.findMany({ take: 2 });
  if (users.length < 2) {
    console.log("❌ Faltan usuarios en la BD. Asegúrate de tener al menos 2.");
    return;
  }

  // 2. Crear un rol nuevo (Ej: AUDITOR_TECNICO)
  const newRole = await prisma.roleModel.create({
    data: { 
      name: "AUDITOR_TECNICO", 
      description: "Rol para sustentación del proyecto" 
    }
  });
  console.log(`✓ Rol creado: ${newRole.name}`);

  // 3. Asignar ese mismo rol a los 2 usuarios diferentes
  await prisma.userRole.createMany({
    data: [
      { userId: users[0].id, roleId: newRole.id },
      { userId: users[1].id, roleId: newRole.id }
    ],
    skipDuplicates: true
  });
  console.log(`✓ Rol asignado a: ${users[0].email} y ${users[1].email}`);

  // 4. Crear 4 permisos diferentes
  const p1 = await prisma.permission.create({ data: { name: "VER_REPORTES_AVANZADOS" } });
  const p2 = await prisma.permission.create({ data: { name: "AUDITAR_LOGS_ISO" } });
  const p3 = await prisma.permission.create({ data: { name: "EDITAR_CATALOGO_PRECIOS" } });
  const p4 = await prisma.permission.create({ data: { name: "EXPORTAR_DATOS_SYSTEM" } });

  // 5. Configurar 2 permisos distintos para cada usuario
  await prisma.userPermission.createMany({
    data: [
      // Al Usuario 1 le damos 2 permisos
      { userId: users[0].id, permissionId: p1.id },
      { userId: users[0].id, permissionId: p2.id },
      // Al Usuario 2 le damos 2 permisos diferentes
      { userId: users[1].id, permissionId: p3.id },
      { userId: users[1].id, permissionId: p4.id }
    ],
    skipDuplicates: true
  });
  console.log("✓ ¡Permisos configurados con éxito!");
}

run()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());