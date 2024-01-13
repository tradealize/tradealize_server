const express = require("express");
const router = express.Router();
const files = require("./files");
const users = require("./users");

module.exports = function (base_url, app) {
  router.use("/files", files);
  router.use("/users", users);
  app.use(base_url, router);
};
