import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Brand extends Model {
  public id!: number;
  public name!: string;
}

Brand.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    modelName: 'Brand',
    tableName: 'brands',
    timestamps: true,
    underscored: true,
  }
);

export default Brand; 