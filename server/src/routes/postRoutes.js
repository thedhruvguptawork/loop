const express = require("express");

const protect = require("../middleware/authMiddleware");
const { createPost , getPosts , deletePost , updatePost, toggleLike, getFeed} = require("../controllers/postController");

const router = express.Router();

router.post("/", protect, createPost);
router.get("/feed", protect, getFeed);
router.get("/", protect, getPosts);
router.delete("/:id", protect, deletePost);
router.put("/:id", protect, updatePost);
router.put("/:id/like", protect, toggleLike);

module.exports = router;