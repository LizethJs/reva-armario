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

export async function loginUser(data: { email: string; password: string }) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
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
    return { success: false, message: `Error de servidor: ${error.message || "Desconocido"}` };
  }
}

export async function registerUser(data: { name: string; phone: string; role: string; email: string; password: string }) {
  try {
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } }).catch(() => null);
    if (existingUser) {
      return { success: false, redirectToOtp: false, message: "Este correo ya está registrado." };
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    let assignedRole = data.role && (data.role.includes("Diseñador") || data.role.includes("SELLER")) ? "SELLER" : "CLIENT";

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

    await transporter.sendMail({
      from: `"RËVA" <${process.env.EMAIL_SERVER_USER}>`,
      to: data.email,
      subject: "Código OTP RËVA",
      html: `<h3>Tu código OTP es: ${otpCode}</h3>`,
    });

    return { success: true, redirectToOtp: true, email: data.email, message: "Código enviado al correo." };
  } catch (error: any) {
    return { success: false, redirectToOtp: false, message: error.message || "Error al registrarse." };
  }
}

export async function verifyOtp(email: string, otpInput: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.verificationCode !== otpInput.trim()) {
      return { success: false, message: "Código OTP incorrecto." };
    }
    await prisma.user.update({ where: { email }, data: { isVerified: true, verificationCode: null } });
    return { success: true, message: "Cuenta verificada con éxito." };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}