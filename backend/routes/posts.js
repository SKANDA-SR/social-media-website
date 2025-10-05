const express = require('express');
const { Post, Comment, User, Follow } = require('../models/index');
const { authenticateToken } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// Get all posts (feed)
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    const posts = await Post.findAll({
      where: { isActive: true },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'firstName', 'lastName', 'profilePicture']
        },
        {
          model: Comment,
          as: 'comments',
          where: { isActive: true },
          required: false,
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'username', 'firstName', 'lastName']
            }
          ],
          order: [['createdAt', 'ASC']],
          limit: 5 // Show only first 5 comments
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    res.json({ posts });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Failed to get posts' });
  }
});

// Get posts from followed users (authenticated feed)
router.get('/feed', authenticateToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    // Get list of users the current user follows
    const following = await Follow.findAll({
      where: { followerId: req.user.id },
      attributes: ['followingId']
    });

    const followingIds = following.map(f => f.followingId);
    followingIds.push(req.user.id); // Include own posts

    const posts = await Post.findAll({
      where: { 
        isActive: true,
        userId: { [Op.in]: followingIds }
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'firstName', 'lastName', 'profilePicture']
        },
        {
          model: Comment,
          as: 'comments',
          where: { isActive: true },
          required: false,
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'username', 'firstName', 'lastName']
            }
          ],
          order: [['createdAt', 'ASC']],
          limit: 5
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    res.json({ posts });
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({ error: 'Failed to get feed' });
  }
});

// Get single post by ID
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findOne({
      where: { id: req.params.id, isActive: true },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'firstName', 'lastName', 'profilePicture']
        },
        {
          model: Comment,
          as: 'comments',
          where: { isActive: true },
          required: false,
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'username', 'firstName', 'lastName']
            }
          ],
          order: [['createdAt', 'ASC']]
        }
      ]
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({ post });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ error: 'Failed to get post' });
  }
});

// Create a new post
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { content, imageUrl } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Post content is required' });
    }

    const post = await Post.create({
      content: content.trim(),
      imageUrl: imageUrl || null,
      userId: req.user.id
    });

    // Fetch the post with author information
    const postWithAuthor = await Post.findByPk(post.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'firstName', 'lastName', 'profilePicture']
        }
      ]
    });

    res.status(201).json({
      message: 'Post created successfully',
      post: postWithAuthor
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Update a post
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { content, imageUrl } = req.body;
    
    const post = await Post.findOne({
      where: { id: req.params.id, userId: req.user.id, isActive: true }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found or unauthorized' });
    }

    await post.update({
      content: content || post.content,
      imageUrl: imageUrl !== undefined ? imageUrl : post.imageUrl
    });

    const updatedPost = await Post.findByPk(post.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'firstName', 'lastName', 'profilePicture']
        }
      ]
    });

    res.json({
      message: 'Post updated successfully',
      post: updatedPost
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// Delete a post
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findOne({
      where: { id: req.params.id, userId: req.user.id, isActive: true }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found or unauthorized' });
    }

    await post.update({ isActive: false });

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// Like/Unlike a post
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findOne({
      where: { id: req.params.id, isActive: true }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Simple like system - increment/decrement likes
    // In a real app, you'd have a separate likes table to track who liked what
    const newLikes = post.likes + 1;
    await post.update({ likes: newLikes });

    res.json({
      message: 'Post liked successfully',
      likes: newLikes
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ error: 'Failed to like post' });
  }
});

// Add comment to post
router.post('/:id/comments', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    const post = await Post.findOne({
      where: { id: req.params.id, isActive: true }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comment = await Comment.create({
      content: content.trim(),
      userId: req.user.id,
      postId: post.id
    });

    const commentWithAuthor = await Comment.findByPk(comment.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'firstName', 'lastName']
        }
      ]
    });

    res.status(201).json({
      message: 'Comment added successfully',
      comment: commentWithAuthor
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Delete a comment
router.delete('/:postId/comments/:commentId', authenticateToken, async (req, res) => {
  try {
    const comment = await Comment.findOne({
      where: { 
        id: req.params.commentId, 
        postId: req.params.postId,
        userId: req.user.id,
        isActive: true 
      }
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found or unauthorized' });
    }

    await comment.update({ isActive: false });

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

module.exports = router;