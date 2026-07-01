'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Reclamos', 'mensaje', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Reclamos', 'mensaje', {
      type: Sequelize.TEXT,
      allowNull: false,
    });
  }
};
