import { Router } from 'express';
import { Transaction, TransactionItem, Product, Category, Brand } from '../models';
import { Op } from 'sequelize';

const router = Router();

// Get all transactions
router.get('/transactions', async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      order: [['date', 'DESC']]
    });
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Get transaction details with items
router.get('/transactions/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findByPk(req.params.id, {
      include: [{
        model: TransactionItem,
        as: 'items',
        include: [{
          model: Product,
          as: 'product'
        }]
      }]
    });
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.json(transaction);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

// Create a new transaction
router.post('/transactions', async (req, res) => {
  const { type, paymentMethod, customerName, notes, items } = req.body;
  
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Transaction must have at least one item' });
  }
  
  // Start a transaction to ensure data consistency
  const t = await (Transaction as any).sequelize.transaction();
  
  try {
    // Calculate total amount from items
    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    
    // Create the transaction record
    const transaction = await Transaction.create({
      date: new Date(),
      type,
      totalAmount,
      paymentMethod,
      customerName,
      notes
    }, { transaction: t });
    
    // Create transaction items
    for (const item of items) {
      await TransactionItem.create({
        transactionId: transaction.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        unit_price: item.price,
        subtotal: item.quantity * item.price
      }, { transaction: t });
      
      // Update product stock based on transaction type
      const product = await Product.findByPk(item.productId, { transaction: t });
      if (product) {
        if (type === 'Sale') {
          await product.update({
            currentStock: Math.max(0, product.currentStock - item.quantity)
          }, { transaction: t });
        } else if (type === 'Purchase') {
          await product.update({
            currentStock: product.currentStock + item.quantity
          }, { transaction: t });
        } else if (type === 'Return') {
          // For returns, assume we're returning purchased items (increasing stock)
          await product.update({
            currentStock: product.currentStock + item.quantity
          }, { transaction: t });
        }
      }
    }
    
    await t.commit();
    
    // Fetch the complete transaction with items
    const createdTransaction = await Transaction.findByPk(transaction.id, {
      include: [{
        model: TransactionItem,
        as: 'items',
        include: [{
          model: Product,
          as: 'product'
        }]
      }]
    });
    
    res.status(201).json(createdTransaction);
  } catch (error) {
    await t.rollback();
    console.error('Error creating transaction:', error);
    res.status(400).json({ error: 'Failed to create transaction' });
  }
});

// Delete a transaction (with validation)
router.delete('/transactions/:id', async (req, res) => {
  // Start a transaction to ensure data consistency
  const t = await (Transaction as any).sequelize.transaction();
  
  try {
    const transaction = await Transaction.findByPk(req.params.id, {
      include: [{ model: TransactionItem, as: 'items' }],
      transaction: t
    });
    
    if (!transaction) {
      await t.rollback();
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    // Revert stock changes
    const items = (transaction as any).items;
    for (const item of items) {
      const product = await Product.findByPk(item.productId, { transaction: t });
      if (product) {
        if (transaction.type === 'Sale') {
          // If deleting a sale, add stock back
          await product.update({
            currentStock: product.currentStock + item.quantity
          }, { transaction: t });
        } else if (transaction.type === 'Purchase') {
          // If deleting a purchase, remove stock
          await product.update({
            currentStock: Math.max(0, product.currentStock - item.quantity)
          }, { transaction: t });
        } else if (transaction.type === 'Return') {
          // If deleting a return, remove stock
          await product.update({
            currentStock: Math.max(0, product.currentStock - item.quantity)
          }, { transaction: t });
        }
      }
    }
    
    // Delete the transaction items first
    await TransactionItem.destroy({
      where: { transactionId: transaction.id },
      transaction: t
    });
    
    // Then delete the transaction
    await transaction.destroy({ transaction: t });
    
    await t.commit();
    
    res.status(204).send();
  } catch (error) {
    await t.rollback();
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

// Generate a receipt (return transaction with detailed items)
router.get('/transactions/:id/receipt', async (req, res) => {
  try {
    const transaction = await Transaction.findByPk(req.params.id, {
      include: [{
        model: TransactionItem,
        as: 'items',
        include: [{
          model: Product,
          as: 'product',
          include: [
            { model: Category, as: 'category' },
            { model: Brand, as: 'brand' }
          ]
        }]
      }]
    });
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.json(transaction);
  } catch (error) {
    console.error('Error generating receipt:', error);
    res.status(500).json({ error: 'Failed to generate receipt' });
  }
});

// Get transactions by date range
router.get('/transactions/filter/date', async (req, res) => {
  const { startDate, endDate } = req.query;
  
  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'Start date and end date are required' });
  }
  
  try {
    const transactions = await Transaction.findAll({
      where: {
        date: {
          [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
        }
      },
      order: [['date', 'DESC']]
    });
    
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions by date range:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

export default router; 