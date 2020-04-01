'use strict';
module.exports = (sequelize, DataTypes) => {
  const Subscription = sequelize.define('Subscription', {
    channel_name: {type: DataTypes.STRING, allowNull: false, references: {model: 'Channels', key: 'channel_name'}},
    chat_id: {type: DataTypes.BIGINT, allowNull: false}
  }, {});
  Subscription.associate = function(models) {
    // associations can be defined here
  };
  return Subscription;
};