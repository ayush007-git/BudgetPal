// Search controller functions
import { Op } from 'sequelize';

export async function universalSearch(req, res, next) {
  try {
    const { query, types = ['groups', 'users', 'expenses'] } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    const searchQuery = query.trim().toLowerCase();
    const results = [];

    // Import models
    const { default: Group } = await import('../models/group.js');
    const { default: User } = await import('../models/User.js');
    const { default: Expense } = await import('../models/expense.js');

    // Search Groups
    if (types.includes('groups')) {
      try {
        const groups = await Group.findAll({
          include: [{
            model: User,
            through: { attributes: [] },
            where: { id: userId },
            attributes: ['id']
          }],
          where: {
            [Op.or]: [
              { name: { [Op.iLike]: `%${searchQuery}%` } },
              { description: { [Op.iLike]: `%${searchQuery}%` } }
            ]
          },
          attributes: ['id', 'name', 'description', 'createdAt'],
          limit: 10
        });

        groups.forEach(group => {
          results.push({
            id: group.id,
            type: 'group',
            title: group.name,
            subtitle: group.description || 'Group',
            icon: '👥',
            url: `/group/${group.id}`,
            createdAt: group.createdAt
          });
        });
      } catch (error) {
        console.error('Error searching groups:', error);
      }
    }

    // Search Users (within user's groups)
    if (types.includes('users')) {
      try {
        // First get all groups the user is part of
        const userGroups = await Group.findAll({
          include: [{
            model: User,
            through: { attributes: [] },
            where: { id: userId },
            attributes: ['id']
          }],
          attributes: ['id']
        });

        const groupIds = userGroups.map(group => group.id);

        if (groupIds.length > 0) {
          const users = await User.findAll({
            include: [{
              model: Group,
              through: { attributes: [] },
              where: { id: { [Op.in]: groupIds } },
              attributes: ['id']
            }],
            where: {
              [Op.or]: [
                { username: { [Op.iLike]: `%${searchQuery}%` } },
                { email: { [Op.iLike]: `%${searchQuery}%` } }
              ],
              id: { [Op.ne]: userId } // Exclude current user
            },
            attributes: ['id', 'username', 'email'],
            limit: 10
          });

          users.forEach(user => {
            results.push({
              id: user.id,
              type: 'user',
              title: user.username,
              subtitle: user.email,
              icon: '👤',
              url: `/profile/${user.id}`,
              createdAt: user.createdAt
            });
          });
        }
      } catch (error) {
        console.error('Error searching users:', error);
      }
    }

    // Search Expenses (within user's groups)
    if (types.includes('expenses')) {
      try {
        // Get all groups the user is part of
        const userGroups = await Group.findAll({
          include: [{
            model: User,
            through: { attributes: [] },
            where: { id: userId },
            attributes: ['id']
          }],
          attributes: ['id']
        });

        const groupIds = userGroups.map(group => group.id);

        if (groupIds.length > 0) {
          const expenses = await Expense.findAll({
            include: [
              {
                model: Group,
                where: { id: { [Op.in]: groupIds } },
                attributes: ['id', 'name']
              },
              {
                model: User,
                as: 'paidBy',
                attributes: ['id', 'username']
              }
            ],
            where: {
              description: { [Op.iLike]: `%${searchQuery}%` }
            },
            attributes: ['id', 'description', 'totalAmount', 'date'],
            order: [['createdAt', 'DESC']],
            limit: 10
          });

          expenses.forEach(expense => {
            results.push({
              id: expense.id,
              type: 'expense',
              title: expense.description,
              subtitle: `₹${expense.totalAmount} - ${expense.Group.name}`,
              icon: '💰',
              url: `/group/${expense.Group.id}`,
              createdAt: expense.createdAt,
              metadata: {
                amount: expense.totalAmount,
                groupName: expense.Group.name,
                paidBy: expense.paidBy.username
              }
            });
          });
        }
      } catch (error) {
        console.error('Error searching expenses:', error);
      }
    }

    // Sort results by relevance and recency
    results.sort((a, b) => {
      // Prioritize exact matches
      const aExactMatch = a.title.toLowerCase().includes(searchQuery);
      const bExactMatch = b.title.toLowerCase().includes(searchQuery);
      
      if (aExactMatch && !bExactMatch) return -1;
      if (!aExactMatch && bExactMatch) return 1;
      
      // Then by creation date (newest first)
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.json({
      success: true,
      results: results.slice(0, 20), // Limit to 20 results
      query: searchQuery,
      total: results.length
    });

  } catch (error) {
    console.error('Universal search error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during search'
    });
  }
}
