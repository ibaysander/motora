import sequelize from './database';
import Product from '../models/Product';
import Category from '../models/Category';
import Brand from '../models/Brand';

export const initializeDatabase = async () => {
  try {
    // Test the connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Sync all models without force to preserve data
    await sequelize.sync();
    console.log('Database tables synchronized successfully.');

    return sequelize;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
};
