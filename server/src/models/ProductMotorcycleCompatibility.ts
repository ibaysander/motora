import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import Product from './Product';
import Motorcycle from './Motorcycle';

class ProductMotorcycleCompatibility extends Model {
  public id!: number;
  public productId!: number;
  public motorcycleId!: number;
}

ProductMotorcycleCompatibility.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'product_id',
      references: {
        model: 'products',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    motorcycleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'motorcycle_id',
      references: {
        model: 'motorcycles',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  },
  {
    sequelize,
    modelName: 'ProductMotorcycleCompatibility',
    tableName: 'product_motorcycle_compatibility',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['product_id', 'motorcycle_id'],
        name: 'product_motorcycle_unique'
      }
    ]
  }
);

export default ProductMotorcycleCompatibility; 