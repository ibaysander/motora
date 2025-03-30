'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('motorcycles', 'type', {
      type: Sequelize.ENUM('Matic', 'Manual'),
      allowNull: true,
      after: 'model'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('motorcycles', 'type');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_motorcycles_type";');
  }
}; 