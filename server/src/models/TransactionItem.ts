import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import Transaction from './Transaction';
import Product from './Product';

class TransactionItem extends Model {
  public id!: number;
  public transactionId!: number;
  public productId!: number;
  public quantity!: number;
  public price!: number;
  public unit_price!: number;
  public subtotal!: number;

  // Define associations
  public readonly transaction?: Transaction;
  public readonly product?: Product;
}

TransactionItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    transactionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'transaction_id',
      references: {
        model: 'transactions',
        key: 'id',
      },
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'product_id',
      references: {
        model: 'products',
        key: 'id',
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    unit_price: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    subtotal: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: 'TransactionItem',
    tableName: 'transaction_items',
    timestamps: true, // This will add createdAt and updatedAt fields
  }
);

// Define associations
TransactionItem.belongsTo(Transaction, { foreignKey: 'transactionId' });
TransactionItem.belongsTo(Product, { foreignKey: 'productId' });

export default TransactionItem; 