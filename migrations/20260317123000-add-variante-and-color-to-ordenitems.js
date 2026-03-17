'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('ordenitems', 'varianteId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Variantes',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addColumn('ordenitems', 'color', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addIndex('ordenitems', ['varianteId']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('ordenitems', ['varianteId']);
    await queryInterface.removeColumn('ordenitems', 'color');
    await queryInterface.removeColumn('ordenitems', 'varianteId');
  }
};
