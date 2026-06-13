'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('Ordens');

    const columnsToAdd = {
      tipoDocumento: { type: Sequelize.STRING, allowNull: true },
      numeroDocumento: { type: Sequelize.STRING, allowNull: true }
    };

    for (const [columnName, columnConfig] of Object.entries(columnsToAdd)) {
      if (!tableInfo[columnName]) {
        await queryInterface.addColumn('Ordens', columnName, columnConfig);
      }
    }
  },

  async down(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('Ordens');
    const columnsToRemove = ['tipoDocumento', 'numeroDocumento'];

    for (const columnName of columnsToRemove) {
      if (tableInfo[columnName]) {
        await queryInterface.removeColumn('Ordens', columnName);
      }
    }
  }
};
