const express = require('express');
const router = express.Router();
const { Categoria, Producto } = require('../models');
const hasRole = require('../middlewares/hasRole');
const auth = require('../middlewares/auth');


// Crear categoría
router.post(
  '/',
  auth, 
  hasRole('admin', 'employee'), 
  async (req, res) => {
    try {
      const categoria = await Categoria.create(req.body);
      res.status(201).json(categoria);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  }
);


// Listar categorías
router.get('/', async (req, res) => {
  try {
    const categorias = await Categoria.findAll();
    res.json(categorias);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// Obtener una categoría por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const categoria = await Categoria.findByPk(id);
    if (!categoria) {
      return res.status(404).json({ mensaje: 'Categoría no encontrada' });
    }
    res.json(categoria);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



router.put(
  '/:id',
  auth, 
  hasRole('admin', 'employee'),
  async (req, res) => {
    const { id } = req.params;
    try {
      const [filasActualizadas] = await Categoria.update(req.body, { where: { id } });

      if (filasActualizadas === 0) {
        return res.status(404).json({ mensaje: 'Categoría no encontrada para actualizar' });
      }

      res.json({ mensaje: 'Actualizada correctamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }
);


// DELETE /categorias/:id
router.delete(
  '/:id',
  auth,
  hasRole('admin', 'employee'),
  async (req, res) => {
    const { id } = req.params;
    try {
      // Buscar productos relacionados a la categoría
      const productosAsociados = await Producto.findAll({ where: { categoriaId: id } });

      if (productosAsociados.length > 0) {
        return res.status(400).json({ mensaje: 'No se puede eliminar la categoría porque tiene productos asociados.' });
      }

      const filasEliminadas = await Categoria.destroy({ where: { id } });

      if (filasEliminadas === 0) {
        return res.status(404).json({ mensaje: 'Categoría no encontrada' });
      }

      res.json({ mensaje: 'Categoría eliminada correctamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
