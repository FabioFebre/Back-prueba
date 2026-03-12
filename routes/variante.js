const express = require('express');
const router = express.Router();
const { Variante, Producto } = require('../models');
const multer = require('multer');
const upload = require('../middlewares/upload');
const auth = require('../middlewares/auth');
const hasRole = require('../middlewares/hasRole');

// ✅ CREATE variant
router.post('/', auth, hasRole('admin', 'employee'), upload.array('imagenes', 10), async (req, res) => {
  try {
    const { productoId, color, talla, precio, cantidad, sku, seleccionado, activo } = req.body;

    // Verify product exists
    const producto = await Producto.findByPk(productoId);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });

    const imagenes = req.files ? req.files.map(file => file.path) : [];

    const nuevaVariante = await Variante.create({
      productoId,
      color,
      talla,
      precio: parseFloat(precio),
      cantidad: parseInt(cantidad)
    });

    res.status(201).json(nuevaVariante);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear variante', details: error.message });
  }
});

// ✅ GET all variants for a product
router.get('/producto/:productoId', async (req, res) => {
  try {
    const { productoId } = req.params;

    const variantes = await Variante.findAll({
      where: { productoId },
      include: { model: Producto, as: 'producto', attributes: ['id', 'nombre', 'descripcion'] }
    });

    res.json(variantes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener variantes' });
  }
});

// ✅ GET single variant
router.get('/:id', async (req, res) => {
  try {
    const variante = await Variante.findByPk(req.params.id, {
      include: { model: Producto, as: 'producto', attributes: ['id', 'nombre', 'descripcion', 'imagen'] }
    });

    if (!variante) return res.status(404).json({ error: 'Variante no encontrada' });
    res.json(variante);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener variante' });
  }
});

// ✅ UPDATE variant
router.put('/:id', auth, hasRole('admin', 'employee'), upload.array('imagenes', 10), async (req, res) => {
  try {
    const variante = await Variante.findByPk(req.params.id);
    if (!variante) return res.status(404).json({ error: 'Variante no encontrada' });

    const { color, talla, precio, cantidad, sku, seleccionado, activo } = req.body;

    const imagenes = req.files && req.files.length > 0
      ? req.files.map(file => file.path)
      : variante.imagenes;

    await variante.update({
      color: color !== undefined ? color : variante.color,
      talla: talla !== undefined ? talla : variante.talla,
      precio: precio !== undefined ? parseFloat(precio) : variante.precio,
      cantidad: cantidad !== undefined ? parseInt(cantidad) : variante.cantidad
    });

    res.json(variante);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar variante' });
  }
});

// ✅ DELETE variant
router.delete('/:id', auth, hasRole('admin'), async (req, res) => {
  try {
    const variante = await Variante.findByPk(req.params.id);
    if (!variante) return res.status(404).json({ error: 'Variante no encontrada' });

    await variante.destroy();
    res.json({ mensaje: 'Variante eliminada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar variante' });
  }
});

module.exports = router;