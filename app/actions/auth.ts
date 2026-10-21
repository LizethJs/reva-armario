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
}

// 1. REGISTRO DE USUARIO / DETECCIÓN DE PENDIENTES DE OTP
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
      // Si el usuario ya está verificado en Supabase, indicamos que inicie sesión
      if (existingUser.isVerified) {
        return {
          success: false,
          redirectToOtp: false,
          message: "Este correo ya está registrado y verificado. Por favor inicia sesión.",
        };
      }

      // Si existe pero NO está verificado: actualizamos el código y lo mandamos a verificar
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
        message: "Tu cuenta ya está creada pero pendiente de verificación. Te hemos enviado un nuevo código OTP a tu correo.",
      };
    }

    // Nuevo usuario
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        verificationCode: otpCode,
        isVerified: false,
      },
    });

    await sendOtpEmail(data.email, otpCode);

    return {
      success: true,
      redirectToOtp: true,
      email: data.email,
      message: "Registro iniciado con éxito. Hemos enviado un código OTP a tu correo.",
    };
  } catch (error) {
    console.error("Error en registerUser:", error);
    return { success: false, redirectToOtp: false, message: "Error interno en el servidor al registrarse." };
  }
}

// 2. VERIFICACIÓN OTP
export async function verifyOtp(email: string, otpInput: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return { success: false, message: "Usuario no encontrado." };
    }

    if (user.verificationCode !== otpInput.trim()) {
      return { success: false, message: "El código OTP es incorrecto. Por favor verifícalo e inténtalo de nuevo." };
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
      message: "¡Cuenta verificada exitosamente! Ya puedes iniciar sesión.",
    };
  } catch (error) {
    console.error("Error en verifyOtp:", error);
    return { success: false, message: "Error en el servidor al validar el código OTP." };
  }
}

// 3. REENVIAR OTP
export async function resendOtp(email: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return { success: false, message: "Usuario no encontrado." };
    }

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();

    await prisma.user.update({
      where: { email },
      data: { verificationCode: newOtp },
    });

    await sendOtpEmail(email, newOtp);

    return { success: true, message: "Se ha enviado un nuevo código OTP a tu correo." };
  } catch (error) {
    console.error("Error en resendOtp:", error);
    return { success: false, message: "Error al solicitar reenvío del código OTP." };
  }
}

// 4. INICIO DE SESIÓN
export async function loginUser(data: { email: string; password: string }) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      return { success: false, message: "El correo electrónico no está registrado." };
    }

    // Si intenta iniciar sesión pero aún no verifica su OTP
    if (!user.isVerified) {
      return {
        success: false,
        requiresVerification: true,
        email: data.email,
        message: "Tu cuenta aún no ha sido verificada. Ingresa tu código OTP.",
      };
    }

    const passwordMatch = await bcrypt.compare(data.password, user.password);

    if (!passwordMatch) {
      return { success: false, message: "Contraseña incorrecta." };
    }

    return {
      success: true,
      redirectTo: "/",
      message: "¡Inicio de sesión exitoso!",
    };
  } catch (error) {
    console.error("Error en loginUser:", error);
    return { success: false, message: "Error en el servidor al iniciar sesión." };
  }
}