import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@reva.com"; // Modifica por el correo deseado
  const adminPassword = "AdminSecurePassword123!"; // Modifica por una clave fuerte

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await prisma.user.create({
      data: {
        name: "Super Administrador RËVA",
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
        isVerified: true,
      },
    });
    console.log("✅ SuperAdmin creado correctamente:", adminEmail);
  } else {
    console.log("ℹ️ El administrador ya existe en la base de datos.");
  }
}

main()
  .catch((e) => {
    console.error("❌ Error ejecutando el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });