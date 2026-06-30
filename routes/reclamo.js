const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { Reclamo } = require('../models');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

router.post('/', async (req, res) => {
  try {
    const {
      fecha, tipoDoc, nroDoc, nombres, apellidos, email, telefono, direccion,
      menoNombres, menoApellidos, menoEmail, menoTelefono, menoDireccion,
      productoServicio, monto, descripcion, tipo, detalle, pedido,
      usuarioId, ordenId, mensaje
    } = req.body;

    const nuevoReclamo = await Reclamo.create({
      fecha, tipoDoc, nroDoc, nombres, apellidos, email, telefono, direccion,
      menoNombres, menoApellidos, menoEmail, menoTelefono, menoDireccion,
      productoServicio, monto, descripcion, tipo, detalle, pedido,
      usuarioId: usuarioId || null,
      ordenId: ordenId || null,
      mensaje: mensaje || null,
      estado: 'pendiente'
    });

    if (email) {
      try {
        const tipoLabel = tipo === 'queja' ? 'Queja' : 'Reclamo';
        await transporter.sendMail({
          from: `"SG Studio" <${process.env.SMTP_USER}>`,
          to: email,
          subject: `Hemos recibido tu ${tipoLabel} - SG Studio`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto;">
              <h2 style="color: #000;">SG Studio</h2>
              <p>Hola <strong>${nombres} ${apellidos}</strong>,</p>
              <p>Hemos recibido tu <strong>${tipoLabel}</strong> con el código <strong>#${nuevoReclamo.id}</strong>.</p>
              <p>Nos pondremos en contacto contigo a la brevedad para brindarte una solución.</p>
              <hr style="border: none; border-top: 1px solid #eee;" />
              <p style="color: #666; font-size: 13px;">
                <strong>Resumen de tu ${tipoLabel.toLowerCase()}:</strong><br />
                Producto/Servicio: ${productoServicio}<br />
                Fecha: ${fecha}<br />
                Detalle: ${detalle}
              </p>
              <hr style="border: none; border-top: 1px solid #eee;" />
              <p style="color: #999; font-size: 12px;">SG Studio - Libro de Reclamaciones</p>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error('Error al enviar email de confirmacion:', emailErr);
      }
    }

    res.status(201).json({ mensaje: 'Reclamo enviado correctamente', reclamo: nuevoReclamo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al enviar reclamo' });
  }
});

// 👉 Obtener todos los reclamos (puedes filtrar por usuarioId o admin)
router.get('/', async (req, res) => {
  try {
    const reclamos = await Reclamo.findAll();
    res.json(reclamos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener reclamos' });
  }
});

// 👉 Obtener un reclamo por ID
router.get('/:id', async (req, res) => {
  try {
    const reclamo = await Reclamo.findByPk(req.params.id);
    if (!reclamo) return res.status(404).json({ error: 'Reclamo no encontrado' });

    res.json(reclamo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener el reclamo' });
  }
});

// 👉 Editar un reclamo
router.put('/:id', async (req, res) => {
  try {
    const { mensaje, estado } = req.body;

    const reclamo = await Reclamo.findByPk(req.params.id);
    if (!reclamo) return res.status(404).json({ error: 'Reclamo no encontrado' });

    if (mensaje) reclamo.mensaje = mensaje;
    if (estado) reclamo.estado = estado;

    await reclamo.save();
    res.json({ mensaje: 'Reclamo actualizado', reclamo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar el reclamo' });
  }
});

// 👉 Eliminar un reclamo
router.delete('/:id', async (req, res) => {
  try {
    const reclamo = await Reclamo.findByPk(req.params.id);
    if (!reclamo) return res.status(404).json({ error: 'Reclamo no encontrado' });

    await reclamo.destroy();
    res.json({ mensaje: 'Reclamo eliminado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar el reclamo' });
  }
});

module.exports = router;
