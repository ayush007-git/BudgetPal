import express from 'express';
import { Op } from 'sequelize';
import User from '../models/User.js';

const router = express.Router();

// @route   DELETE /api/database/clear
// @desc    Clear all data from the database (for testing purposes)
// @access  Public (WARNING: This should be restricted in production)
router.delete('/clear', async (req, res) => {
  try {
    // Clear all users from the database
    const deletedCount = await User.destroy({
      where: {},
      truncate: true
    });
    
    res.json({
      success: true,
      message: 'Database cleared successfully',
      data: {
        deletedCount,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Database clear error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during database clear'
    });
  }
});

// @route   GET /api/database/stats
// @desc    Get database statistics
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.count();
    const recentUsers = await User.count({
      where: {
        createdAt: {
          [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        recentUsers,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Database stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during database stats retrieval'
    });
  }
});

// @route   GET /api/database/users
// @desc    Get all users (for testing purposes)
// @access  Public (WARNING: This should be restricted in production)
router.get('/users', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password', 'emergencyAnswer'] }
    });
    
    res.json({
      success: true,
      data: {
        users,
        count: users.length
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during users retrieval'
    });
  }
});

export default router;
