const { Sequelize } = require('sequelize');
const path = require('path');

// Initialize SQLite database
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../database.sqlite'),
  logging: false
});

// Import models
const User = require('./User')(sequelize);
const Post = require('./Post')(sequelize);
const Comment = require('./Comment')(sequelize);
const Follow = require('./Follow')(sequelize);

// Define associations
// User has many Posts
User.hasMany(Post, {
  foreignKey: 'userId',
  as: 'posts'
});
Post.belongsTo(User, {
  foreignKey: 'userId',
  as: 'author'
});

// User has many Comments
User.hasMany(Comment, {
  foreignKey: 'userId',
  as: 'comments'
});
Comment.belongsTo(User, {
  foreignKey: 'userId',
  as: 'author'
});

// Post has many Comments
Post.hasMany(Comment, {
  foreignKey: 'postId',
  as: 'comments'
});
Comment.belongsTo(Post, {
  foreignKey: 'postId',
  as: 'post'
});

// Follow relationships (many-to-many through Follow table)
User.belongsToMany(User, {
  through: Follow,
  as: 'Following',
  foreignKey: 'followerId',
  otherKey: 'followingId'
});

User.belongsToMany(User, {
  through: Follow,
  as: 'Followers',
  foreignKey: 'followingId',
  otherKey: 'followerId'
});

// Direct associations for Follow table
Follow.belongsTo(User, {
  foreignKey: 'followerId',
  as: 'followerUser'
});

Follow.belongsTo(User, {
  foreignKey: 'followingId',
  as: 'followingUser'
});

// Export models and sequelize instance
module.exports = {
  sequelize,
  User,
  Post,
  Comment,
  Follow
};