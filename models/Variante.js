// models/variante.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Variante extends Model {
    static associate(models) {
      Variante.belongsTo(models.Producto, {
        foreignKey: 'productoId',
        as: 'producto'
      });
    }
  }

  Variante.init({
    productoId:   DataTypes.INTEGER,
    color:        DataTypes.STRING,
    talla:        DataTypes.STRING,
    precio:       DataTypes.DECIMAL(10, 2),
    cantidad:     { type: DataTypes.INTEGER, defaultValue: 0 },
    sku:          DataTypes.STRING,
    imagenes: {
      type: DataTypes.JSONB         // Postgres nativo, no necesita getter/setter
    },
    seleccionado: { type: DataTypes.BOOLEAN, defaultValue: false },
    activo:       { type: DataTypes.BOOLEAN, defaultValue: true },
  }, {
    sequelize,
    modelName: 'Variante',
  });

  return Variante;
};