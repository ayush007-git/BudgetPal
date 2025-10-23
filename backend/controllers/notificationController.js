import { sequelize, User, Group, Expense, Debt } from '../models/index.js';

export async function getUserNotifications(req, res, next) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    // Get user's groups
    const user = await User.findByPk(userId, {
      include: [{
        model: Group,
        through: { attributes: [] },
        include: [{
          model: Expense,
          include: [{
            model: User,
            as: 'paidBy',
            attributes: ['id', 'username']
          }],
          order: [['createdAt', 'DESC']],
          limit: 5
        }]
      }]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const notifications = [];

    // Generate notifications for recent expenses
    for (const group of user.Groups) {
      for (const expense of group.Expenses) {
        // Only show expenses from the last 7 days
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        if (new Date(expense.createdAt) > sevenDaysAgo) {
          // Check if user owes money for this expense
          const userDebts = await Debt.findAll({
            where: {
              expenseId: expense.id,
              debtorUserId: userId,
              status: 'unpaid'
            }
          });

          if (userDebts.length > 0) {
            const totalOwed = userDebts.reduce((sum, debt) => sum + parseFloat(debt.amount), 0);
            notifications.push({
              id: `debt_${expense.id}_${userId}`,
              type: 'settlement',
              title: 'Payment reminder',
              message: `You owe ${expense.paidBy.username} ₹${totalOwed.toFixed(2)} for "${expense.description}"`,
              timestamp: expense.createdAt,
              read: false,
              groupId: group.id,
              groupName: group.name,
              expenseId: expense.id
            });
          }

          // If user paid for this expense, show who owes them
          if (expense.paidByUserId === userId) {
            const debtsForThisExpense = await Debt.findAll({
              where: {
                expenseId: expense.id,
                payerUserId: userId,
                status: 'unpaid'
              },
              include: [{
                model: User,
                as: 'Debtor',
                attributes: ['username']
              }]
            });

            if (debtsForThisExpense.length > 0) {
              const totalOwed = debtsForThisExpense.reduce((sum, debt) => sum + parseFloat(debt.amount), 0);
              const debtors = debtsForThisExpense.map(d => d.Debtor.username).join(', ');
              notifications.push({
                id: `payment_${expense.id}_${userId}`,
                type: 'payment',
                title: 'Payment pending',
                message: `${debtors} owe you ₹${totalOwed.toFixed(2)} for "${expense.description}"`,
                timestamp: expense.createdAt,
                read: false,
                groupId: group.id,
                groupName: group.name,
                expenseId: expense.id
              });
            }
          }
        }
      }
    }

    // Sort notifications by timestamp (newest first)
    notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      success: true,
      data: {
        notifications
      }
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching notifications'
    });
  }
}

export async function markNotificationAsRead(req, res, next) {
  try {
    const { notificationId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    // In a real app, you'd store notification read status in the database
    // For now, we'll just return success
    res.json({
      success: true,
      message: 'Notification marked as read'
    });

  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while marking notification as read'
    });
  }
}

export async function deleteNotification(req, res, next) {
  try {
    const { notificationId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    // In a real app, you'd delete the notification from the database
    // For now, we'll just return success
    res.json({
      success: true,
      message: 'Notification deleted'
    });

  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting notification'
    });
  }
}




