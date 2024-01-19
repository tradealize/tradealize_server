"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class message extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ file, user, conversation }) {
      // define association here
      this.belongsTo(file, { foreignKey: "file_id" });
      this.belongsTo(user, { foreignKey: "user_id" });
      this.belongsTo(conversation, { foreignKey: "conversation_id" });
    }
  }
  message.init(
    {
      message_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      role: DataTypes.STRING,
      content: DataTypes.TEXT,
      max_tokens: DataTypes.INTEGER,
      used_tokens: DataTypes.INTEGER,
      finish_reason: DataTypes.STRING,
      used_prompt_tokens: DataTypes.INTEGER,
      used_completion_tokens: DataTypes.INTEGER,
      openai_message_id: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "message",
      tableName: "message",
      paranoid: true,
    }
  );
  return message;
};
