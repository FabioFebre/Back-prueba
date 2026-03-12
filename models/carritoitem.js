'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CarritoItem extends Model {
    static associate(models) {
      CarritoItem.belongsTo(models.Carrito, {
        foreignKey: 'carritoId',
        as: 'carrito',
        onDelete: 'CASCADE'
      });

      CarritoItem.belongsTo(models.Producto, {
        foreignKey: 'productoId',
        as: 'producto',
        onDelete: 'CASCADE'
      });

      // Nueva asociación
      CarritoItem.belongsTo(models.Variante, {
        foreignKey: 'varianteId',
        as: 'variante',
        onDelete: 'SET NULL'
      });
    }
  }

  CarritoItem.init({
    carritoId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    productoId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    varianteId: {
      type: DataTypes.INTEGER,
      allowNull: true   // null hasta que migres los datos históricos
    },
    cantidad: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    // talla y color se quedan por ahora para no romper código existente
    talla: DataTypes.STRING,
    color: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'CarritoItem',
  });

  return CarritoItem;
};