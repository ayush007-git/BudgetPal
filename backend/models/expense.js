import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import Group from './group.js';
import User from './User.js';

const Expense = sequelize.define('Expense', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { notEmpty: true }
  },
  totalAmount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  screenshotUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: 'expenses',
  timestamps: true
});

Expense.belongsTo(Group, {
  foreignKey: { name: 'groupId', allowNull: false },
  onDelete: 'CASCADE'
});

Expense.belongsTo(User, {
  as: 'paidBy',
  foreignKey: { name: 'paidByUserId', allowNull: false },
  onDelete: 'CASCADE'
});

export default Expense;


