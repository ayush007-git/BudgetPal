import { sequelize, Group, Expense, Debt, User } from '../models/index.js';

export async function getGroupExpenses(req, res, next) {
  try {
    const { groupId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    // Check if user is a member of the group
    const group = await Group.findByPk(groupId, {
      include: [{
        model: User,
        through: { attributes: [] },
        where: { id: userId },
        attributes: ['id']
      }]
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found or you are not a member'
      });
    }

    // Fetch expenses for the group
    const expenses = await Expense.findAll({
      where: { groupId },
      include: [
        {
          model: User,
          as: 'paidBy',
          attributes: ['id', 'username']
        },
        {
          model: Debt,
          include: [{
            model: User,
            as: 'debtor',
            attributes: ['id', 'username']
          }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        expenses: expenses.map(expense => ({
          id: expense.id,
          description: expense.description,
          totalAmount: expense.totalAmount,
          date: expense.date,
          screenshotUrl: expense.screenshotUrl,
          paidBy: expense.paidBy,
          debts: expense.Debts || []
        }))
      }
    });

  } catch (error) {
    console.error('Get group expenses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching expenses'
    });
  }
}

export async function createExpense(req, res, next) {
  try {
    const { groupId } = req.params;
    const { totalAmount, description, paidById, screenshotUrl, customSplits } = req.body;

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

    // 4. Calculate shares based on split type
    let memberShares = {};
    
    if (customSplits && Object.keys(customSplits).length > 0) {
      // Custom split: use provided amounts
      memberShares = customSplits;
      
      // Validate that custom splits add up to total amount
      const customTotal = Object.values(customSplits).reduce((sum, amount) => sum + Number(amount), 0);
      if (Math.abs(customTotal - Number(totalAmount)) > 0.01) {
        return res.status(400).json({ 
          message: `Custom split total (${customTotal}) must equal expense total (${totalAmount})` 
        });
      }
    } else {
      // Equal split: divide equally among all members
      const share = Number(totalAmount) / members.length;
      members.forEach(member => {
        memberShares[member.id] = share;
      });
    }

    // 5-7. Create debts in a transaction for non-payer members
    const tx = await sequelize.transaction();
    try {
      for (const member of members) {
        if (String(member.id) === String(paidById)) continue;
        
        const shareAmount = memberShares[member.id] || 0;
        if (shareAmount > 0) {
          await Debt.create({
            amount: shareAmount,
            expenseId: expense.id,
            payerUserId: paidById,
            debtorUserId: member.id
          }, { transaction: tx });
        }
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


