const express = require("express");

const protect = require("../middleware/authMiddleware");
const { getProfile ,toggleFollow , getUserById} = require("../controllers/userController");

const router = express.Router();

router.get("/profile", protect, getProfile);
router.get("/:userId", protect, getUserById);
router.put("/:userId/follow", protect, toggleFollow);

module.exports = router;