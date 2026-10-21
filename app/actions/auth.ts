"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

async function sendOtpEmail(email: string, otp: string) {
  try {
    await transporter.sendMail({
      from: `"RËVA Virtual Room" <${process.env.EMAIL_SERVER_USER}>`,
      to: email,
      subject: "Código de Verificación RËVA",
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #0d0f12; color: #ffffff; padding: 30px; border-radius: 12px; text-align: center; max-width: 480px; margin: auto;">
          <h1 style="color: #facc15; font-size: 28px; margin-bottom: 10px;">RËVA</h1>
          <p style="font-size: 14px; color: #a1a1aa; margin-bottom: 20px;">Tu código de verificación OTP es:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #facc15; background-color: #1f2329; padding: 15px; border-radius: 8px; display: inline-block; margin-bottom: 20px;">
            ${otp}
          </div>
          <p style="font-size: 12px; color: #71717a;">Ingresa este código en la plataforma para activar tu cuenta.</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Error enviando email:", err);
  }
}

export async function registerUser(data: {
  name: string;
  phone: string;
  role: string;
  email: string;
  password: string;
}) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      if (existingUser.isVerified) {
        return {
          success: false,
          redirectToOtp: false,
          message: "Este correo ya está registrado y verificado. Inicia sesión.",
        };
      }

      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      await prisma.user.update({
        where: { email: data.email },
        data: { verificationCode: newOtp },
      });

      await sendOtpEmail(data.email, newOtp);
      return {
        success: true,
        redirectToOtp: true,
        email: data.email,
        message: "Cuenta pendiente de verificación. Te enviamos un nuevo OTP.",
      };
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    let assignedRole = "CLIENT";
    if (data.role && (data.role.includes("Diseñador") || data.role.includes("SELLER"))) {
      assignedRole = "SELLER";
    }

    await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        verificationCode: otpCode,
        isVerified: false,
        role: assignedRole,
      },
    });

    await sendOtpEmail(data.email, otpCode);

    return {
      success: true,
      redirectToOtp: true,
      email: data.email,
      message: "Registro iniciado. Revisa tu correo para el código OTP.",
    };
  } catch (error: any) {
    console.error("Error en registerUser:", error);
    return { success: false, redirectToOtp: false, message: error.message || "Error al registrarse." };
  }
}

export async function verifyOtp(email: string, otpInput: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return { success: false, message: "Usuario no encontrado." };
    }

    if (user.verificationCode !== otpInput.trim()) {
      return { success: false, message: "El código OTP es incorrecto." };
    }

    await prisma.user.update({
      where: { email },
      data: {
        isVerified: true,
        verificationCode: null,
      },
    });

    return { success: true, message: "¡Cuenta verificada exitosamente!" };
  } catch (error: any) {
    return { success: false, message: error.message || "Error al verificar OTP." };
  }
}

export async function resendOtp(email: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return { success: false, message: "Usuario no encontrado." };

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    await prisma.user.update({
      where: { email },
      data: { verificationCode: newOtp },
    });

    await sendOtpEmail(email, newOtp);
    return { success: true, message: "Nuevo código OTP enviado." };
  } catch (error: any) {
    return { success: false, message: error.message || "Error al reenviar OTP." };
  }
}

export async function loginUser(data: { email: string; password: string }) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      return { success: false, message: "El correo no está registrado." };
    }

    if (!user.isVerified) {
      return { success: false, message: "Tu cuenta aún no ha sido verificada con OTP." };
    }

    const passwordMatch = await bcrypt.compare(data.password, user.password);
    if (!passwordMatch) {
      return { success: false, message: "Contraseña incorrecta." };
    }

    return {
      success: true,
      redirectTo: "/",
      user: {
        name: user.name,
        email: user.email,
        role: user.role || "CLIENT",
      },
      message: "¡Bienvenido!",
    };
  } catch (error: any) {
    console.error("Error en loginUser:", error);
    return { success: false, message: error.message || "Error de servidor al iniciar sesión." };
  }
}