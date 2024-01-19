const express = require("express");
const {
  getConversations,
  createConversation,
  updateConversation,
  deleteConversation,
  getSingleConversation,
  getAllTags,
} = require("../controllers/conversations");
const { token, fbAuth } = require("../middleware/auth");
const { userAuth } = require("../middleware/user");
const router = express.Router();

router.get("/", [token, fbAuth, userAuth], getConversations);

router.get("/tags", [token, fbAuth, userAuth], getAllTags);

router.get(
  "/single/:conversation_id",
  [token, fbAuth, userAuth],
  getSingleConversation
);

router.post("/", [token, fbAuth, userAuth], createConversation);

router.put("/", [token, fbAuth, userAuth], updateConversation);

router.delete(
  "/:conversation_id",
  [token, fbAuth, userAuth],
  deleteConversation
);

module.exports = router;
