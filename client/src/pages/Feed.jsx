import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Feed.css";

const API_URL = "http://localhost:5000/api";

function Feed() {
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");

  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  // Comments
  const [openComments, setOpenComments] = useState({});
  const [comments, setComments] = useState({});
  const [commentText, setCommentText] = useState({});
  const [commentsLoading, setCommentsLoading] = useState({});
  const [commentPosting, setCommentPosting] = useState({});

  // Comment editing
  const [editingComment, setEditingComment] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");

  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");

  const user = storedUser
    ? JSON.parse(storedUser)
    : null;

  // ================================
  // FETCH FEED
  // ================================
  const fetchFeed = async () => {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(
        `${API_URL}/posts/feed`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setPosts(response.data);
    } catch (error) {
      console.error("Fetch feed error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      setError(
        error.response?.data?.message ||
          "Unable to load your feed."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  // ================================
  // CREATE POST
  // ================================
  const handleCreatePost = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      return;
    }

    try {
      setPosting(true);
      setError("");

      const response = await axios.post(
        `${API_URL}/posts`,
        {
          content: content.trim()
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setPosts((prev) => [
        response.data.post,
        ...prev
      ]);

      setContent("");
    } catch (error) {
      console.error("Create post error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to create post."
      );
    } finally {
      setPosting(false);
    }
  };

  // ================================
  // LIKE / UNLIKE
  // ================================
  const handleLike = async (postId) => {
    try {
      const response = await axios.put(
        `${API_URL}/posts/${postId}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setPosts((prev) =>
        prev.map((post) => {
          if (post._id !== postId) {
            return post;
          }

          const currentLikes = post.likes || [];

          if (response.data.liked) {
            return {
              ...post,
              likes: [
                ...currentLikes,
                user.id
              ]
            };
          }

          return {
            ...post,
            likes: currentLikes.filter(
              (id) =>
                id.toString() !==
                user.id.toString()
            )
          };
        })
      );
    } catch (error) {
      console.error("Like error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to like this post."
      );
    }
  };

  // ================================
  // DELETE POST
  // ================================
  const handleDelete = async (postId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this post?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await axios.delete(
        `${API_URL}/posts/${postId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setPosts((prev) =>
        prev.filter(
          (post) => post._id !== postId
        )
      );
    } catch (error) {
      console.error(
        "Delete post error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to delete this post."
      );
    }
  };

  // ================================
  // GET COMMENTS
  // GET /api/comments/:postId
  // ================================
  const fetchComments = async (postId) => {
    try {
      setCommentsLoading((prev) => ({
        ...prev,
        [postId]: true
      }));

      const response = await axios.get(
        `${API_URL}/comments/${postId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setComments((prev) => ({
        ...prev,
        [postId]: response.data
      }));
    } catch (error) {
      console.error(
        "Fetch comments error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load comments."
      );
    } finally {
      setCommentsLoading((prev) => ({
        ...prev,
        [postId]: false
      }));
    }
  };

  // ================================
  // TOGGLE COMMENTS
  // ================================
  const toggleComments = async (postId) => {
    const isOpen = openComments[postId];

    setOpenComments((prev) => ({
      ...prev,
      [postId]: !isOpen
    }));

    if (!isOpen) {
      await fetchComments(postId);
    }
  };

  // ================================
  // COMMENT INPUT
  // ================================
  const handleCommentChange = (
    postId,
    value
  ) => {
    setCommentText((prev) => ({
      ...prev,
      [postId]: value
    }));
  };

  // ================================
  // ADD COMMENT
  // POST /api/comments/:postId
  // ================================
  const handleAddComment = async (
    e,
    postId
  ) => {
    e.preventDefault();

    const text =
      commentText[postId]?.trim();

    if (!text) {
      return;
    }

    try {
      setCommentPosting((prev) => ({
        ...prev,
        [postId]: true
      }));

      setError("");

      const response = await axios.post(
        `${API_URL}/comments/${postId}`,
        {
          content: text
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const newComment =
        response.data.comment;

      setComments((prev) => ({
        ...prev,
        [postId]: [
          ...(prev[postId] || []),
          newComment
        ]
      }));

      setCommentText((prev) => ({
        ...prev,
        [postId]: ""
      }));
    } catch (error) {
      console.error(
        "Add comment error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to add comment."
      );
    } finally {
      setCommentPosting((prev) => ({
        ...prev,
        [postId]: false
      }));
    }
  };

  // ================================
  // EDIT COMMENT
  // ================================
  const startEditingComment = (
    comment
  ) => {
    setEditingComment(comment._id);
    setEditCommentText(
      comment.content
    );
  };

  const cancelEditingComment = () => {
    setEditingComment(null);
    setEditCommentText("");
  };

  // ================================
  // UPDATE COMMENT
  // PUT /api/comments/:commentId
  // ================================
  const handleUpdateComment = async (
    commentId,
    postId
  ) => {
    if (!editCommentText.trim()) {
      return;
    }

    try {
      setError("");

      const response = await axios.put(
        `${API_URL}/comments/${commentId}`,
        {
          content:
            editCommentText.trim()
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const updatedComment =
        response.data.comment;

      setComments((prev) => ({
        ...prev,
        [postId]: (
          prev[postId] || []
        ).map((comment) =>
          comment._id === commentId
            ? updatedComment
            : comment
        )
      }));

      setEditingComment(null);
      setEditCommentText("");
    } catch (error) {
      console.error(
        "Update comment error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to update comment."
      );
    }
  };

  // ================================
  // DELETE COMMENT
  // DELETE /api/comments/:commentId
  // ================================
  const handleDeleteComment = async (
    commentId,
    postId
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this comment?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await axios.delete(
        `${API_URL}/comments/${commentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setComments((prev) => ({
        ...prev,
        [postId]: (
          prev[postId] || []
        ).filter(
          (comment) =>
            comment._id !== commentId
        )
      }));
    } catch (error) {
      console.error(
        "Delete comment error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to delete comment."
      );
    }
  };

  // ================================
  // LOGOUT
  // ================================
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  // ================================
  // HELPERS
  // ================================
  const getInitial = (name) => {
    if (!name) {
      return "?";
    }

    return name.charAt(0).toUpperCase();
  };

  const isPostLiked = (post) => {
    return (post.likes || []).some(
      (id) =>
        id.toString() ===
        user?.id?.toString()
    );
  };

  // ================================
  // UI
  // ================================
  return (
    <div className="feed-page">

      {/* NAVBAR */}
      <nav className="feed-navbar">
        <Link
          to="/feed"
          className="feed-logo"
        >
          <span className="feed-logo-mark">
            ✦
          </span>

          loop
        </Link>

        <div className="feed-nav-right">

          <Link
            to={`/profile/${user?.id}`}
            className="nav-profile"
          >
            <div className="nav-avatar">
              {getInitial(
                user?.username
              )}
            </div>

            <span>
              {user?.username}
            </span>
          </Link>

          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            Log out
          </button>

        </div>
      </nav>


      {/* MAIN */}
      <main className="feed-container">

        {/* HEADING */}
        <div className="feed-heading">

          <div>
            <span className="feed-eyebrow">
              YOUR SPACE
            </span>

            <h1>
              Your feed.
            </h1>

            <p>
              See what your people are up to.
            </p>
          </div>

          <Link
            to={`/profile/${user?.id}`}
            className="my-profile-btn"
          >
            My profile ↗
          </Link>

        </div>


        {/* CREATE POST */}
        <section className="create-post-card">

          <div className="create-post-top">

            <Link
              to={`/profile/${user?.id}`}
            >
              <div className="post-avatar">
                {getInitial(
                  user?.username
                )}
              </div>
            </Link>

            <div className="create-post-text">
              <strong>
                {user?.username}
              </strong>

              <span>
                Share something with your people
              </span>
            </div>

          </div>

          <form
            onSubmit={handleCreatePost}
          >
            <textarea
              value={content}
              onChange={(e) =>
                setContent(
                  e.target.value
                )
              }
              placeholder="What's on your mind?"
              rows="4"
            />

            <div className="create-post-bottom">

              <span>
                {content.length > 0
                  ? `${content.length} characters`
                  : "Say something real."}
              </span>

              <button
                type="submit"
                className="post-submit-btn"
                disabled={
                  posting ||
                  !content.trim()
                }
              >
                {posting
                  ? "Posting..."
                  : "Post ↗"}
              </button>

            </div>
          </form>

        </section>


        {/* ERROR */}
        {error && (
          <div className="feed-error">
            {error}
          </div>
        )}


        {/* LOADING */}
        {loading ? (
          <div className="feed-loading">
            <div className="loading-dot"></div>

            <p>
              Loading your feed...
            </p>
          </div>
        ) : posts.length === 0 ? (

          <div className="empty-feed">

            <div className="empty-icon">
              ✦
            </div>

            <h2>
              Your feed is quiet.
            </h2>

            <p>
              Follow some people or create
              your first post.
            </p>

          </div>

        ) : (

          <div className="posts-list">

            {posts.map((post) => {

              const postUser =
                post.user;

              const postComments =
                comments[post._id] || [];

              const liked =
                isPostLiked(post);

              const isOwner =
                postUser?._id?.toString() ===
                user?.id?.toString();

              return (
                <article
                  className="post-card"
                  key={post._id}
                >

                  {/* POST HEADER */}
                  <div className="post-header">

                    <Link
                      to={`/profile/${postUser?._id}`}
                      className="post-author"
                    >

                      <div className="post-avatar">
                        {getInitial(
                          postUser?.username
                        )}
                      </div>

                      <div className="post-author-info">

                        <strong>
                          {postUser?.username}
                        </strong>

                        <span>
                          {new Date(
                            post.createdAt
                          ).toLocaleString()}
                        </span>

                      </div>

                    </Link>


                    {/* DELETE POST */}
                    {isOwner && (
                      <button
                        className="delete-post-btn"
                        onClick={() =>
                          handleDelete(
                            post._id
                          )
                        }
                      >
                        Delete
                      </button>
                    )}

                  </div>


                  {/* POST CONTENT */}
                  <div className="post-content">

                    <p>
                      {post.content}
                    </p>

                    {post.image && (
                      <img
                        src={post.image}
                        alt="Post"
                        className="post-image"
                      />
                    )}

                  </div>


                  {/* POST ACTIONS */}
                  <div className="post-actions">

                    <button
                      className={`post-action ${
                        liked
                          ? "liked"
                          : ""
                      }`}
                      onClick={() =>
                        handleLike(
                          post._id
                        )
                      }
                    >
                      <span>
                        {liked
                          ? "♥"
                          : "♡"}
                      </span>

                      {post.likes?.length ||
                        0}
                    </button>


                    <button
                      className="post-action"
                      onClick={() =>
                        toggleComments(
                          post._id
                        )
                      }
                    >
                      <span>
                        💬
                      </span>

                      {openComments[
                        post._id
                      ]
                        ? "Hide comments"
                        : "Comments"}
                    </button>

                  </div>


                  {/* COMMENTS */}
                  {openComments[
                    post._id
                  ] && (

                    <div className="comments-section">

                      <div className="comments-title">

                        <span>
                          Comments
                        </span>

                        <small>
                          {
                            postComments.length
                          }
                        </small>

                      </div>


                      {commentsLoading[
                        post._id
                      ] ? (

                        <div className="comments-loading">
                          Loading comments...
                        </div>

                      ) : postComments.length ===
                        0 ? (

                        <div className="no-comments">
                          No comments yet.
                          Be the first one.
                        </div>

                      ) : (

                        <div className="comments-list">

                          {postComments.map(
                            (comment) => {

                              const commentUser =
                                comment.user;

                              const isCommentOwner =
                                commentUser?._id?.toString() ===
                                user?.id?.toString();

                              return (
                                <div
                                  className="comment-item"
                                  key={
                                    comment._id
                                  }
                                >

                                  <Link
                                    to={`/profile/${commentUser?._id}`}
                                    className="comment-avatar"
                                  >
                                    {getInitial(
                                      commentUser?.username
                                    )}
                                  </Link>


                                  <div className="comment-body">

                                    <div className="comment-top">

                                      <Link
                                        to={`/profile/${commentUser?._id}`}
                                        className="comment-user"
                                      >
                                        {
                                          commentUser?.username
                                        }
                                      </Link>

                                      <span className="comment-time">
                                        {new Date(
                                          comment.createdAt
                                        ).toLocaleString()}
                                      </span>

                                    </div>


                                    {editingComment ===
                                    comment._id ? (

                                      <div className="comment-edit-box">

                                        <input
                                          type="text"
                                          value={
                                            editCommentText
                                          }
                                          onChange={(e) =>
                                            setEditCommentText(
                                              e.target.value
                                            )
                                          }
                                          autoFocus
                                        />

                                        <div className="comment-edit-actions">

                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleUpdateComment(
                                                comment._id,
                                                post._id
                                              )
                                            }
                                          >
                                            Save
                                          </button>

                                          <button
                                            type="button"
                                            onClick={
                                              cancelEditingComment
                                            }
                                          >
                                            Cancel
                                          </button>

                                        </div>

                                      </div>

                                    ) : (

                                      <p className="comment-content">
                                        {
                                          comment.content
                                        }
                                      </p>

                                    )}


                                    {/* COMMENT EDIT / DELETE */}
                                    {isCommentOwner &&
                                      editingComment !==
                                        comment._id && (

                                        <div className="comment-owner-actions">

                                          <button
                                            type="button"
                                            onClick={() =>
                                              startEditingComment(
                                                comment
                                              )
                                            }
                                          >
                                            Edit
                                          </button>

                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleDeleteComment(
                                                comment._id,
                                                post._id
                                              )
                                            }
                                          >
                                            Delete
                                          </button>

                                        </div>

                                      )}

                                  </div>

                                </div>
                              );
                            }
                          )}

                        </div>

                      )}


                      {/* ADD COMMENT */}
                      <form
                        className="comment-form"
                        onSubmit={(e) =>
                          handleAddComment(
                            e,
                            post._id
                          )
                        }
                      >

                        <div className="comment-input-avatar">
                          {getInitial(
                            user?.username
                          )}
                        </div>

                        <input
                          type="text"
                          value={
                            commentText[
                              post._id
                            ] || ""
                          }
                          onChange={(e) =>
                            handleCommentChange(
                              post._id,
                              e.target.value
                            )
                          }
                          placeholder="Write a comment..."
                        />

                        <button
                          type="submit"
                          disabled={
                            commentPosting[
                              post._id
                            ] ||
                            !commentText[
                              post._id
                            ]?.trim()
                          }
                        >
                          {commentPosting[
                            post._id
                          ]
                            ? "..."
                            : "↗"}
                        </button>

                      </form>

                    </div>

                  )}

                </article>
              );
            })}

          </div>

        )}

      </main>
    </div>
  );
}

export default Feed;