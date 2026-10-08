import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./Profile.css";
import { API_URL } from "../services/api";

function Profile() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const savedUser = localStorage.getItem("user");

  const currentUser = savedUser
    ? JSON.parse(savedUser)
    : null;

  const currentUserId = (currentUser?.id || currentUser?._id)?.toString();
  const isOwnProfile = currentUserId === userId?.toString();

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetchProfile();
  }, [userId, token, navigate]);

  const getAuthConfig = () => ({
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_URL}/users/${userId}`,
        getAuthConfig()
      );

      const { user, posts } = response.data;

      setProfile(user);
      // Strictly set posts belonging to this profile user only
      setPosts(posts || []);

      const isFollowing = (user.followers || []).some(
        (follower) =>
          (follower?._id || follower)?.toString() === currentUserId
      );

      setFollowing(isFollowing);

    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      setError(
        error.response?.data?.message ||
        "Unable to load profile."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      setFollowLoading(true);
      setError("");

      const response = await axios.put(
        `${API_URL}/users/${userId}/follow`,
        {},
        getAuthConfig()
      );

      setFollowing(response.data.following);

      setProfile((currentProfile) => {
        if (!currentProfile) return currentProfile;

        const followers = currentProfile.followers || [];

        if (response.data.following) {
          return {
            ...currentProfile,
            followers: [
              ...followers,
              {
                _id: currentUserId,
                username: currentUser?.username
              }
            ]
          };
        }

        return {
          ...currentProfile,
          followers: followers.filter(
            (follower) =>
              (follower?._id || follower)?.toString() !== currentUserId
          )
        };
      });

    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Unable to update follow status."
      );
    } finally {
      setFollowLoading(false);
    }
  };

  const isPostLiked = (post) => {
    return (post.likes || []).some(
      (likeId) => (likeId?._id || likeId)?.toString() === currentUserId
    );
  };

  const handleToggleLike = async (postId) => {
    try {
      const response = await axios.put(
        `${API_URL}/posts/${postId}/like`,
        {},
        getAuthConfig()
      );

      setPosts((prevPosts) =>
        prevPosts.map((p) => {
          if (p._id === postId) {
            const currentLikes = p.likes || [];
            let updatedLikes;
            if (response.data.liked) {
              updatedLikes = [...currentLikes, currentUserId];
            } else {
              updatedLikes = currentLikes.filter(
                (id) => (id?._id || id)?.toString() !== currentUserId
              );
            }
            return {
              ...p,
              likes: updatedLikes
            };
          }
          return p;
        })
      );
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      await axios.delete(`${API_URL}/posts/${postId}`, getAuthConfig());
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err) {
      console.error("Delete post error:", err);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short"
    });
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="profile-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="profile-error-page">
        <h2>Couldn't load profile.</h2>
        <p>{error}</p>

        <Link to="/feed">
          Back to feed
        </Link>
      </div>
    );
  }

  return (
    <div className="profile-page">

      {/* NAVBAR */}
      <nav className="profile-navbar">
        <Link to="/feed" className="profile-back">
          ←
          <span>Back to loop</span>
        </Link>

        <Link to="/" className="profile-logo">
          <span>✦</span>
          loop
        </Link>

        <div className="profile-nav-space"></div>
      </nav>

      {/* PROFILE */}
      <main className="profile-container">

        <section className="profile-header">
          <div className="profile-avatar-large">
            {profile?.username
              ?.charAt(0)
              .toUpperCase()}
          </div>

          <div className="profile-info">
            <div className="profile-name-row">
              <div>
                <p className="profile-eyebrow">
                  {isOwnProfile ? "YOUR PROFILE" : "PROFILE"}
                </p>

                <h1>
                  @{profile?.username}
                </h1>
              </div>

              {!isOwnProfile && (
                <button
                  className={`follow-button ${
                    following ? "following" : ""
                  }`}
                  onClick={handleFollow}
                  disabled={followLoading}
                >
                  {followLoading
                    ? "..."
                    : following
                    ? "Following"
                    : "Follow"}
                </button>
              )}
            </div>

            {profile?.bio && (
              <p className="profile-bio">
                {profile.bio}
              </p>
            )}

            <div className="profile-stats">
              <div>
                <strong>
                  {posts.length}
                </strong>
                <span>Posts</span>
              </div>

              <div>
                <strong>
                  {profile?.followers?.length || 0}
                </strong>
                <span>Followers</span>
              </div>

              <div>
                <strong>
                  {profile?.following?.length || 0}
                </strong>
                <span>Following</span>
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div className="profile-error">
            {error}
          </div>
        )}

        {/* POSTS (ONLY THIS USER'S POSTS) */}
        <section className="profile-posts">
          <div className="profile-posts-heading">
            <p>
              {isOwnProfile ? "YOUR POSTS" : `@${profile?.username}'s POSTS`}
            </p>

            <span>
              {posts.length} {posts.length === 1 ? "post" : "posts"}
            </span>
          </div>

          {posts.length === 0 ? (
            <div className="profile-empty">
              <div>✦</div>
              <h2>No posts yet.</h2>
              <p>
                {isOwnProfile
                  ? "You haven't posted anything yet. Share your thoughts on the feed!"
                  : `@${profile?.username} hasn't shared any posts yet.`}
              </p>
            </div>
          ) : (
            posts.map((post) => {
              const liked = isPostLiked(post);

              return (
                <article
                  className="profile-post-card"
                  key={post._id}
                >
                  <div className="profile-post-top">
                    <div className="profile-post-author">
                      <div className="profile-post-avatar">
                        {profile?.username
                          ?.charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>
                        <strong>
                          @{profile?.username}
                        </strong>

                        <span>
                          {formatDate(post.createdAt)}
                        </span>
                      </div>
                    </div>

                    {isOwnProfile && (
                      <button
                        type="button"
                        className="profile-delete-btn"
                        onClick={() => handleDeletePost(post._id)}
                      >
                        Delete
                      </button>
                    )}
                  </div>

                  <p className="profile-post-content">
                    {post.content}
                  </p>

                  <div className="profile-post-footer">
                    <button
                      type="button"
                      className={`profile-like-btn ${liked ? "liked" : ""}`}
                      onClick={() => handleToggleLike(post._id)}
                    >
                      ♥ {post.likes?.length || 0} {post.likes?.length === 1 ? "like" : "likes"}
                    </button>

                    <Link to="/feed" className="profile-feed-link">
                      View in feed ↗
                    </Link>
                  </div>
                </article>
              );
            })
          )}
        </section>

      </main>

    </div>
  );
}

export default Profile;