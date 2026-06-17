const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { Usuario, PasswordResetToken } = require('../models');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'El correo es obligatorio' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const usuario = await Usuario.findOne({ where: { email: normalizedEmail } });

    const responseMessage = 'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña';

    if (!usuario) {
      return res.json({ mensaje: responseMessage });
    }

    // Invalidar tokens anteriores no usados del mismo usuario
    await PasswordResetToken.update(
      { used: true },
      { where: { usuario_id: usuario.id, used: false, expires_at: { [require('sequelize').Op.gt]: new Date() } } }
    );

    // Generar token seguro
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    await PasswordResetToken.create({
      usuario_id: usuario.id,
      token_hash: tokenHash,
      expires_at: new Date(Date.now() + 30 * 60 * 1000), // 30 min
    });

    const resetLink = `${FRONTEND_URL}/resetear-contrasena?token=${token}`;

    try {
      await transporter.sendMail({
        from: `"SG Studio" <${process.env.SMTP_USER}>`,
        to: usuario.email,
        subject: 'Restablece tu contraseña - SG Studio',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
            <h2 style="color: #000;">SG Studio</h2>
            <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
            <p>Haz clic en el siguiente enlace para crear una nueva contraseña. Este enlace expira en 30 minutos.</p>
            <a href="${resetLink}"
               style="display: inline-block; background: #000; color: #fff; text-decoration: none;
                      padding: 12px 28px; border-radius: 6px; margin: 16px 0;">
              Restablecer contraseña
            </a>
            <p style="color: #666; font-size: 13px;">Si no solicitaste este cambio, puedes ignorar este correo.</p>
            <hr style="border: none; border-top: 1px solid #eee;" />
            <p style="color: #999; font-size: 12px;">SG Studio</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error('Error al enviar email:', emailError);
    }

    res.json({ mensaje: responseMessage });

  } catch (error) {
    console.error('Error en forgot-password:', error);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Token y nueva contraseña son obligatorios' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const resetToken = await PasswordResetToken.findOne({
      where: {
        token_hash: tokenHash,
        used: false,
        expires_at: { [require('sequelize').Op.gt]: new Date() },
      },
    });

    if (!resetToken) {
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await Usuario.update(
      { password: hashedPassword },
      { where: { id: resetToken.usuario_id } }
    );

    await resetToken.update({ used: true });

    res.json({ mensaje: 'Contraseña restablecida exitosamente' });

  } catch (error) {
    console.error('Error en reset-password:', error);
    res.status(500).json({ error: 'Error al restablecer la contraseña' });
  }
});

module.exports = router;
