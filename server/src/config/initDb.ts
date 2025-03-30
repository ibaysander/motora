import sequelize from './database';
import { DataTypes } from 'sequelize';
import Product from '../models/Product';
import Category from '../models/Category';
import Brand from '../models/Brand';
import Motorcycle from '../models/Motorcycle';

export const initializeDatabase = async () => {
  try {
    // Test the connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Sync all models without force to preserve data
    await sequelize.sync();
    console.log('Database tables synchronized successfully.');

    // Check if the type column exists in the motorcycles table
    try {
      const tableInfo = await sequelize.getQueryInterface().describeTable('motorcycles');
      
      // If 'type' column doesn't exist, add it
      if (!tableInfo.type) {
        console.log('Adding type column to motorcycles table...');
        await sequelize.getQueryInterface().addColumn('motorcycles', 'type', {
          type: DataTypes.ENUM('Matic', 'Manual'),
          allowNull: true
        });
        console.log('Type column added to motorcycles table');
      } else {
        console.log('Type column already exists in motorcycles table');
      }
    } catch (error) {
      console.error('Error checking or altering motorcycles table:', error);
    }

    return sequelize;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
};
