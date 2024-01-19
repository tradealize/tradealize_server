const express = require("express");
const router = express.Router();
const files = require("./files");
const users = require("./users");
const messages = require("./messages");
const appconfig = require("./appconfig");
const conversations = require("./conversations");

module.exports = function (base_url, app) {
  router.use("/conversations", conversations);
  router.use("/appconfig", appconfig);
  router.use("/messages", messages);
  router.use("/files", files);
  router.use("/users", users);
  app.use(base_url, router);
};
