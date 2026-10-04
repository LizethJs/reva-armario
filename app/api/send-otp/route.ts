import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 });
    }

    // Leemos exactamente los nombres que tienes en tu archivo .env
    const userEmail = process.env.EMAIL_SERVER_USER;
    const userPass = process.env.EMAIL_SERVER_PASSWORD;

    if (!userEmail || !userPass) {
      console.error("Variables de entorno no detectadas en .env:", { userEmail, userPass });
      return NextResponse.json({ error: 'Faltan credenciales SMTP configuradas en el archivo .env' }, { status: 500 });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: userEmail,
        pass: userPass
      }
    });

    const mailOptions = {
      from: '"Plataforma RËVA Tesis" <no-reply@reva.studio>',
      to: email,
      subject: 'Código de Verificación OTP - RËVA',
      html: `
        <div style="background-color: #0a0a0a; color: #ffffff; padding: 30px; font-family: Arial, sans-serif; border-radius: 16px; border: 1px solid #333;">
          <h2 style="color: #fbbf24; text-transform: uppercase; letter-spacing: 2px;">RËVA - Verificación de Cuenta</h2>
          <p style="color: #a3a3a3; font-size: 14px;">Has solicitado registrarte en la plataforma de probador virtual y marketplace.</p>
          <div style="background-color: #171717; padding: 20px; text-align: center; border-radius: 12px; margin: 20px 0; border: 1px solid #404040;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #fbbf24;">${code}</span>
          </div>
          <p style="color: #737373; font-size: 12px;">Este código es confidencial y válido para tu proceso de auditoría y trabajo de grado.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: 'Correo enviado correctamente' });
  } catch (error: any) {
    console.error('Error enviando correo con Nodemailer:', error);
    return NextResponse.json({ error: error.message || 'Error interno al enviar el correo' }, { status: 500 });
  }
}