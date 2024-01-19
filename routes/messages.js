const express = require("express");
const {
  getConversationMessages,
  createMessage,
  updateMessage,
  getMessages,
} = require("../controllers/messages");
const { token, fbAuth } = require("../middleware/auth");
const { userAuth } = require("../middleware/user");
const router = express.Router();

router.get(
  "/conversation/:conversation_id",
  [token, fbAuth, userAuth],
  getConversationMessages
);

router.get("/", [token, fbAuth, userAuth], getMessages);

router.post("/", [token, fbAuth, userAuth], createMessage);

router.put("/", [token, fbAuth, userAuth], updateMessage);

module.exports = router;
