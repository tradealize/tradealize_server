const express = require("express");
const { getFile, createFile } = require("../controllers/files");
const { token, fbAuth } = require("../middleware/auth");
const { uploadSingleFile } = require("../middleware/aws-bucket");
const router = express.Router();

router.get("/:file_id", getFile);

router.post("/", [token, fbAuth], uploadSingleFile, createFile);

module.exports = router;
