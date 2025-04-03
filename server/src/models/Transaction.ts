import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import Product from './Product';

class Transaction extends Model {
  public id!: number;
  public date!: Date;
  public type!: 'Sale' | 'Purchase' | 'Return';
  public totalAmount!: number;
  public paymentMethod!: string;
  public customerName!: string | null;
  public notes!: string | null;
}

Transaction.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    type: {
      type: DataTypes.ENUM('Sale', 'Purchase', 'Return'),
      allowNull: false,
      defaultValue: 'Sale',
    },
    totalAmount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'total_amount',
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Cash',
      field: 'payment_method',
    },
    customerName: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'customer_name',
    },
    notes: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Transaction',
    tableName: 'transactions',
    timestamps: true, // This will add createdAt and updatedAt fields
  }
);

export default Transaction; 