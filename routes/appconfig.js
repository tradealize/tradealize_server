const express = require("express");
const router = express.Router();
const { token, fbAuth } = require("../middleware/auth");
const { getAppConfig, updateAppConfig } = require("../controllers/appconfig");

router.get("/", getAppConfig);

router.put("/", [token, fbAuth], updateAppConfig);

module.exports = router;
