// Group controller functions

export async function getUserGroups(req, res, next) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    // Import models
    const { default: Group } = await import('../models/group.js');
    const { default: User } = await import('../models/User.js');

    // Get user with their groups
    const user = await User.findByPk(userId, {
      include: [{
        model: Group,
        through: { attributes: [] }, // Don't include junction table data
        attributes: ['id', 'name', 'description', 'createdAt', 'updatedAt']
      }]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Format groups for frontend
    const groups = await Promise.all(user.Groups.map(async group => {
      const members = await group.getUsers();
      const groupId = group.id;
      const { Expense, Debt } = await import('../models/index.js');

       // Find all unpaid debts for this group related to user
       const unpaidDebts = await Debt.findAll({
        where: { status: 'unpaid' },
        include: [
          { model: Expense, required: true, where: { groupId }, attributes: ['id', 'groupId'] },
          { model: User, as: 'Payer', attributes: ['id', 'username'] },
          { model: User, as: 'Debtor', attributes: ['id', 'username'] }
        ]
      });

      let balance = 0;
      for (const debt of unpaidDebts) {
        const amount = Number(debt.amount) || 0;
        const payerId = debt.Payer?.id;
        const debtorId = debt.Debtor?.id;

        if (payerId == null || debtorId == null) continue;

        if(payerId === userId){
          balance += amount
        }
        if(debtorId === userId){
          balance -=amount
        }
      }

      return {
        id: group.id,
        name: group.name,
        description: group.description,
        members: members.length, 
        balance: balance, 
        lastActivity: group.createdAt,
        icon: '👥'
      }
    }));

    res.json({
      success: true,
      data: {
        groups
      }
    });

  } catch (error) {
    console.error('Get user groups error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching groups'
    });
  }
}

export async function createGroup(req, res, next) {
  try {
    const { name, description } = req.body;
    const userId = req.user?.id;

    // Validation
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Group name is required'
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    // Import models
    const { default: Group } = await import('../models/group.js');
    const { default: User } = await import('../models/User.js');

    // Create the group
    const group = await Group.create({
      name: name.trim(),
      description: description?.trim() || null
    });

    // Add the creator as a member
    const user = await User.findByPk(userId);
    if (user) {
      await group.addUser(user);
    }

    res.status(201).json({
      success: true,
      message: 'Group created successfully',
      data: {
        group: {
          id: group.id,
          name: group.name,
          description: group.description,
          createdAt: group.createdAt
        }
      }
    });

  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during group creation'
    });
  }
}

export async function addMemberToGroup(req, res, next) {
  try {
    const { groupId } = req.params;
    const { username } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'Username is required'
      });
    }

    // Import models
    const { default: Group } = await import('../models/group.js');
    const { default: User } = await import('../models/User.js');

    // Find the group
    const group = await Group.findByPk(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Check if current user is a member of the group
    const currentUser = await User.findByPk(userId);
    const isCurrentUserMember = await group.hasUser(currentUser);
    if (!isCurrentUserMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not a member of this group.'
      });
    }

    // Find the user to add
    const userToAdd = await User.findOne({ where: { username } });
    if (!userToAdd) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is already a member
    const isAlreadyMember = await group.hasUser(userToAdd);
    if (isAlreadyMember) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this group'
      });
    }

    // Add user to group
    await group.addUser(userToAdd);

    res.json({
      success: true,
      message: 'User added to group successfully',
      data: {
        user: {
          id: userToAdd.id,
          username: userToAdd.username
        }
      }
    });

  } catch (error) {
    console.error('Add member to group error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding member to group'
    });
  }
}

