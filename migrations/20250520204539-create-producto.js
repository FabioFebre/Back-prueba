'use strict';
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Productos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      nombre: {
        type: Sequelize.STRING,
        allowNull: false
      },
      precio: {
        type: Sequelize.FLOAT 
      },
      imagen: {
        type: Sequelize.STRING,
        allowNull: true 
      },
      descripcion: {
        type: Sequelize.TEXT
      },

      categoriaId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Categoria', // asegúrate que tu tabla se llame así
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },

      composicion: {
        type: Sequelize.TEXT
      },

      info: {
        type: Sequelize.TEXT
      },

      cuidados: {
        type: Sequelize.TEXT
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
    await queryInterface.dropTable('Productos');
  }
};