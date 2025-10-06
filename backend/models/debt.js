import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import Expense from './expense.js';
import User from './user.js';

const Debt = sequelize.define('Debt', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('unpaid', 'resolved'),
    allowNull: false,
    defaultValue: 'unpaid'
  }
}, {
  tableName: 'debts',
  timestamps: true
});

Debt.belongsTo(Expense, {
  foreignKey: { name: 'expenseId', allowNull: false },
  onDelete: 'CASCADE'
});

Debt.belongsTo(User, {
  as: 'Payer',
  foreignKey: { name: 'payerUserId', allowNull: false },
  onDelete: 'CASCADE'
});

Debt.belongsTo(User, {
  as: 'Debtor',
  foreignKey: { name: 'debtorUserId', allowNull: false },
  onDelete: 'CASCADE'
});

export default Debt;