export async function getGroupDetails(req, res, next) {
  try {
    const { groupId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    // Import models
    const { default: Group } = await import('../models/group.js');
    const { default: User } = await import('../models/User.js');
    const { default: Expense } = await import('../models/expense.js');

    // Get group with members and expenses
    const group = await Group.findByPk(groupId, {
      include: [
        {
          model: User,
          through: { attributes: [] },
          attributes: ['id', 'username']
        },
        {
          model: Expense,
          include: [
            {
              model: User,
              as: 'paidBy',
              attributes: ['id', 'username']
            }
          ],
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Check if user is a member of the group
    const isMember = group.Users.some(user => user.id === userId);
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not a member of this group.'
      });
    }

    // Format response
    const formattedGroup = {
      id: group.id,
      name: group.name,
      description: group.description,
      members: group.Users.map(user => ({
        id: user.id,
        username: user.username
      })),
      expenses: group.Expenses.map(expense => ({
        id: expense.id,
        description: expense.description,
        totalAmount: expense.totalAmount,
        screenshotUrl: expense.screenshotUrl,
        date: expense.date,
        paidBy: expense.paidBy
      })),
      createdAt: group.createdAt
    };

    res.json({
      success: true,
      data: {
        group: formattedGroup
      }
    });

  } catch (error) {
    console.error('Get group details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching group details'
    });
  }
}

export async function calculateGroupBalance(req, res, next) {
  try {
    const { groupId } = req.params;
    if (!groupId) {
      return res.status(400).json({ message: 'groupId is required' });
    }

    const { Group, User, Expense, Debt } = await import('../models/index.js');

    // Load group and members
    const group = await Group.findByPk(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    const members = await group.getUsers({ attributes: ['id', 'username'] });
    if (!members || members.length === 0) {
      return res.status(400).json({ message: 'Group has no members' });
    }

    // Find all unpaid debts for this group
    const unpaidDebts = await Debt.findAll({
      where: { status: 'unpaid' },
      include: [
        { model: Expense, required: true, where: { groupId }, attributes: ['id', 'groupId'] },
        { model: User, as: 'Payer', attributes: ['id', 'username'] },
        { model: User, as: 'Debtor', attributes: ['id', 'username'] }
      ]
    });

    console.log(`Found ${unpaidDebts.length} unpaid debts for group ${groupId}`);

    // Initialize balances for all members
    const userIdToBalance = new Map();
    for (const member of members) {
      userIdToBalance.set(String(member.id), { user: member, balance: 0 });
    }

    // Apply debts: debtor pays payer
    for (const debt of unpaidDebts) {
      const amount = Number(debt.amount) || 0;
      const payerId = debt.Payer?.id;
      const debtorId = debt.Debtor?.id;
      if (payerId == null || debtorId == null) continue;
      const payerKey = String(payerId);
      const debtorKey = String(debtorId);
      if (!userIdToBalance.has(payerKey) || !userIdToBalance.has(debtorKey)) continue;
      userIdToBalance.get(payerKey).balance += amount;
      userIdToBalance.get(debtorKey).balance -= amount;
    }

    // Split into creditors and debtors
    const creditors = [];
    const debtors = [];
    for (const { user, balance } of userIdToBalance.values()) {
      if (balance > 1e-9) creditors.push({ user, balance });
      else if (balance < -1e-9) debtors.push({ user, balance });
    }

    // Sort initial lists
    creditors.sort((a, b) => b.balance - a.balance); // descending
    debtors.sort((a, b) => a.balance - b.balance);   // ascending (most negative first)

    const settlements = [];

    // Greedy settlement
    let i = 0; // debtor index
    let j = 0; // creditor index
    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      const payment = Math.min(creditor.balance, Math.abs(debtor.balance));

      if (payment > 0) {
        settlements.push({ 
          from: debtor.user.username, 
          to: creditor.user.username, 
          amount: payment,
          debtorId: debtor.user.id,
          creditorId: creditor.user.id
        });
        debtor.balance += payment; // debtor balance is negative
        creditor.balance -= payment;
      }

      if (Math.abs(debtor.balance) <= 1e-9) i += 1; // debtor settled
      if (Math.abs(creditor.balance) <= 1e-9) j += 1; // creditor settled
    }

    return res.status(200).json(settlements);
  } catch (error) {
    next(error);
  }
}

export async function markDebtAsPaid(req, res, next) {
  try {
    const { groupId } = req.params;
    const { debtorId, creditorId, amount } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    if (!debtorId || !creditorId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'debtorId, creditorId, and amount are required'
      });
    }

    // Import models
    const { default: Group } = await import('../models/group.js');
    const { default: Debt } = await import('../models/debt.js');
    const { default: Expense } = await import('../models/expense.js');

    // Verify user is a member of the group
    const group = await Group.findByPk(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    const members = await group.getUsers();
    const isMember = members.some(member => member.id === userId);
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not a member of this group.'
      });
    }

    // Find and mark relevant debts as paid
    // We'll mark debts up to the specified amount
    const debts = await Debt.findAll({
      where: {
        status: 'unpaid',
        debtorUserId: debtorId,
        payerUserId: creditorId
      },
      include: [{
        model: Expense,
        where: { groupId },
        attributes: ['id']
      }],
      order: [['createdAt', 'ASC']] // Mark oldest debts first
    });

    console.log(`Looking for debts: debtorId=${debtorId}, creditorId=${creditorId}, groupId=${groupId}`);
    console.log(`Found ${debts.length} matching debts`);

    if (debts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No matching debts found'
      });
    }

    // Calculate total amount of unpaid debts
    const totalDebtAmount = debts.reduce((sum, debt) => sum + parseFloat(debt.amount), 0);
    
    if (totalDebtAmount < parseFloat(amount)) {
      return res.status(400).json({
        success: false,
        message: `Total debt amount (₹${totalDebtAmount.toFixed(2)}) is less than requested payment amount (₹${parseFloat(amount).toFixed(2)})`
      });
    }

    // Mark debts as resolved, starting with the oldest
    let remainingAmount = parseFloat(amount);
    const debtsToMark = [];
    
    for (const debt of debts) {
      if (remainingAmount <= 0) break;
      
      const debtAmount = parseFloat(debt.amount);
      if (debtAmount <= remainingAmount) {
        debtsToMark.push(debt.id);
        remainingAmount -= debtAmount;
      }
    }

    if (debtsToMark.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No debts can be marked as paid with the specified amount'
      });
    }

    // Mark selected debts as resolved
    await Debt.update(
      { status: 'resolved' },
      {
        where: {
          id: debtsToMark
        }
      }
    );

    res.json({
      success: true,
      message: `Successfully marked ${debtsToMark.length} debt(s) as paid`,
      data: {
        markedDebts: debtsToMark.length,
        totalAmount: parseFloat(amount) - remainingAmount
      }
    });

  } catch (error) {
    console.error('Mark debt as paid error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while marking debt as paid'
    });
  }
}
  