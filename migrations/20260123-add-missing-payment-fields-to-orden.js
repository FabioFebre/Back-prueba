'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Obtener la estructura actual de la tabla
    const tableInfo = await queryInterface.describeTable('Ordens');
    
    // Agregar columnas solo si no existen
    const columnsToAdd = {
      orderIdIzipay: { type: Sequelize.STRING, allowNull: true },
      transactionId: { type: Sequelize.STRING, allowNull: true },
      paymentStatus: { type: Sequelize.STRING, allowNull: true },
      paymentResponse: { type: Sequelize.TEXT, allowNull: true },
      paymentDate: { type: Sequelize.DATE, allowNull: true },
      orderidizipay: { type: Sequelize.STRING, allowNull: true },
      transactionid: { type: Sequelize.STRING, allowNull: true },
      paymentstatus: { type: Sequelize.STRING, allowNull: true },
      paymentresponse: { type: Sequelize.TEXT, allowNull: true },
      paymentdate: { type: Sequelize.DATE, allowNull: true }
    };

    for (const [columnName, columnConfig] of Object.entries(columnsToAdd)) {
      if (!tableInfo[columnName]) {
        await queryInterface.addColumn('Ordens', columnName, columnConfig);
      }
    }
  },

  async down(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('Ordens');
    const columnsToRemove = [
      'orderIdIzipay',
      'transactionId', 
      'paymentStatus',
      'paymentResponse',
      'paymentDate',
      'orderidizipay',
      'transactionid',
      'paymentstatus',
      'paymentresponse',
      'paymentdate'
    ];

    for (const columnName of columnsToRemove) {
      if (tableInfo[columnName]) {
        await queryInterface.removeColumn('Ordens', columnName);
      }
    }
  }
};
