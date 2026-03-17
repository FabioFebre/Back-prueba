const express = require('express');
const router = express.Router();
const { Carrito, CarritoItem, Producto, Usuario, Variante } = require('../models');

// Obtener carrito completo por usuarioId
router.get('/:usuarioId', async (req, res) => {
  try {
    const { usuarioId } = req.params;

    let carrito = await Carrito.findOne({
      where: { usuarioId },
      include: [
        {
          model: CarritoItem,
          as: 'items',
          include: [
            {
              model: Producto,
              as: 'producto'
            },
            {
              model: Variante,
              as: 'variante'
            }
          ]
        },
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'apellido', 'email']
        }
      ]
    });

    if (!carrito) {
      carrito = await Carrito.create({ usuarioId });
      carrito.items = [];
      carrito.usuario = await Usuario.findByPk(usuarioId, {
        attributes: ['id', 'nombre', 'apellido', 'email']
      });
    }

    res.json(carrito);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el carrito' });
  }
});


// Agregar producto al carrito
router.post('/add', async (req, res) => {
  try {
    const {
      usuarioId,
      productoId,
      varianteId = null,
      cantidad = 1,
      talla = null,
      color = null
    } = req.body;

    if (!usuarioId || !productoId) {
      return res.status(400).json({ error: 'usuarioId y productoId son requeridos' });
    }

    // Validar que la variante pertenezca al producto y tenga stock, si viene varianteId
    if (varianteId) {
      const variante = await Variante.findOne({
        where: { id: varianteId, productoId }
      });
      if (!variante) {
        return res.status(400).json({ error: 'Variante no encontrada para el producto' });
      }
      if ((variante.cantidad ?? 0) < 1) {
        return res.status(400).json({ error: 'Sin stock para la variante seleccionada' });
      }
    }

    // Asegurar que el carrito exista
    let carrito = await Carrito.findOne({ where: { usuarioId } });
    if (!carrito) carrito = await Carrito.create({ usuarioId });

    // Buscar item existente priorizando varianteId; si no viene, usar talla+color
    const where = {
      carritoId: carrito.id,
      productoId
    };
    if (varianteId) {
      where.varianteId = varianteId;
    } else {
      where.talla = talla;
      where.color = color;
    }

    let item = await CarritoItem.findOne({ where });

    if (item) {
      item.cantidad += Number(cantidad) || 0;
      await item.save();
    } else {
      item = await CarritoItem.create({
        carritoId: carrito.id,
        productoId,
        varianteId,
        cantidad: Number(cantidad) || 1,
        talla,
        color
      });
    }

    res.status(201).json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al agregar producto al carrito' });
  }
});

// Actualizar un ítem del carrito
router.put('/update/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const { cantidad, talla, color } = req.body;

    const item = await CarritoItem.findByPk(itemId);
    if (!item) return res.status(404).json({ error: 'Item no encontrado' });

    if (cantidad !== undefined) item.cantidad = cantidad;
    if (talla !== undefined) item.talla = talla;
    if (color !== undefined) item.color = color;

    await item.save();
    res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar item del carrito' });
  }
});

// Eliminar un ítem del carrito
router.delete('/remove/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;

    const deleted = await CarritoItem.destroy({ where: { id: itemId } });
    if (!deleted) return res.status(404).json({ error: 'Item no encontrado' });

    res.json({ mensaje: 'Item eliminado del carrito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar item' });
  }
});

// Vaciar todo el carrito de un usuario
router.delete('/clear/:usuarioId', async (req, res) => {
  try {
    const { usuarioId } = req.params;

    const carrito = await Carrito.findOne({ where: { usuarioId } });
    if (!carrito) return res.status(404).json({ error: 'Carrito no encontrado' });

    await CarritoItem.destroy({ where: { carritoId: carrito.id } });

    res.json({ mensaje: 'Carrito vaciado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al vaciar el carrito' });
  }
});

module.exports = router;
