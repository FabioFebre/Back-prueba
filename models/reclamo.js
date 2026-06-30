'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Reclamo extends Model {
    static associate(models) {
      Reclamo.belongsTo(models.Usuario, { foreignKey: 'usuarioId', as: 'usuario' });
      Reclamo.belongsTo(models.Orden, { foreignKey: 'ordenId', as: 'orden' });
    }
  }
  Reclamo.init({
    usuarioId: { type: DataTypes.INTEGER, allowNull: true },
    ordenId: { type: DataTypes.INTEGER, allowNull: true },
    mensaje: { type: DataTypes.TEXT, allowNull: true },
    estado: { type: DataTypes.STRING, defaultValue: 'pendiente' },
    fecha: { type: DataTypes.DATEONLY, allowNull: true },
    tipoDoc: { type: DataTypes.STRING, allowNull: true },
    nroDoc: { type: DataTypes.STRING, allowNull: true },
    nombres: { type: DataTypes.STRING, allowNull: true },
    apellidos: { type: DataTypes.STRING, allowNull: true },
    email: { type: DataTypes.STRING, allowNull: true },
    telefono: { type: DataTypes.STRING, allowNull: true },
    direccion: { type: DataTypes.TEXT, allowNull: true },
    menoNombres: { type: DataTypes.STRING, allowNull: true },
    menoApellidos: { type: DataTypes.STRING, allowNull: true },
    menoEmail: { type: DataTypes.STRING, allowNull: true },
    menoTelefono: { type: DataTypes.STRING, allowNull: true },
    menoDireccion: { type: DataTypes.TEXT, allowNull: true },
    productoServicio: { type: DataTypes.STRING, allowNull: true },
    monto: { type: DataTypes.STRING, allowNull: true },
    descripcion: { type: DataTypes.TEXT, allowNull: true },
    tipo: { type: DataTypes.STRING, allowNull: true },
    detalle: { type: DataTypes.TEXT, allowNull: true },
    pedido: { type: DataTypes.TEXT, allowNull: true },
  }, {
    sequelize,
    modelName: 'Reclamo',
  });
  return Reclamo;
};
