"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class conversation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ user, message }) {
      // define association here
      this.belongsTo(user, { foreignKey: "user_id" });
      this.hasMany(message, { foreignKey: "conversation_id" });
    }
  }
  conversation.init(
    {
      conversation_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: DataTypes.STRING,
      tags: DataTypes.TEXT,
      archived: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    {
      sequelize,
      modelName: "conversation",
      tableName: "conversation",
      paranoid: true,
    }
  );
  return conversation;
};
