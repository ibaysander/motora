import sequelize from './database';
import Product from '../models/Product';
import Category from '../models/Category';
import Brand from '../models/Brand';

export const initializeDatabase = async () => {
  try {
    // Test the connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Force sync to recreate tables (WARNING: This will delete existing data)
    await sequelize.sync({ force: true });
    console.log('Database tables created successfully.');

    return sequelize;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
};
