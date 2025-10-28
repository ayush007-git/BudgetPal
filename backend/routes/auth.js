import express from 'express';
import User from '../models/User.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/auth/signup
// @desc    Register a new user (username + password only)
// @access  Public
router.post('/signup', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    if (username.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Username must be at least 3 characters long'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists'
      });
    }

    // Create new user (without emergency question for now)
    // Emergency question will be set during onboarding
    const user = await User.create({
      username,
      password,
      emergencyQuestion: 'Temporary question - to be set during onboarding',
      emergencyAnswer: 'temporary'
    });

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: {
          id: user.id,
          username: user.username,
          createdAt: user.createdAt
        },
        token
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during signup'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // Find user
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          username: user.username,
          lastLogin: user.lastLogin
        },
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Verify emergency question and reset password
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const { username, emergencyAnswer, newPassword } = req.body;

    // Validation
    if (!username || !emergencyAnswer || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Username, emergency answer, and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Find user
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if emergency question is set (not temporary)
    if (user.emergencyQuestion === 'Temporary question - to be set during onboarding') {
      return res.status(400).json({
        success: false,
        message: 'Emergency question not set. Please complete onboarding first.'
      });
    }

    // Verify emergency answer
    const isEmergencyAnswerValid = await user.compareEmergencyAnswer(emergencyAnswer);
    if (!isEmergencyAnswerValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid emergency answer'
      });
    }

    // Update password
    await user.updatePassword(newPassword);

    res.json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset'
    });
  }
});

// @route   GET /api/auth/emergency-question
// @desc    Get emergency question for a user
// @access  Public
router.get('/emergency-question/:username', async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ 
      where: { username },
      attributes: ['emergencyQuestion']
    });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.emergencyQuestion === 'Temporary question - to be set during onboarding') {
      return res.status(400).json({
        success: false,
        message: 'Emergency question not set. Please complete onboarding first.'
      });
    }

    res.json({
      success: true,
      data: {
        emergencyQuestion: user.emergencyQuestion
      }
    });

  } catch (error) {
    console.error('Get emergency question error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/auth/set-emergency-question
// @desc    Set emergency question and answer (for onboarding)
// @access  Private
router.put('/set-emergency-question', async (req, res) => {
  try {
    const { username, emergencyQuestion, emergencyAnswer } = req.body;

    // Validation
    if (!username || !emergencyQuestion || !emergencyAnswer) {
      return res.status(400).json({
        success: false,
        message: 'Username, emergency question, and answer are required'
      });
    }

    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update emergency question and answer
    user.emergencyQuestion = emergencyQuestion;
    user.emergencyAnswer = emergencyAnswer;
    await user.save();

    res.json({
      success: true,
      message: 'Emergency question set successfully'
    });

  } catch (error) {
    console.error('Set emergency question error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/auth/change-password
// @desc    Change user password (requires current password)
// @access  Private
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    await user.updatePassword(newPassword);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password change'
    });
  }
});

// @route   DELETE /api/auth/delete-account
// @desc    Delete user account and all associated data
// @access  Private
router.delete('/delete-account', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete user (this will cascade delete related data due to foreign key constraints)
    await user.destroy();

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during account deletion'
    });
  }
});

// @route   GET /api/auth/users
// @desc    Get all users except current user (for dropdowns)
// @access  Private
router.get('/users', authenticateToken, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { search } = req.query;

    // Build where clause
    let whereClause = {
      id: { [require('sequelize').Op.ne]: currentUserId } // Exclude current user
    };

    // Add search filter if provided
    if (search && search.trim().length > 0) {
      whereClause.username = { 
        [require('sequelize').Op.iLike]: `%${search.trim()}%` 
      };
    }

    // Fetch users
    const users = await User.findAll({
      where: whereClause,
      attributes: ['id', 'username', 'createdAt'],
      order: [['username', 'ASC']],
      limit: 50 // Limit results for performance
    });

    res.json({
      success: true,
      data: {
        users: users.map(user => ({
          id: user.id,
          username: user.username,
          createdAt: user.createdAt
        }))
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user info
// @access  Private
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId, {
      attributes: ['id', 'username', 'createdAt', 'lastLogin']
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin
        }
      }
    });

  } catch (error) {
    console.error('Get user info error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user info'
    });
  }
});

export default router;
