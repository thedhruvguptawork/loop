const express = require("express");

const protect = require("../middleware/authMiddleware");
const { createComment , getComments , deleteComment, updateComment} = require("../controllers/commentController");

const router = express.Router();

router.post("/:postId", protect, createComment);
router.get("/:postId", protect, getComments);
router.put("/:commentId", protect, updateComment);

router.delete("/:commentId", protect, deleteComment);


module.exports = router;