'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Reclamos', 'fecha', {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });
    await queryInterface.addColumn('Reclamos', 'tipoDoc', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Reclamos', 'nroDoc', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Reclamos', 'nombres', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Reclamos', 'apellidos', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Reclamos', 'email', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Reclamos', 'telefono', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Reclamos', 'direccion', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('Reclamos', 'menoNombres', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Reclamos', 'menoApellidos', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Reclamos', 'menoEmail', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Reclamos', 'menoTelefono', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Reclamos', 'menoDireccion', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('Reclamos', 'productoServicio', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Reclamos', 'monto', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Reclamos', 'descripcion', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('Reclamos', 'tipo', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Reclamos', 'detalle', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('Reclamos', 'pedido', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.changeColumn('Reclamos', 'usuarioId', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.changeColumn('Reclamos', 'ordenId', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    const columns = [
      'fecha', 'tipoDoc', 'nroDoc', 'nombres', 'apellidos', 'email',
      'telefono', 'direccion', 'menoNombres', 'menoApellidos', 'menoEmail',
      'menoTelefono', 'menoDireccion', 'productoServicio', 'monto',
      'descripcion', 'tipo', 'detalle', 'pedido'
    ];
    for (const col of columns) {
      await queryInterface.removeColumn('Reclamos', col);
    }
    await queryInterface.changeColumn('Reclamos', 'usuarioId', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
    await queryInterface.changeColumn('Reclamos', 'ordenId', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  }
};
