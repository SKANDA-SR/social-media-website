const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Follow = sequelize.define('Follow', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    followerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    followingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    timestamps: true,
    indexes: [
      {
        fields: ['followerId']
      },
      {
        fields: ['followingId']
      },
      {
        unique: true,
        fields: ['followerId', 'followingId']
      }
    ],
    validate: {
      // Prevent users from following themselves
      notSelfFollow() {
        if (this.followerId === this.followingId) {
          throw new Error('Users cannot follow themselves');
        }
      }
    }
  });

  return Follow;
};