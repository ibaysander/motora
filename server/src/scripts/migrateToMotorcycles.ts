import { Product, Motorcycle } from '../models';
import sequelize from '../config/database';

/**
 * This script migrates data from the old schema (using tipeMotor or motorcycle_manufacturer/motorcycle_model) 
 * to the new normalized schema using a separate motorcycles table.
 */
async function migrateToMotorcycles() {
  try {
    console.log('Starting migration to Motorcycles table...');
    
    // Check which schema we're migrating from
    const tableInfo = await sequelize.getQueryInterface().describeTable('products');
    
    if (tableInfo.tipe_motor) {
      // Migrating from the original schema with tipe_motor field
      console.log('Detected original schema with tipe_motor field');
      await migrateFromTipeMotor();
    } else if (tableInfo.motorcycle_manufacturer) {
      // Migrating from the intermediate schema with motorcycle_manufacturer/motorcycle_model fields
      console.log('Detected intermediate schema with motorcycle_manufacturer/motorcycle_model fields');
      await migrateFromManufacturerModel();
    } else if (tableInfo.motorcycle_id) {
      console.log('The schema is already using the motorcycle_id field');
      return;
    } else {
      console.log('Could not determine the current schema');
      return;
    }
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

async function migrateFromTipeMotor() {
  // Get all products with a tipe_motor value
  const products = await Product.findAll({
    where: {
      tipeMotor: {
        [sequelize.Op.not]: null
      }
    }
  });
  
  console.log(`Found ${products.length} products with tipe_motor data`);
  
  // Map to track motorcycles that have been created
  const motorcycleMap = new Map<string, number>();
  
  // Process each product
  for (const product of products) {
    const tipeMotor = product.get('tipeMotor') as string;
    if (!tipeMotor) continue;
    
    const parts = tipeMotor.trim().split(' ');
    
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
      const [motorcycle] = await Motorcycle.findOrCreate({
        where: { manufacturer, model },
        defaults: { manufacturer, model }
      });
      
      motorcycleId = motorcycle.get('id') as number;
      motorcycleMap.set(key, motorcycleId);
    }
    
    // Update the product with the motorcycle ID
    await product.update({ motorcycleId });
  }
  
  console.log(`Created/updated ${motorcycleMap.size} motorcycle records`);
}

async function migrateFromManufacturerModel() {
  // Get all products with manufacturer data
  const products = await Product.findAll({
    where: {
      motorcycleManufacturer: {
        [sequelize.Op.not]: null
      }
    }
  });
  
  console.log(`Found ${products.length} products with motorcycle_manufacturer data`);
  
  // Map to track motorcycles that have been created
  const motorcycleMap = new Map<string, number>();
  
  // Process each product
  for (const product of products) {
    const manufacturer = product.get('motorcycleManufacturer') as string;
    const model = product.get('motorcycleModel') as string | null;
    
    if (!manufacturer) continue;
    
    // Create a unique key for this motorcycle
    const key = `${manufacturer}:${model || ''}`;
    
    let motorcycleId;
    
    // Check if we've already created this motorcycle
    if (motorcycleMap.has(key)) {
      motorcycleId = motorcycleMap.get(key);
    } else {
      // Create a new motorcycle record
      const [motorcycle] = await Motorcycle.findOrCreate({
        where: { manufacturer, model },
        defaults: { manufacturer, model }
      });
      
      motorcycleId = motorcycle.get('id') as number;
      motorcycleMap.set(key, motorcycleId);
    }
    
    // Update the product with the motorcycle ID
    await product.update({ motorcycleId });
  }
  
  console.log(`Created/updated ${motorcycleMap.size} motorcycle records`);
}

// Run the migration
migrateToMotorcycles()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Migration script failed:', error);
    process.exit(1);
  }); 