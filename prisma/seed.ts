import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@reva.com"; 
  const adminPassword = "AdminSecurePassword123!"; 

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  // Usamos upsert para que cree el admin si no existe, o actualice su contraseña si ya existe
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
      role: "ADMIN",
      isVerified: true,
    },
    create: {
      name: "Super Administrador RËVA",
      email: adminEmail,
      password: hashedPassword,
      role: "ADMIN",
      isVerified: true,
    },
  });

  console.log("✅ SuperAdmin sincronizado y actualizado correctamente:", admin.email);
}

main()
  .catch((e) => {
    console.error("❌ Error ejecutando el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });