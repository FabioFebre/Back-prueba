const express = require('express');
const router = express.Router();
const { Producto, Categoria,Variante ,sequelize  } = require('../models');
const multer = require('multer');
const path = require('path');
const upload = require('../middlewares/upload');
const hasRole = require('../middlewares/hasRole');
const auth = require('../middlewares/auth');

//Crear producto chikioo
router.post(
  '/',
  auth,
  hasRole('admin', 'employee'),
  upload.array('imagen', 10),
  async (req, res) => {

    const transaction = await sequelize.transaction();

    try {

      const {
        nombre,
        descripcion,
        categoriaId,
        composicion,
        info,
        cuidados,
        seleccionado,
        activo,
        variantes
      } = req.body;

      const imagenes = req.files ? req.files.map(file => file.path) : [];

      const producto = await Producto.create({
        nombre,
        descripcion,
        imagen: imagenes,
        categoriaId,
        composicion,
        info,
        cuidados,
        seleccionado: seleccionado === 'true',
        activo: activo !== undefined ? activo === 'true' : true
      }, { transaction });

      let variantesCreadas = [];

      if (variantes) {

        const variantesParseadas =
          typeof variantes === "string"
            ? JSON.parse(variantes)
            : variantes;

        const variantesData = variantesParseadas.map(v => ({
          productoId: producto.id,
          color: v.color,
          talla: v.talla,
          precio: parseFloat(v.precio),
          cantidad: parseInt(v.cantidad)
        }));

        variantesCreadas = await Variante.bulkCreate(variantesData, { transaction });

      }

      await transaction.commit();

      res.status(201).json({
        producto,
        variantes: variantesCreadas
      });

    } catch (error) {

      await transaction.rollback();

      console.error(error);

      res.status(500).json({
        error: 'Error al crear producto con variantes',
        details: error.message
      });

    }
  }
);

//OBTENER JUNTO A LA VARIANTE DE CADA PRODUCTO, PARA MOSTRAR EN EL FRONT LAS VARIANTES DISPONIBLES DE CADA PRODUCTO EQUIDE
router.get('/', async (req, res) => {
  try {

    const productos = await Producto.findAll({
      include: [
        {
          model: Categoria,
          as: 'categoria'
        },
        {
          model: Variante,
          as: 'variantes'
        }
      ]
    });

    res.json(productos);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


//PRODUCTOS SELECCIONADOS PARA MOSTRAR EN LA VISTA USUARIO , JUNTO A SUS VARIANTES DISPONIBLES
router.get('/seleccionados', async (req, res) => {
  try {

    const productos = await Producto.findAll({
      where: { seleccionado: true },
      include: [
        {
          model: Categoria,
          as: 'categoria'
        },
        {
          model: Variante,
          as: 'variantes'
        }
      ]
    });

    res.json(productos);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});



router.get('/:id', async (req, res) => {
  try {

    const producto = await Producto.findByPk(req.params.id, {
      include: [
        {
          model: Categoria,
          as: 'categoria'
        },
        {
          model: Variante,
          as: 'variantes'
        }
      ]
    });

    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(producto);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

//EDITAR PRODUCTO JUNTO A SUS VARIANTES, PARA MOSTRAR EN EL FRONT LAS VARIANTES DISPONIBLES DE CADA PRODUCTO EQUIDE
router.put(
  '/:id',
  auth,
  hasRole('admin', 'employee'),
  upload.array('imagen', 10),
  async (req, res) => {

    const transaction = await Producto.sequelize.transaction();

    try {

      const producto = await Producto.findByPk(req.params.id);

      if (!producto) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }

      const {
        nombre,
        descripcion,
        categoriaId,
        composicion,
        info,
        cuidados,
        seleccionado,
        activo,
        variantes
      } = req.body;

      const nuevasImagenes =
        req.files && req.files.length > 0
          ? req.files.map(file => file.path)
          : producto.imagen;

      // actualizar producto
      await producto.update({
        nombre,
        descripcion,
        imagen: nuevasImagenes,
        categoriaId,
        composicion,
        info,
        cuidados,
        seleccionado,
        ...(activo !== undefined && { activo: activo === 'true' })
      }, { transaction });

      let variantesActualizadas = [];

      if (variantes) {

        const variantesParseadas =
          typeof variantes === "string"
            ? JSON.parse(variantes)
            : variantes;

        for (const v of variantesParseadas) {

          if (v.id) {

            // actualizar variante existente
            const variante = await Variante.findByPk(v.id);

            if (variante) {

              await variante.update({
                color: v.color,
                talla: v.talla,
                precio: parseFloat(v.precio),
                cantidad: parseInt(v.cantidad)
              }, { transaction });

              variantesActualizadas.push(variante);

            }

          } else {

            // crear nueva variante
            const nuevaVariante = await Variante.create({
              productoId: producto.id,
              color: v.color,
              talla: v.talla,
              precio: parseFloat(v.precio),
              cantidad: parseInt(v.cantidad)
              
            }, { transaction });

            variantesActualizadas.push(nuevaVariante);

          }

        }

      }

      await transaction.commit();

      res.json({
        producto,
        variantes: variantesActualizadas
      });

    } catch (error) {

      await transaction.rollback();

      console.error(error);

      res.status(500).json({
        error: 'Error al actualizar producto y variantes'
      });

    }

  }
);


//Eliminar Producto 
router.delete(
  '/:id',
  auth,
  hasRole('admin'),
  async (req, res) => {
    try {
      const producto = await Producto.findByPk(req.params.id);
      if (!producto) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }

      await producto.destroy();
      res.json({ mensaje: 'Producto eliminado correctamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al eliminar el producto' });
    }
  }
);


module.exports = router;
