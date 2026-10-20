"use server";

import { prisma } from "@/lib/prisma";
import { sendOtpEmail } from "@/lib/nodemailer"; // Revisa que esta ruta coincida con la ubicación de tu función Nodemailer
import bcrypt from "bcryptjs";

// --- ACTION 1: REGISTRO / RE-GENERACIÓN DE OTP SI NO ESTÁ VERIFICADO ---
export async function registerUser(formData: {
  name: string;
  phone: string;
  role: string;
  email: string;
  password: string;
}) {
  const { name, phone, role, email, password } = formData;

  try {
    // 1. Buscar si el usuario ya existe en Supabase
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    // Generar código OTP de 6 dígitos y tiempo de expiración a 15 minutos
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000);
    const hashedPassword = await bcrypt.hash(password, 10);

    if (existingUser) {
      // CASO A: El usuario ya existe Y ESTÁ VERIFICADO -> Bloquear con error
      if (existingUser.emailVerified) {
        return {
          success: false,
          message: "El correo electrónico ya está registrado y verificado.",
        };
      }

      // CASO B: El usuario existe PERO NO ESTÁ VERIFICADO -> Actualizar datos, generar nuevo OTP y reenviar
      await prisma.user.update({
        where: { email },
        data: {
          name,
          phone,
          role,
          password: hashedPassword,
          otpCode,
          otpExpires,
        },
      });

      await sendOtpEmail(email, otpCode);

      return {
        success: true,
        redirectToOtp: true,
        email,
        message: "Tu cuenta no estaba verificada. Se ha enviado un nuevo código OTP a tu correo.",
      };
    }

    // CASO C: Usuario totalmente nuevo
    await prisma.user.create({
      data: {
        name,
        phone,
        role,
        email,
        password: hashedPassword,
        otpCode,
        otpExpires,
        emailVerified: false,
      },
    });

    await sendOtpEmail(email, otpCode);

    return {
      success: true,
      redirectToOtp: true,
      email,
      message: "Registro exitoso. Se ha enviado el código OTP a tu correo electrónico.",
    };
  } catch (error: any) {
    console.error("Error en registerUser:", error);
    return {
      success: false,
      message: "Ocurrió un error en el servidor al procesar el registro.",
    };
  }
}

// --- ACTION 2: VERIFICAR CÓDIGO OTP ---
export async function verifyOtp(email: string, otpInput: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { success: false, message: "Usuario no encontrado." };
    }

    if (user.otpCode !== otpInput) {
      return { success: false, message: "El código OTP ingresado es incorrecto." };
    }

    if (user.otpExpires && new Date() > new Date(user.otpExpires)) {
      return { success: false, message: "El código OTP ha expirado. Por favor solicita uno nuevo." };
    }

    // Marcar la cuenta como verificada y limpiar los datos temporales del OTP
    await prisma.user.update({
      where: { email },
      data: {
        emailVerified: true,
        otpCode: null,
        otpExpires: null,
      },
    });

    return {
      success: true,
      message: "Cuenta verificada con éxito. Ya puedes iniciar sesión.",
    };
  } catch (error) {
    console.error("Error en verifyOtp:", error);
    return { success: false, message: "Error al validar el código OTP." };
  }
}

// --- ACTION 3: REENVIAR CÓDIGO OTP MANUALMENTE ---
export async function resendOtp(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { success: false, message: "El correo electrónico no está registrado." };
    }

    if (user.emailVerified) {
      return { success: false, message: "Esta cuenta ya se encuentra verificada." };
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { email },
      data: { otpCode, otpExpires },
    });

    await sendOtpEmail(email, otpCode);

    return {
      success: true,
      message: "Nuevo código OTP enviado a tu correo.",
    };
  } catch (error) {
    console.error("Error en resendOtp:", error);
    return { success: false, message: "Error al reenviar el código OTP." };
  }
}