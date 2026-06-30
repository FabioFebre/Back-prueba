const express = require('express');
const router = express.Router();
const { Reclamo } = require('../models');

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
