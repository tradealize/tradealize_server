"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ file }) {
      // define association here
      this.belongsTo(file, { foreignKey: "file_id" });
    }
  }
  user.init(
    {
      user_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      uid: DataTypes.STRING,
      lang: DataTypes.STRING,
      name: DataTypes.STRING,
      last_name: DataTypes.STRING,
      phone: DataTypes.STRING,
      email: DataTypes.STRING,
      api_key: DataTypes.STRING,
      zappier_webhook_url: DataTypes.STRING,
      stripe_id: DataTypes.STRING,
      birthdate: DataTypes.STRING,
      dark_mode: { type: DataTypes.BOOLEAN, defaultValue: false },
      manual_mode: DataTypes.BOOLEAN,
      signup_reason: DataTypes.STRING,
      email_provider: DataTypes.BOOLEAN,
      phone_provider: DataTypes.BOOLEAN,
      device_token: DataTypes.TEXT,
      role: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "user",
      tableName: "user",
      paranoid: true,
    }
  );
  return user;
};
