const express = require("express");
const {
  getUserByUid,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  getResetPasswordLink,
  getUserByPhone,
  updateUserAdmin,
  getUserByEmail,
  giveAccess,
  createUserNoSignUp,
} = require("../controllers/users");
const { token, fbAuth } = require("../middleware/auth");
const { userAuth } = require("../middleware/user");
const { staffAuth, isAdmin } = require("../middleware/staff");
const router = express.Router();

/**
 * User
 */

router.get("/", [token, fbAuth, userAuth], getUserByUid);

router.get("/phone", getUserByPhone);

router.post("/", createUser);

router.post("/resetPasswordLink", getResetPasswordLink);

router.put("/", [token, fbAuth, userAuth], updateUser);

/**
 * Admin
 */

router.get("/admin/all", [token, fbAuth, staffAuth], getAllUsers);

router.get("/admin/email", [token, fbAuth, staffAuth], getUserByEmail);

router.get("/:user_id/admin", [token, fbAuth, staffAuth], getUserById);

router.put("/admin", [token, fbAuth, staffAuth], updateUserAdmin);

router.post("/giveAccess", [token, fbAuth, staffAuth, isAdmin], giveAccess);

router.post(
  "/admin/user",
  [token, fbAuth, staffAuth, isAdmin],
  createUserNoSignUp
);

router.post("/resetPasswordLink", [token], getResetPasswordLink);

module.exports = router;
