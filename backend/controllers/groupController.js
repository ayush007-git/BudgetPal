// Placeholder async controller functions for group routes

export async function createGroup(req, res, next) {
  try {
    res.status(501).json({ message: 'Not implemented' });
  } catch (error) {
    next(error);
  }
}

export async function addMemberToGroup(req, res, next) {
  try {
    res.status(501).json({ message: 'Not implemented' });
  } catch (error) {
    next(error);
  }
}

export async function getGroupDetails(req, res, next) {
  try {
    res.status(501).json({ message: 'Not implemented' });
  } catch (error) {
    next(error);
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
    const members = await group.getUsers({ attributes: ['id', 'name'] });
    if (!members || members.length === 0) {
      return res.status(400).json({ message: 'Group has no members' });
    }

    // Find all unpaid debts for this group
    const unpaidDebts = await Debt.findAll({
      where: { status: 'unpaid' },
      include: [
        { model: Expense, required: true, where: { groupId }, attributes: ['id', 'groupId'] },
        { model: User, as: 'Payer', attributes: ['id', 'name'] },
        { model: User, as: 'Debtor', attributes: ['id', 'name'] }
      ]
    });

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
        settlements.push({ from: debtor.user.name, to: creditor.user.name, amount: payment });
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


