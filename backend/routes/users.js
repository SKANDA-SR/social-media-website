const express = require('express');
const { User, Post, Follow } = require('../models/index');
const { authenticateToken } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// Get user profile by ID or username
router.get('/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    
    // Check if identifier is numeric (ID) or string (username)
    const whereCondition = isNaN(identifier) 
      ? { username: identifier }
      : { id: parseInt(identifier) };

    const user = await User.findOne({
      where: { ...whereCondition, isActive: true },
      include: [
        {
          model: Post,
          as: 'posts',
          where: { isActive: true },
          required: false,
          order: [['createdAt', 'DESC']],
          limit: 10
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get follower and following counts
    const followersCount = await Follow.count({
      where: { followingId: user.id }
    });
    const followingCount = await Follow.count({
      where: { followerId: user.id }
    });

    res.json({
      user: {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        bio: user.bio,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt,
        followersCount,
        followingCount,
        posts: user.posts
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

// Update user profile (authenticated)
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, bio, profilePicture } = req.body;
    
    await req.user.update({
      firstName: firstName || req.user.firstName,
      lastName: lastName || req.user.lastName,
      bio: bio !== undefined ? bio : req.user.bio,
      profilePicture: profilePicture || req.user.profilePicture
    });

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        bio: req.user.bio,
        profilePicture: req.user.profilePicture
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Search users
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const limit = parseInt(req.query.limit) || 20;

    const users = await User.findAll({
      where: {
        isActive: true,
        [Op.or]: [
          { username: { [Op.like]: `%${query}%` } },
          { firstName: { [Op.like]: `%${query}%` } },
          { lastName: { [Op.like]: `%${query}%` } }
        ]
      },
      attributes: ['id', 'username', 'firstName', 'lastName', 'bio', 'profilePicture'],
      limit
    });

    res.json({ users });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

// Get all users (for discovery)
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    const users = await User.findAll({
      where: { isActive: true },
      attributes: ['id', 'username', 'firstName', 'lastName', 'bio', 'profilePicture'],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

module.exports = router;