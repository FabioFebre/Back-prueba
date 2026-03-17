'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('CarritoItems', 'varianteId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Variantes',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Índice para búsquedas rápidas por variante
    await queryInterface.addIndex('CarritoItems', ['varianteId']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('CarritoItems', ['varianteId']);
    await queryInterface.removeColumn('CarritoItems', 'varianteId');
  }
};
