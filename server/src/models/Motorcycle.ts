import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Motorcycle extends Model {
  public id!: number;
  public manufacturer!: string;
  public model!: string | null;
  public type!: 'Matic' | 'Manual' | null;
}

Motorcycle.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    manufacturer: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    model: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM('Matic', 'Manual'),
      allowNull: true,
    }
  },
  {
    sequelize,
    modelName: 'Motorcycle',
    tableName: 'motorcycles',
    timestamps: true,
  }
);

export default Motorcycle; 