const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/settlements', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Get all settlements data for the user
        const settlementsData = await pool.query(`
            SELECT 
                SUM(CASE WHEN balance < 0 THEN balance ELSE 0 END) as total_owed,
                SUM(CASE WHEN balance > 0 THEN balance ELSE 0 END) as total_to_receive,
                COUNT(CASE WHEN balance = 0 THEN 1 END) as settled_groups,
                COUNT(CASE WHEN balance != 0 THEN 1 END) as pending_groups,
                json_agg(
                    json_build_object(
                        'id', g.id,
                        'name', g.name,
                        'description', g.description,
                        'icon', g.icon,
                        'balance', ub.balance
                    )
                ) as groups
            FROM user_balances ub
            JOIN groups g ON g.id = ub.group_id
            WHERE ub.user_id = $1
            GROUP BY ub.user_id
        `, [userId]);

        const data = settlementsData.rows[0] || {
            total_owed: 0,
            total_to_receive: 0,
            settled_groups: 0,
            pending_groups: 0,
            groups: []
        };

        res.json({
            totalOwed: Math.abs(data.total_owed || 0),
            totalToReceive: data.total_to_receive || 0,
            settledGroups: data.settled_groups || 0,
            pendingGroups: data.pending_groups || 0,
            groups: data.groups || []
        });

    } catch (error) {
        console.error('Error fetching settlements:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/settlements/:groupId/settle', auth, async (req, res) => {
    const { groupId } = req.params;
    const userId = req.user.id;

    try {
        await pool.query('BEGIN');
        
        // Mark all expenses as settled for this user in this group
        await pool.query(`
            UPDATE user_balances
            SET is_settled = true
            WHERE user_id = $1 AND group_id = $2
        `, [userId, groupId]);

        await pool.query('COMMIT');
        res.json({ message: 'Settlement completed successfully' });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Error settling up:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;