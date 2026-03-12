'use strict';
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Variantes', {

      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      productoId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Productos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },

      color: {
        type: Sequelize.STRING
      },

      talla: {
        type: Sequelize.STRING
      },

      precio: {
        type: Sequelize.DECIMAL(10,2)
      },

      cantidad: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },

      sku: {
        type: Sequelize.STRING
      },


      seleccionado: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },

      activo: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }

    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Variantes');
  }
};