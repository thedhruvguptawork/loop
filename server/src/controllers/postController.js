const Post = require("../models/Post");
const User = require("../models/User");
const Notification = require("../models/Notification");
const createPost = async (req, res) => {
    try {
        const { content, image } = req.body;

        if (!content || content.trim() === "") {
            return res.status(400).json({
                message: "Post content is required"
            });
        }

        const post = await Post.create({
            user: req.userId,
            content,
            image: image || ""
        });

        res.status(201).json({
            message: "Post created successfully",
            post
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

const getPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate("user", "username profilePicture")
            .sort({ createdAt: -1 });//Put newest at 1

        res.status(200).json(posts);

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        // Check if the logged-in user owns the post
        if (post.user.toString() !== req.userId) {
            return res.status(403).json({
                message: "You are not allowed to delete this post"
            });
        }

        await post.deleteOne();

        res.status(200).json({
            message: "Post deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

const updatePost = async (req, res) => {
    try {
        const { content } = req.body;

        if (!content || content.trim() === "") {
            return res.status(400).json({
                message: "Post content is required"
            });
        }

        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        // Only the owner can update the post
        if (post.user.toString() !== req.userId) {
            return res.status(403).json({
                message: "You are not allowed to update this post"
            });
        }

        post.content = content.trim();

        await post.save();

        res.status(200).json({
            message: "Post updated successfully",
            post
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

const toggleLike = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        const userId = req.userId;

        const alreadyLiked = post.likes.some(
            (id) => id.toString() === userId
        );

        if (alreadyLiked) {
            // Unlike
            post.likes = post.likes.filter(
                (id) => id.toString() !== userId
            );
        } else {
            // Like
            post.likes.push(userId);
            if (post.user.toString() !== userId) {
    await Notification.create({
        recipient: post.user,
        sender: userId,
        type: "like",
        post: post._id
    });
}
        }

        await post.save();

        res.status(200).json({
            message: alreadyLiked
                ? "Post unliked"
                : "Post liked",
            likesCount: post.likes.length,
            liked: !alreadyLiked
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

const getFeed = async (req, res) => {
    try {
        const currentUser = await User.findById(req.userId);

        if (!currentUser) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Include the current user + people they follow
        const userIds = [
            currentUser._id,
            ...currentUser.following
        ];

        const posts = await Post.find({
            user: { $in: userIds }
        })
            .populate("user", "username profilePicture")
            .sort({ createdAt: -1 });

        res.status(200).json(posts);

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

module.exports = {
    createPost,
    getPosts,
    deletePost,
    updatePost,
    toggleLike,
    getFeed
};



