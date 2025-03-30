'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Step 1: Create motorcycles table
    await queryInterface.createTable('motorcycles', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      manufacturer: {
        type: Sequelize.STRING,
        allowNull: false
      },
      model: {
        type: Sequelize.STRING,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Step 2: Add motorcycleId to products table
    await queryInterface.addColumn('products', 'motorcycle_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'motorcycles',
        key: 'id'
      }
    });

    // Step 3: Check if tipe_motor column exists
    const tableInfo = await queryInterface.describeTable('products');
    if (tableInfo.tipe_motor) {
      // This means we're migrating from the old schema with tipe_motor

      // Get products with tipe_motor field
      const products = await queryInterface.sequelize.query(
        'SELECT id, tipe_motor FROM products WHERE tipe_motor IS NOT NULL',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      // Map to track motorcycles that have been created
      const motorcycleMap = new Map();
      
      // Process each product
      for (const product of products) {
        if (!product.tipe_motor) continue;
        
        const tipeMotor = product.tipe_motor.trim();
        const parts = tipeMotor.split(' ');
        
        let manufacturer, model;
        if (parts.length >= 2) {
          manufacturer = parts[0];
          model = parts.slice(1).join(' ');
        } else {
          manufacturer = tipeMotor;
          model = null;
        }
        
        // Create a unique key for this motorcycle
        const key = `${manufacturer}:${model || ''}`;
        
        let motorcycleId;
        
        // Check if we've already created this motorcycle
        if (motorcycleMap.has(key)) {
          motorcycleId = motorcycleMap.get(key);
        } else {
          // Create a new motorcycle record
          const [result] = await queryInterface.sequelize.query(
            `INSERT INTO motorcycles (manufacturer, model, "createdAt", "updatedAt") 
             VALUES (?, ?, NOW(), NOW()) RETURNING id`,
            {
              replacements: [manufacturer, model],
              type: queryInterface.sequelize.QueryTypes.INSERT
            }
          );
          
          // Extract the ID based on the database dialect
          motorcycleId = result[0]?.id || result.id || result;
          motorcycleMap.set(key, motorcycleId);
        }
        
        // Update the product with the motorcycle ID
        await queryInterface.sequelize.query(
          `UPDATE products SET motorcycle_id = ? WHERE id = ?`,
          {
            replacements: [motorcycleId, product.id],
            type: queryInterface.sequelize.QueryTypes.UPDATE
          }
        );
      }
    } else if (tableInfo.motorcycle_manufacturer) {
      // This means we're migrating from the intermediary schema with motorcycle_manufacturer and motorcycle_model
      
      // Get products with motorcycle_manufacturer field
      const products = await queryInterface.sequelize.query(
        'SELECT id, motorcycle_manufacturer, motorcycle_model FROM products WHERE motorcycle_manufacturer IS NOT NULL',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      // Map to track motorcycles that have been created
      const motorcycleMap = new Map();
      
      // Process each product
      for (const product of products) {
        if (!product.motorcycle_manufacturer) continue;
        
        const manufacturer = product.motorcycle_manufacturer.trim();
        const model = product.motorcycle_model ? product.motorcycle_model.trim() : null;
        
        // Create a unique key for this motorcycle
        const key = `${manufacturer}:${model || ''}`;
        
        let motorcycleId;
        
        // Check if we've already created this motorcycle
        if (motorcycleMap.has(key)) {
          motorcycleId = motorcycleMap.get(key);
        } else {
          // Create a new motorcycle record
          const [result] = await queryInterface.sequelize.query(
            `INSERT INTO motorcycles (manufacturer, model, "createdAt", "updatedAt") 
             VALUES (?, ?, NOW(), NOW()) RETURNING id`,
            {
              replacements: [manufacturer, model],
              type: queryInterface.sequelize.QueryTypes.INSERT
            }
          );
          
          // Extract the ID based on the database dialect
          motorcycleId = result[0]?.id || result.id || result;
          motorcycleMap.set(key, motorcycleId);
        }
        
        // Update the product with the motorcycle ID
        await queryInterface.sequelize.query(
          `UPDATE products SET motorcycle_id = ? WHERE id = ?`,
          {
            replacements: [motorcycleId, product.id],
            type: queryInterface.sequelize.QueryTypes.UPDATE
          }
        );
      }
      
      // Remove the motorcycle_manufacturer and motorcycle_model columns
      await queryInterface.removeColumn('products', 'motorcycle_manufacturer');
      await queryInterface.removeColumn('products', 'motorcycle_model');
    }
    
    // Step 4: Remove the old tipe_motor column if it exists
    if (tableInfo.tipe_motor) {
      await queryInterface.removeColumn('products', 'tipe_motor');
    }
  },

  async down(queryInterface, Sequelize) {
    // Step 1: Add back the tipe_motor column to products table
    await queryInterface.addColumn('products', 'tipe_motor', {
      type: Sequelize.STRING,
      allowNull: true
    });

    // Step 2: Migrate data back to tipe_motor
    const products = await queryInterface.sequelize.query(
      `SELECT p.id, m.manufacturer, m.model
       FROM products p
       JOIN motorcycles m ON p.motorcycle_id = m.id`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    for (const product of products) {
      const tipeMotor = [
        product.manufacturer,
        product.model
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

    // Step 3: Remove the motorcycleId column
    await queryInterface.removeColumn('products', 'motorcycle_id');

    // Step 4: Drop the motorcycles table
    await queryInterface.dropTable('motorcycles');
  }
}; 