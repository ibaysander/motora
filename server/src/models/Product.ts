import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import Category from './Category';
import Brand from './Brand';
import Motorcycle from './Motorcycle';

class Product extends Model {
  public id!: number;
  public categoryId!: number;
  public brandId!: number;
  public motorcycleId!: number | null;
  public tipeSize!: string | null;
  public hargaBeli!: number | null;
  public hargaJual!: number | null;
  public note!: string | null;
  public currentStock!: number;
  public minThreshold!: number;

  // Define associations
  public readonly category?: Category;
  public readonly brand?: Brand;
  public readonly motorcycle?: Motorcycle;
}

Product.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'category_id',
      references: {
        model: 'categories',
        key: 'id',
      },
    },
    brandId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'brand_id',
      references: {
        model: 'brands',
        key: 'id',
      },
    },
    motorcycleId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'motorcycle_id',
      references: {
        model: 'motorcycles',
        key: 'id',
      },
    },
    tipeSize: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'tipe_size',
    },
    hargaBeli: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'harga_beli',
    },
    hargaJual: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'harga_jual',
    },
    note: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    currentStock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'current_stock',
    },
    minThreshold: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'min_threshold',
    },
  },
  {
    sequelize,
    modelName: 'Product',
    tableName: 'products',
    timestamps: true, // This will add createdAt and updatedAt fields
  }
);

// Define associations
Product.belongsTo(Category, { foreignKey: 'categoryId' });
Product.belongsTo(Brand, { foreignKey: 'brandId' });
Product.belongsTo(Motorcycle, { foreignKey: 'motorcycleId' });

export default Product; 