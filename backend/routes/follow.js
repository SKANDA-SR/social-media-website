const express = require('express');
const { Follow, User } = require('../models/index');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Follow a user
router.post('/:userId', authenticateToken, async (req, res) => {
  try {
    const followingId = parseInt(req.params.userId);
    const followerId = req.user.id;

    // Check if user is trying to follow themselves
    if (followerId === followingId) {
      return res.status(400).json({ error: 'You cannot follow yourself' });
    }

    // Check if user to follow exists
    const userToFollow = await User.findOne({
      where: { id: followingId, isActive: true }
    });

    if (!userToFollow) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already following
    const existingFollow = await Follow.findOne({
      where: { followerId, followingId }
    });

    if (existingFollow) {
      return res.status(400).json({ error: 'You are already following this user' });
    }

    // Create follow relationship
    await Follow.create({ followerId, followingId });

    res.status(201).json({
      message: `You are now following ${userToFollow.username}`,
      following: {
        id: userToFollow.id,
        username: userToFollow.username,
        firstName: userToFollow.firstName,
        lastName: userToFollow.lastName
      }
    });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ error: 'Failed to follow user' });
  }
});

// Unfollow a user
router.delete('/:userId', authenticateToken, async (req, res) => {
  try {
    const followingId = parseInt(req.params.userId);
    const followerId = req.user.id;

    // Find and remove follow relationship
    const follow = await Follow.findOne({
      where: { followerId, followingId }
    });

    if (!follow) {
      return res.status(404).json({ error: 'You are not following this user' });
    }

    await follow.destroy();

    // Get user info for response
    const user = await User.findByPk(followingId);

    res.json({
      message: `You have unfollowed ${user ? user.username : 'user'}`,
      unfollowed: followingId
    });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({ error: 'Failed to unfollow user' });
  }
});

// Get followers of a user
router.get('/:userId/followers', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    // Check if user exists
    const user = await User.findOne({
      where: { id: userId, isActive: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const followers = await Follow.findAll({
      where: { followingId: userId },
      include: [
        {
          model: User,
          as: 'followerUser',
          attributes: ['id', 'username', 'firstName', 'lastName', 'profilePicture'],
          where: { isActive: true }
        }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    const followersList = followers.map(follow => follow.followerUser);

    res.json({
      userId,
      followers: followersList,
      count: followersList.length
    });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ error: 'Failed to get followers' });
  }
});

// Get users that a user is following
router.get('/:userId/following', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    // Check if user exists
    const user = await User.findOne({
      where: { id: userId, isActive: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const following = await Follow.findAll({
      where: { followerId: userId },
      include: [
        {
          model: User,
          as: 'followingUser',
          attributes: ['id', 'username', 'firstName', 'lastName', 'profilePicture'],
          where: { isActive: true }
        }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    const followingList = following.map(follow => follow.followingUser);

    res.json({
      userId,
      following: followingList,
      count: followingList.length
    });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ error: 'Failed to get following' });
  }
});

// Check if current user is following a specific user
router.get('/:userId/status', authenticateToken, async (req, res) => {
  try {
    const followingId = parseInt(req.params.userId);
    const followerId = req.user.id;

    const isFollowing = await Follow.findOne({
      where: { followerId, followingId }
    });

    res.json({
      userId: followingId,
      isFollowing: !!isFollowing
    });
  } catch (error) {
    console.error('Check follow status error:', error);
    res.status(500).json({ error: 'Failed to check follow status' });
  }
});

// Get mutual followers (users who follow each other)
router.get('/:userId/mutual', authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const currentUserId = req.user.id;

    // Get users that both current user and specified user follow
    const currentUserFollowing = await Follow.findAll({
      where: { followerId: currentUserId },
      attributes: ['followingId']
    });

    const userFollowing = await Follow.findAll({
      where: { followerId: userId },
      attributes: ['followingId']
    });

    const currentUserFollowingIds = currentUserFollowing.map(f => f.followingId);
    const userFollowingIds = userFollowing.map(f => f.followingId);

    // Find mutual follows
    const mutualIds = currentUserFollowingIds.filter(id => 
      userFollowingIds.includes(id)
    );

    const mutualUsers = await User.findAll({
      where: { 
        id: mutualIds,
        isActive: true 
      },
      attributes: ['id', 'username', 'firstName', 'lastName', 'profilePicture'],
      limit: 10
    });

    res.json({
      userId,
      mutualFollowers: mutualUsers,
      count: mutualUsers.length
    });
  } catch (error) {
    console.error('Get mutual followers error:', error);
    res.status(500).json({ error: 'Failed to get mutual followers' });
  }
});

module.exports = router;