const User = require("../models/User");
const Post = require("../models/Post");
const Notification = require("../models/Notification");


// GET LOGGED-IN USER PROFILE

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.status(200).json(user);

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};


// GET ANY USER PROFILE

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select("-password")
      .populate("followers", "username profilePicture")
      .populate("following", "username profilePicture");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const posts = await Post.find({
      user: user._id
    })
      .populate("user", "username profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).json({
      user,
      posts
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};


// FOLLOW / UNFOLLOW

const toggleFollow = async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const currentUserId = req.userId;

    if (targetUserId === currentUserId) {
      return res.status(400).json({
        message: "You cannot follow yourself"
      });
    }

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!currentUser || !targetUser) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const alreadyFollowing = currentUser.following.some(
      (id) => id.toString() === targetUserId
    );

    if (alreadyFollowing) {

      currentUser.following = currentUser.following.filter(
        (id) => id.toString() !== targetUserId
      );

      targetUser.followers = targetUser.followers.filter(
        (id) => id.toString() !== currentUserId
      );

      await currentUser.save();
      await targetUser.save();

      return res.status(200).json({
        message: "User unfollowed",
        following: false
      });
    }

    currentUser.following.push(targetUserId);
    targetUser.followers.push(currentUserId);

    await currentUser.save();
    await targetUser.save();

    await Notification.create({
      recipient: targetUserId,
      sender: currentUserId,
      type: "follow"
    });

    res.status(200).json({
      message: "User followed",
      following: true
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};


module.exports = {
  getProfile,
  getUserById,
  toggleFollow
};