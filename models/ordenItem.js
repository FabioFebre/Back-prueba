'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class OrdenItem extends Model {
    static associate(models) {
      OrdenItem.belongsTo(models.Orden, {
        foreignKey: 'ordenId',
        as: 'orden',
        onDelete: 'CASCADE'
      });

      OrdenItem.belongsTo(models.Producto, {
        foreignKey: 'productoId',
        as: 'producto',
        onDelete: 'SET NULL'
      });

      // Nueva asociación
      OrdenItem.belongsTo(models.Variante, {
        foreignKey: 'varianteId',
        as: 'variante',
        onDelete: 'SET NULL'
      });
    }
  }

  OrdenItem.init({
    ordenId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    productoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    varianteId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    precio: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    talla: {
      type: DataTypes.STRING,
      allowNull: true
    },
    color: {
      type: DataTypes.STRING,
      allowNull: true
    },
    nombreProducto: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'OrdenItem',
    tableName: 'ordenitems',
    freezeTableName: true
  });

  return OrdenItem;
};
