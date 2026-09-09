import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: ""
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        formData
      );

      setMessage(response.data.message);

      setFormData({
        username: "",
        email: "",
        password: ""
      });

      setTimeout(() => {
        navigate("/login");
      }, 1200);

    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">

      {/* LEFT VISUAL */}

      <section className="register-visual">

        <div className="register-image-glow"></div>

        <div className="register-image-wrapper">
          <img
            src="/hero.png"
            alt="People connecting on loop"
            className="register-image"
          />
        </div>

        <div className="register-floating-tag register-tag-one">
          <span>✦</span>
          your people
        </div>

        <div className="register-floating-tag register-tag-two">
          <span>♥</span>
          good vibes only
        </div>

        <div className="register-visual-text">
          <strong>Find your people.</strong>
          <span>Start something worth coming back to.</span>
        </div>

      </section>


      {/* RIGHT REGISTER */}

      <section className="register-form-section">

        <div className="register-card">

          <Link to="/" className="register-logo">
            <span>✦</span>
            loop
          </Link>


          <div className="register-heading">

            <p className="register-eyebrow">
              JOIN THE LOOP
            </p>

            <h1>
              Make your
              <br />
              space <em>yours.</em>
            </h1>

            <p className="register-subtitle">
              Create an account and find your people.
            </p>

          </div>


          <form
            className="register-form"
            onSubmit={handleSubmit}
          >

            {/* USERNAME */}

            <div className="register-input-group">

              <label htmlFor="username">
                Username
              </label>

              <input
                id="username"
                name="username"
                type="text"
                placeholder="choose a username"
                value={formData.username}
                onChange={handleChange}
                autoComplete="username"
                required
              />

            </div>


            {/* EMAIL */}

            <div className="register-input-group">

              <label htmlFor="register-email">
                Email
              </label>

              <input
                id="register-email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />

            </div>


            {/* PASSWORD */}

            <div className="register-input-group">

              <label htmlFor="register-password">
                Password
              </label>

              <input
                id="register-password"
                name="password"
                type="password"
                placeholder="create a password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />

            </div>


            {/* ERROR */}

            {error && (
              <p className="register-error">
                {error}
              </p>
            )}


            {/* SUCCESS */}

            {message && (
              <p className="register-success">
                {message}
              </p>
            )}


            {/* SUBMIT */}

            <button
              type="submit"
              className="register-submit"
              disabled={loading}
            >

              <span>
                {loading ? "Creating account..." : "Create account"}
              </span>

              <strong>
                {loading ? "..." : "↗"}
              </strong>

            </button>

          </form>


          {/* LOGIN */}

          <div className="register-login">

            <span>
              Already have an account?
            </span>

            <Link to="/login">
              Log in
            </Link>

          </div>


          <p className="register-footer">
            Join the conversation.
            <span>✦</span>
          </p>

        </div>

      </section>

    </div>
  );
}

export default Register;