const express = require("express");
const {
  getUserByUid,
  createUser,
  updateUser,
  getResetPasswordLink,
  getUserByPhone,
} = require("../controllers/users");
const { token, fbAuth } = require("../middleware/auth");
const { userAuth } = require("../middleware/user");
const router = express.Router();

/**
 * User
 */

router.get("/", [token, fbAuth, userAuth], getUserByUid);

router.get("/phone", getUserByPhone);

router.post("/", createUser);

router.post("/resetPasswordLink", getResetPasswordLink);

router.put("/", [token, fbAuth, userAuth], updateUser);

router.post("/resetPasswordLink", [token], getResetPasswordLink);

module.exports = router;
