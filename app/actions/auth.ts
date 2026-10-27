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

const MAX_ATTEMPTS = 3; // Límite de 3 intentos fallidos
const BLOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutos de bloqueo
const OTP_EXPIRATION_MINUTES = 5; // 5 minutos de vigencia

function checkRateLimit(key: string): { allowed: boolean; remainingMinutes?: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record) return { allowed: true };

  if (record.blockedUntil) {
    if (now < record.blockedUntil) {
      const remainingMinutes = Math.ceil((record.blockedUntil - now) / 60000);
      return { allowed: false, remainingMinutes };
    } else {
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

// --- CONFIGURACIÓN DE NODEMAILER OPTIMIZADA PARA DOMINIOS EXTERNOS ---
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // SSL para máxima compatibilidad
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
  authMethod: "PLAIN",
  tls: {
    rejectUnauthorized: true,
  },
});

async function sendOtpEmail(email: string, otp: string) {
  try {
    const senderEmail = process.env.EMAIL_SERVER_USER;

    const info = await transporter.sendMail({
      from: `"RËVA Virtual Room" <${senderEmail}>`,
      to: email,
      replyTo: senderEmail,
      subject: `${otp} - Tu código de verificación RËVA`,
      text: `Tu código de verificación OTP es: ${otp}. Válido por 5 minutos.`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #0d0f12; color: #ffffff; padding: 30px; border-radius: 12px; text-align: center; max-width: 480px; margin: auto;">
          <h1 style="color: #facc15; font-size: 28px; margin-bottom: 10px;">RËVA</h1>
          <p style="font-size: 14px; color: #a1a1aa; margin-bottom: 20px;">Tu código de verificación OTP es:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #facc15; background-color: #1f2329; padding: 15px; border-radius: 8px; display: inline-block; margin-bottom: 20px;">
            ${otp}
          </div>
          <p style="font-size: 12px; color: #71717a;">Ingresa este código en la plataforma. Válido únicamente por 5 minutos.</p>
        </div>
      `,
    });

    console.log("Correo OTP enviado correctamente a:", email, "Message ID:", info.messageId);
    return true;
  } catch (err) {
    console.error("⚠️ Error crítico enviando correo OTP con Nodemailer:", err);
    throw err;
  }
}

// --- ACTIONS DE REGISTRO Y LOGIN ---

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
    const isPasswordValid = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!\%*?&]{8,}$/.test(data.password);

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

    const otpExpiresAt = new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000);

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
        data: { 
          verificationCode: newOtp,
          otpExpiresAt: otpExpiresAt
        } as any,
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
        otpExpiresAt: otpExpiresAt,
        isVerified: false,
        role: assignedRole,
      } as any,
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
      message: `Error al procesar registro o enviar correo: ${error.message || "Verifica las credenciales SMTP."}` 
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

    if (user.otpExpiresAt && new Date() > new Date(user.otpExpiresAt)) {
      registerFailedAttempt(rateLimitKey);
      return {
        success: false,
        message: "El código OTP ha expirado (válido por 5 minutos). Solicita uno nuevo.",
      };
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
        otpExpiresAt: null,
      } as any,
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
    const newOtpExpiresAt = new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000);

    await prisma.user.update({
      where: { email: user.email },
      data: { 
        verificationCode: newOtp,
        otpExpiresAt: newOtpExpiresAt
      } as any,
    });

    await sendOtpEmail(user.email, newOtp);
    return { success: true, message: "Nuevo código OTP enviado a tu correo (válido por 5 min)." };
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

// --- ACTIONS PARA RECUPERACIÓN DE CONTRASEÑA CON CORREO REAL ---

export async function forgotPassword(email: string) {
  try {
    const sanitizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: sanitizedEmail } });

    if (!user) {
      return { success: false, message: "El correo ingresado no está registrado." };
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000);

    await prisma.user.update({
      where: { email: sanitizedEmail },
      data: {
        verificationCode: otpCode,
        otpExpiresAt: otpExpiresAt,
      } as any,
    });

    await sendOtpEmail(sanitizedEmail, otpCode);

    return { success: true, message: "Código de restablecimiento enviado literalmente a tu correo." };
  } catch (error: any) {
    console.error("Error en forgotPassword:", error);
    return { success: false, message: "Error al enviar el correo de recuperación." };
  }
}

export async function resetPasswordWithOtp(data: { email: string; otp: string; newPassword: string }) {
  try {
    const sanitizedEmail = data.email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: sanitizedEmail } });

    if (!user) {
      return { success: false, message: "Usuario no encontrado." };
    }

    if (user.otpExpiresAt && new Date() > new Date(user.otpExpiresAt)) {
      return { success: false, message: "El código OTP ha expirado. Solicita uno nuevo." };
    }

    if (user.verificationCode !== data.otp.trim()) {
      return { success: false, message: "El código OTP es incorrecto." };
    }

    const isPasswordValid = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!\%*?&]{8,}$/.test(data.newPassword);
    if (!isPasswordValid) {
      return { success: false, message: "La nueva contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo." };
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    await prisma.user.update({
      where: { email: sanitizedEmail },
      data: {
        password: hashedPassword,
        verificationCode: null,
        otpExpiresAt: null,
      } as any,
    });

    return { success: true, message: "Contraseña actualizada exitosamente." };
  } catch (error: any) {
    console.error("Error en resetPasswordWithOtp:", error);
    return { success: false, message: "Error al actualizar la contraseña." };
  }
}