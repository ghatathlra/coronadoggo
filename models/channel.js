'use strict';
module.exports = (sequelize, DataTypes) => {
  const Channel = sequelize.define('Channel', {
    channel_name: {type: DataTypes.STRING, unique: true, allowNull: false},
    password: {type: DataTypes.STRING, allowNull: false},
  }, {});
  Channel.associate = function(models) {
    // associations can be defined here
  };
  return Channel;
};