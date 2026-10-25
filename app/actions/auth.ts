"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

// --- SISTEMA DE RATE LIMITING EN MEMORIA ---
interface RateLimitRecord {
  attempts: number;
  blockedUntil: number | null;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

const MAX_ATTEMPTS = 3; // Límite reducido a 3 intentos permitidos
const BLOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutos de bloqueo

function checkRateLimit(key: string): { allowed: boolean; remainingMinutes?: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record) {
    return { allowed: true };
  }

  // Si está bloqueado, verificar si ya expiró el tiempo de castigo
  if (record.blockedUntil) {
    if (now < record.blockedUntil) {
      const remainingMinutes = Math.ceil((record.blockedUntil - now) / 60000);
      return { allowed: false, remainingMinutes };
    } else {
      // El tiempo de bloqueo pasó, reiniciamos el registro
      rateLimitMap.delete(key);
      return { allowed: true };
    }
  }

  return { allowed: true };
}

function registerFailedAttempt(key: string) {
  const now = Date.now();
  const record = rateLimitMap.get(key) || { attempts: 0, blockedUntil: null };

  record.attempts += 1;

  if (record.attempts >= MAX_ATTEMPTS) {
    record.blockedUntil = now + BLOCK_DURATION_MS;
  }

  rateLimitMap.set(key, record);
}

function resetRateLimit(key: string) {
  rateLimitMap.delete(key);
}

// --- CONFIGURACIÓN DE NODEMAILER ---
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

// --- ACTIONS ---

export async function registerUser(data: {
  name: string;
  phone: string;
  role: string;
  email: string;
  password: string;
}) {
  try {
    const sanitizedName = data.name.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const sanitizedEmail = data.email.toLowerCase().trim();
    const sanitizedPhone = data.phone.trim();

    const isNameValid = /^[a-zA-AáéíóúÁÉÍÓÚñÑ\s]{3,50}$/.test(sanitizedName);
    const isPhoneValid = /^[3][0-9]{9}$/.test(sanitizedPhone);
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail);
    const isPasswordValid = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(data.password);

    if (!isNameValid || !isPhoneValid || !isEmailValid || !isPasswordValid) {
      return {
        success: false,
        redirectToOtp: false,
        message: "Los datos enviados no cumplen con los estándares de seguridad requeridos.",
      };
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    }).catch(() => null);

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
        where: { email: sanitizedEmail },
        data: { verificationCode: newOtp },
      });

      await sendOtpEmail(sanitizedEmail, newOtp);
      return {
        success: true,
        redirectToOtp: true,
        email: sanitizedEmail,
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
        name: sanitizedName,
        email: sanitizedEmail,
        password: hashedPassword,
        verificationCode: otpCode,
        isVerified: false,
        role: assignedRole,
      },
    });

    await sendOtpEmail(sanitizedEmail, otpCode);

    return {
      success: true,
      redirectToOtp: true,
      email: sanitizedEmail,
      message: "Registro iniciado. Revisa tu correo para el código OTP.",
    };
  } catch (error: any) {
    console.error("Error crítico en registerUser:", error);
    return { 
      success: false, 
      redirectToOtp: false, 
      message: `Error de BD: ${error.message || "Verifica la conexión a Supabase."}` 
    };
  }
}

export async function verifyOtp(email: string, otpInput: string) {
  try {
    const sanitizedEmail = email.toLowerCase().trim();
    const rateLimitKey = `otp_${sanitizedEmail}`;

    const limitCheck = checkRateLimit(rateLimitKey);
    if (!limitCheck.allowed) {
      return {
        success: false,
        message: `Demasiados intentos fallidos. Por seguridad, reintenta en ${limitCheck.remainingMinutes} minutos.`,
      };
    }

    const user = await prisma.user.findUnique({ where: { email: sanitizedEmail } });

    if (!user) {
      return { success: false, message: "Usuario no encontrado." };
    }

    if (user.verificationCode !== otpInput.trim()) {
      registerFailedAttempt(rateLimitKey);
      return { 
        success: false, 
        message: "El código OTP es incorrecto. Verifica el código enviado a tu correo." 
      };
    }

    resetRateLimit(rateLimitKey);

    await prisma.user.update({
      where: { email: user.email },
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
    const sanitizedEmail = email.toLowerCase().trim();
    const rateLimitKey = `resend_${sanitizedEmail}`;

    const limitCheck = checkRateLimit(rateLimitKey);
    if (!limitCheck.allowed) {
      return {
        success: false,
        message: `Has solicitado demasiados códigos OTP. Reintenta en ${limitCheck.remainingMinutes} minutos.`,
      };
    }

    const user = await prisma.user.findUnique({ where: { email: sanitizedEmail } });
    if (!user) return { success: false, message: "Usuario no encontrado." };

    registerFailedAttempt(rateLimitKey);

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    await prisma.user.update({
      where: { email: user.email },
      data: { verificationCode: newOtp },
    });

    await sendOtpEmail(user.email, newOtp);
    return { success: true, message: "Nuevo código OTP enviado a tu correo." };
  } catch (error: any) {
    return { success: false, message: error.message || "Error al reenviar OTP." };
  }
}

export async function loginUser(data: { email: string; password: string }) {
  try {
    const sanitizedEmail = data.email.toLowerCase().trim();
    const rateLimitKey = `login_${sanitizedEmail}`;

    const limitCheck = checkRateLimit(rateLimitKey);
    if (!limitCheck.allowed) {
      return {
        success: false,
        message: `Cuenta bloqueada temporalmente por exceso de intentos fallidos. Intenta en ${limitCheck.remainingMinutes} minutos.`,
      };
    }

    const user = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    });

    if (!user) {
      registerFailedAttempt(rateLimitKey);
      return { success: false, message: "El correo no está registrado en la base de datos." };
    }

    if (!user.isVerified) {
      return { success: false, message: "Tu cuenta aún no ha sido verificada con OTP." };
    }

    const passwordMatch = await bcrypt.compare(data.password, user.password);
    if (!passwordMatch) {
      registerFailedAttempt(rateLimitKey);
      return { success: false, message: "Contraseña incorrecta." };
    }

    resetRateLimit(rateLimitKey);

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
    console.error("Error detallado en loginUser:", error);
    return { 
      success: false, 
      message: `Error de servidor/Prisma: ${error.message || "Verifica la conexión a Supabase."}` 
    };
  }
}