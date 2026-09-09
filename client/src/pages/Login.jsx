import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

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

    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        formData
      );

      const { token, user } = response.data;

      // Save authentication data
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Go to feed
      navigate("/feed");

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
    <div className="login-page">

      {/* LEFT VISUAL */}

      <section className="login-visual">

        <div className="login-image-glow"></div>

        <div className="login-image-wrapper">
          <img
            src="/hero.png"
            alt="People connecting on loop"
            className="login-image"
          />
        </div>

        <div className="login-floating-tag login-tag-one">
          <span>♥</span>
          good vibes only
        </div>

        <div className="login-floating-tag login-tag-two">
          <span>✦</span>
          find your people
        </div>

        <div className="login-visual-text">
          <strong>Stay in the loop.</strong>
          <span>Real people. Real conversations.</span>
        </div>

      </section>


      {/* RIGHT LOGIN */}

      <section className="login-form-section">

        <div className="login-card">

          <Link to="/" className="login-logo">
            <span>✦</span>
            loop
          </Link>


          <div className="login-heading">

            <p className="login-eyebrow">
              WELCOME BACK
            </p>

            <h1>
              Good to
              <br />
              see you <em>again.</em>
            </h1>

            <p className="login-subtitle">
              Pick up where you left off.
            </p>

          </div>


          <form
            className="login-form"
            onSubmit={handleSubmit}
          >

            {/* EMAIL */}

            <div className="login-input-group">

              <label htmlFor="email">
                Email
              </label>

              <input
                id="email"
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

            <div className="login-input-group">

              <div className="login-password-label">

                <label htmlFor="password">
                  Password
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setError("Password reset is coming soon.");
                  }}
                >
                  Forgot?
                </button>

              </div>

              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />

            </div>


            {/* ERROR */}

            {error && (
              <p className="login-error">
                {error}
              </p>
            )}


            {/* SUBMIT */}

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >

              <span>
                {loading ? "Logging in..." : "Log in"}
              </span>

              <strong>
                {loading ? "..." : "↗"}
              </strong>

            </button>

          </form>


          <div className="login-divider">
            <span>or</span>
          </div>


          <p className="login-register">
            New to loop?

            <Link to="/register">
              Create an account
            </Link>
          </p>

        </div>

      </section>

    </div>
  );
}

export default Login;