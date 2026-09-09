const Comment = require("../models/Comment");
const Post = require("../models/Post");
const Notification = require("../models/Notification");
const createComment = async (req, res) => {
    try {
        const { content } = req.body;
        const { postId } = req.params;

        if (!content || content.trim() === "") {
            return res.status(400).json({
                message: "Comment content is required"
            });
        }

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        const comment = await Comment.create({
            user: req.userId,
            post: postId,
            content: content.trim()
        });

        if (post.user.toString() !== req.userId) {
    await Notification.create({
        recipient: post.user,
        sender: req.userId,
        type: "comment",
        post: postId,
        comment: comment._id
    });
}

        const populatedComment = await Comment
            .findById(comment._id)
            .populate("user", "username profilePicture");

        res.status(201).json({
            message: "Comment added successfully",
            comment: populatedComment
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

const getComments = async (req, res) => {
    try {
        const { postId } = req.params;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        const comments = await Comment.find({ post: postId })
            .populate("user", "username profilePicture")
            .sort({ createdAt: -1 });

        res.status(200).json(comments);

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

const deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);

        if (!comment) {
            return res.status(404).json({
                message: "Comment not found"
            });
        }

        // Only the comment owner can delete it
        if (comment.user.toString() !== req.userId) {
            return res.status(403).json({
                message: "You are not allowed to delete this comment"
            });
        }

        await comment.deleteOne();

        res.status(200).json({
            message: "Comment deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

const updateComment = async (req, res) => {
    try {
        const { content } = req.body;

        if (!content || content.trim() === "") {
            return res.status(400).json({
                message: "Comment content is required"
            });
        }

        const comment = await Comment.findById(req.params.commentId);

        if (!comment) {
            return res.status(404).json({
                message: "Comment not found"
            });
        }

        // Only the comment owner can edit it
        if (comment.user.toString() !== req.userId) {
            return res.status(403).json({
                message: "You are not allowed to update this comment"
            });
        }

        comment.content = content.trim();

        await comment.save();

        const updatedComment = await Comment
            .findById(comment._id)
            .populate("user", "username profilePicture");

        res.status(200).json({
            message: "Comment updated successfully",
            comment: updatedComment
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

module.exports = {
    createComment,
    getComments,
    deleteComment,
    updateComment
};