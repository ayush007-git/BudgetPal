import { sequelize } from '../config/database.js';
import User from './User.js';
import Group from './group.js';
import Expense from './expense.js';
import Debt from './debt.js';

// User <-> Group (Many-to-Many)
User.belongsToMany(Group, { through: 'UserGroup' });
Group.belongsToMany(User, { through: 'UserGroup' });

// Group -> Expense (One-to-Many)
Group.hasMany(Expense, {
  foreignKey: { name: 'groupId', allowNull: false },
  onDelete: 'CASCADE'
});

// User -> Expense (One-to-Many) as payer
User.hasMany(Expense, {
  as: 'paidExpenses',
  foreignKey: { name: 'paidByUserId', allowNull: false },
  onDelete: 'CASCADE'
});

// Expense -> Debt (One-to-Many)
Expense.hasMany(Debt, {
  foreignKey: { name: 'expenseId', allowNull: false },
  onDelete: 'CASCADE'
});

// User -> Debt (One-to-Many) as payer
User.hasMany(Debt, {
  as: 'Payer',
  foreignKey: { name: 'payerUserId', allowNull: false },
  onDelete: 'CASCADE'
});

// User -> Debt (One-to-Many) as debtor
User.hasMany(Debt, {
  as: 'Debtor',
  foreignKey: { name: 'debtorUserId', allowNull: false },
  onDelete: 'CASCADE'
});

export { sequelize, User, Group, Expense, Debt };
export default {
  sequelize,
  User,
  Group,
  Expense,
  Debt
};


