'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Step 1: Add new columns
    await queryInterface.addColumn('products', 'motorcycle_manufacturer', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    
    await queryInterface.addColumn('products', 'motorcycle_model', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Step 2: Migrate data from tipe_motor to the new columns
    const products = await queryInterface.sequelize.query(
      'SELECT id, tipe_motor FROM products WHERE tipe_motor IS NOT NULL',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    for (const product of products) {
      if (product.tipe_motor) {
        const parts = product.tipe_motor.split(' ');
        let manufacturer = null;
        let model = null;
        
        if (parts.length >= 2) {
          manufacturer = parts[0];
          model = parts.slice(1).join(' ');
        } else {
          manufacturer = product.tipe_motor;
        }

        await queryInterface.sequelize.query(
          `UPDATE products SET 
           motorcycle_manufacturer = ?, 
           motorcycle_model = ? 
           WHERE id = ?`,
          {
            replacements: [manufacturer, model, product.id],
            type: queryInterface.sequelize.QueryTypes.UPDATE
          }
        );
      }
    }

    // Step 3: Remove the old column
    await queryInterface.removeColumn('products', 'tipe_motor');
  },

  async down(queryInterface, Sequelize) {
    // Step 1: Add back the old column
    await queryInterface.addColumn('products', 'tipe_motor', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Step 2: Migrate data back to tipe_motor
    const products = await queryInterface.sequelize.query(
      `SELECT id, motorcycle_manufacturer, motorcycle_model FROM products 
       WHERE motorcycle_manufacturer IS NOT NULL OR motorcycle_model IS NOT NULL`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    for (const product of products) {
      const tipeMotor = [
        product.motorcycle_manufacturer,
        product.motorcycle_model
      ].filter(Boolean).join(' ');

      if (tipeMotor) {
        await queryInterface.sequelize.query(
          `UPDATE products SET tipe_motor = ? WHERE id = ?`,
          {
            replacements: [tipeMotor, product.id],
            type: queryInterface.sequelize.QueryTypes.UPDATE
          }
        );
      }
    }

    // Step 3: Remove the new columns
    await queryInterface.removeColumn('products', 'motorcycle_manufacturer');
    await queryInterface.removeColumn('products', 'motorcycle_model');
  }
}; 