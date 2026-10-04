'use server';

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export async function registerUser(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = (formData.get('role') as string) || 'USER';

  if (!name || !email || !password) {
    return { success: false, error: 'Todos los campos son obligatorios' };
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return { success: false, error: 'El correo electrónico ya está registrado' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        verificationCode,
        isVerified: false,
      },
    });

    await transporter.sendMail({
      from: `"RËVA Security" <${process.env.EMAIL_SERVER_USER}>`,
      to: email,
      subject: 'Código de Verificación - RËVA',
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #090d16; color: #f8fafc; padding: 32px; border-radius: 16px; max-width: 450px; margin: auto; border: 1px solid #1f2937;">
          <h2 style="color: #fbbf24; margin-top: 0; text-align: center; letter-spacing: 1px;">RËVA SECURITY</h2>
          <p style="text-align: center; color: #94a3b8;">Hola <b>${name}</b>, tu código de verificación OTP es:</p>
          <div style="background-color: #111827; color: #fbbf24; font-size: 36px; font-weight: bold; text-align: center; padding: 20px; border-radius: 12px; letter-spacing: 10px; margin: 24px 0; border: 1px solid #374151;">
            ${verificationCode}
          </div>
          <p style="text-align: center; font-size: 12px; color: #64748b;">Rol asignado: <b>${role}</b></p>
        </div>
      `,
    });

    return { success: true, email };
  } catch (error: any) {
    console.error('Error en registro:', error);
    return { success: false, error: 'Error al registrar el usuario o enviar el correo' };
  }
}

export async function verifyUserCode(formData: FormData) {
  const email = formData.get('email') as string;
  const code = formData.get('code') as string;

  if (!email || !code) {
    return { success: false, error: 'Código o correo faltante' };
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.verificationCode !== code) {
      return { success: false, error: 'Código de verificación incorrecto' };
    }

    await prisma.user.update({
      where: { email },
      data: { isVerified: true, verificationCode: null },
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error en verificación:', error);
    return { success: false, error: 'Error al verificar el código' };
  }
}

export async function loginUser(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { success: false, error: 'Faltan datos obligatorios' };
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return { success: false, error: 'Correo o contraseña incorrectos' };
    }

    if (!user.isVerified) {
      return { success: false, error: 'Debes verificar tu cuenta con el código OTP antes de iniciar sesión' };
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return { success: false, error: 'Correo o contraseña incorrectos' };
    }

    return { success: true, role: user.role, name: user.name, email: user.email };
  } catch (error: any) {
    console.error('Error en login:', error);
    return { success: false, error: 'Error de conexión con el servidor' };
  }
}