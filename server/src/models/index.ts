import { Sequelize, Model, DataTypes } from 'sequelize';
import path from 'path';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'database.sqlite'),
  logging: false
});

// Define models
interface CategoryAttributes {
  id?: number;
  name: string;
}

interface BrandAttributes {
  id?: number;
  name: string;
}

interface ProductAttributes {
  id?: number;
  categoryId: number;
  brandId: number;
  tipeMotor: string | null;
  tipeSize: string | null;
  hargaBeli: number | null;
  hargaJual: number | null;
  note: string | null;
  currentStock: number;
  minThreshold: number;
}

export const Category = sequelize.define<Model<CategoryAttributes>>('Category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

export const Brand = sequelize.define<Model<BrandAttributes>>('Brand', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

export const Product = sequelize.define<Model<ProductAttributes>>('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Categories',
      key: 'id'
    }
  },
  brandId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Brands',
      key: 'id'
    }
  },
  tipeMotor: {
    type: DataTypes.STRING,
    allowNull: true
  },
  tipeSize: {
    type: DataTypes.STRING,
    allowNull: true
  },
  hargaBeli: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  hargaJual: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  note: {
    type: DataTypes.STRING,
    allowNull: true
  },
  currentStock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  minThreshold: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
});

// Set up associations
Product.belongsTo(Category, { as: 'category', foreignKey: 'categoryId' });
Product.belongsTo(Brand, { as: 'brand', foreignKey: 'brandId' });
Category.hasMany(Product, { as: 'products', foreignKey: 'categoryId' });
Brand.hasMany(Product, { as: 'products', foreignKey: 'brandId' });

export { sequelize }; 