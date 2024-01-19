const { sequelize } = require("./models");

async function start() {
  await sequelize.sync({ alter: true });
}

start();
