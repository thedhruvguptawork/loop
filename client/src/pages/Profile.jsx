import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./Profile.css";

const API_URL = "http://localhost:5000/api";

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
      setPosts(posts);

      const isFollowing = user.followers.some(
        (follower) =>
          follower._id.toString() ===
          currentUser?.id?.toString()
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
        if (!currentProfile) {
          return currentProfile;
        }

        const followers = currentProfile.followers || [];

        if (response.data.following) {
          return {
            ...currentProfile,
            followers: [
              ...followers,
              {
                _id: currentUser.id,
                username: currentUser.username
              }
            ]
          };
        }

        return {
          ...currentProfile,
          followers: followers.filter(
            (follower) =>
              follower._id.toString() !==
              currentUser.id.toString()
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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short"
    });
  };

  const isOwnProfile =
    currentUser?.id?.toString() === userId?.toString();

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
                  PROFILE
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


        {/* POSTS */}

        <section className="profile-posts">

          <div className="profile-posts-heading">
            <p>
              POSTS
            </p>

            <span>
              {posts.length} shared
            </span>
          </div>


          {posts.length === 0 ? (

            <div className="profile-empty">

              <div>
                ✦
              </div>

              <h2>
                No posts yet.
              </h2>

              <p>
                Nothing here for now.
              </p>

            </div>

          ) : (

            posts.map((post) => (

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

                </div>


                <p className="profile-post-content">
                  {post.content}
                </p>


                <div className="profile-post-footer">
                  <span>
                    ♥ {post.likes?.length || 0}
                  </span>

                  <span>
                    💬 Comment
                  </span>
                </div>

              </article>

            ))

          )}

        </section>

      </main>

    </div>
  );
}

export default Profile;