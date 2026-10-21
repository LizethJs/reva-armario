"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

// Configuración de Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST || "smtp.gmail.com",
  port: Number(process.env.EMAIL_SERVER_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_SERVER_USER || "",
    pass: process.env.EMAIL_SERVER_PASSWORD || "",
  },
});

async function sendOtpEmailDirect(email: string, otp: string) {
  try {
    if (!process.env.EMAIL_SERVER_USER || !process.env.EMAIL_SERVER_PASSWORD) {
      console.warn("ADVERTENCIA: Faltan credenciales de correo en .env");
    }

    await transporter.sendMail({
      from: `"RËVA Soporte" <${process.env.EMAIL_SERVER_USER || "soporte@reva.com"}>`,
      to: email,
      subject: "Código de Verificación OTP - RËVA",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #4f46e5;">Bienvenido a RËVA</h2>
          <p>Tu código de verificación OTP es:</p>
          <h1 style="background: #f3f4f6; padding: 10px 20px; display: inline-block; letter-spacing: 5px; color: #111;">${otp}</h1>
          <p>Este código es válido para verificar tu cuenta.</p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error("Error al enviar correo con nodemailer:", error);
    return false;
  }
}

// --- 1. REGISTRO USER ---
export async function registerUser(formData: {
  name: string;
  phone: string;
  role: string;
  email: string;
  password: string;
}) {
  const { name, role, email, password } = formData;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPassword = await bcrypt.hash(password, 10);

    if (existingUser) {
      // Si el usuario ya está verificado en tu BD (isVerified)
      if (existingUser.isVerified) {
        return {
          success: false,
          message: "El correo electrónico ya está registrado y verificado. Por favor inicia sesión.",
        };
      }

      // Si existe pero no está verificado -> Actualizar datos y código
      await prisma.user.update({
        where: { email },
        data: {
          name,
          role,
          password: hashedPassword,
          verificationCode: otpCode,
        },
      });

      await sendOtpEmailDirect(email, otpCode);

      return {
        success: true,
        redirectToOtp: true,
        email,
        message: "Este correo no estaba verificado. Te hemos enviado un nuevo código OTP a tu correo.",
      };
    }

    // Crear usuario nuevo según los campos de tu schema.prisma
    await prisma.user.create({
      data: {
        name,
        role,
        email,
        password: hashedPassword,
        verificationCode: otpCode,
        isVerified: false,
      },
    });

    await sendOtpEmailDirect(email, otpCode);

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
      message: `Error en el servidor: ${error?.message || "No se pudo procesar el registro."}`,
    };
  }
}

// --- 2. VERIFICAR OTP ---
export async function verifyOtp(email: string, otpInput: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { success: false, message: "Usuario no encontrado." };
    }

    if (user.verificationCode !== otpInput) {
      return { success: false, message: "El código OTP ingresado es incorrecto." };
    }

    await prisma.user.update({
      where: { email },
      data: {
        isVerified: true,
        verificationCode: null,
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

// --- 3. REENVIAR OTP ---
export async function resendOtp(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { success: false, message: "El correo electrónico no está registrado." };
    }

    if (user.isVerified) {
      return { success: false, message: "Esta cuenta ya se encuentra verificada." };
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    await prisma.user.update({
      where: { email },
      data: { verificationCode: otpCode },
    });

    await sendOtpEmailDirect(email, otpCode);

    return {
      success: true,
      message: "Nuevo código OTP enviado a tu correo.",
    };
  } catch (error) {
    console.error("Error en resendOtp:", error);
    return { success: false, message: "Error al reenviar el código OTP." };
  }
}