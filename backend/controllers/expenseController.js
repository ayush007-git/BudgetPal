import { sequelize, Group, Expense, Debt } from '../models/index.js';

export async function createExpense(req, res, next) {
  try {
    const { groupId } = req.params;
    const { totalAmount, description, paidById, screenshotUrl } = req.body;

    if (!groupId || !totalAmount || !description || !paidById) {
      return res.status(400).json({ message: 'groupId, totalAmount, description, and paidById are required' });
    }

    // 1 & 2. Create Expense
    const expense = await Expense.create({
      description,
      totalAmount,
      screenshotUrl: screenshotUrl || null,
      date: new Date(),
      groupId,
      paidByUserId: paidById
    });

    // 3. Find all members of the group
    const group = await Group.findByPk(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    const members = await group.getUsers({ attributes: ['id'] });
    if (!members || members.length === 0) {
      return res.status(400).json({ message: 'Group has no members' });
    }

    // 4. Calculate share
    const share = Number(totalAmount) / members.length;

    // 5-7. Create debts in a transaction for non-payer members
    const tx = await sequelize.transaction();
    try {
      for (const member of members) {
        if (String(member.id) === String(paidById)) continue;
        await Debt.create({
          amount: share,
          expenseId: expense.id,
          payerUserId: paidById,
          debtorUserId: member.id
        }, { transaction: tx });
      }
      await tx.commit();
    } catch (err) {
      await tx.rollback();
      throw err;
    }

    // 8. Return the created expense
    return res.status(201).json(expense);
  } catch (error) {
    next(error);
  }
}


