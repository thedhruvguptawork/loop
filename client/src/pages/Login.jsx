import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  // Login step: "form" or "otp"
  const [step, setStep] = useState("form");

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [otp, setOtp] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [demoOtp, setDemoOtp] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle resend countdown timer
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Step 1: Submit email & password -> Trigger OTP
  const handleSubmitForm = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", formData);

      // If backend requires OTP verification
      if (response.data.requiresOtp) {
        setPendingEmail(formData.email.toLowerCase().trim());
        setMessage(response.data.message || "Verification code sent to your email.");
        if (response.data.demoOtp) {
          setDemoOtp(response.data.demoOtp);
        }
        setStep("otp");
        setResendCooldown(30);
      } else {
        // Fallback for direct token response
        const { token, user } = response.data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        navigate("/feed");
      }

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await api.post("/auth/verify-login-otp", {
        email: pendingEmail,
        otp: otp.trim()
      });

      const { token, user } = response.data;

      // Save authentication data
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setMessage("Verification successful! Redirecting...");

      // Go to feed
      setTimeout(() => {
        navigate("/feed");
      }, 800);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Invalid or expired OTP code."
      );
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || loading) return;

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await api.post("/auth/resend-otp", {
        email: pendingEmail,
        type: "login"
      });

      setMessage(response.data.message || "A new code has been sent.");
      if (response.data.demoOtp) {
        setDemoOtp(response.data.demoOtp);
      }
      setResendCooldown(30);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to resend code. Please try again."
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

      {/* RIGHT LOGIN / OTP */}
      <section className="login-form-section">
        <div className="login-card">

          <Link to="/" className="login-logo">
            <span>✦</span>
            loop
          </Link>

          {step === "form" ? (
            /* ================= STEP 1: LOGIN FORM ================= */
            <>
              <div className="login-heading">
                <p className="login-eyebrow">WELCOME BACK</p>
                <h1>
                  Good to<br />see you <em>again.</em>
                </h1>
                <p className="login-subtitle">
                  Pick up where you left off.
                </p>
              </div>

              <form className="login-form" onSubmit={handleSubmitForm}>
                {/* EMAIL */}
                <div className="login-input-group">
                  <label htmlFor="email">Email</label>
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
                    <label htmlFor="password">Password</label>
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

                {error && <p className="login-error">{error}</p>}
                {message && <p className="login-success">{message}</p>}

                <button
                  type="submit"
                  className="login-submit"
                  disabled={loading}
                >
                  <span>{loading ? "Verifying..." : "Log in"}</span>
                  <strong>{loading ? "..." : "↗"}</strong>
                </button>
              </form>

              <div className="login-divider">
                <span>or</span>
              </div>

              <p className="login-register">
                New to loop?
                <Link to="/register">Create an account</Link>
              </p>
            </>
          ) : (
            /* ================= STEP 2: 2-FACTOR OTP ================= */
            <>
              <div className="login-heading">
                <p className="login-eyebrow">TWO-FACTOR SECURITY</p>
                <h1>
                  Enter your<br /><em>code.</em>
                </h1>
                <p className="login-subtitle">
                  We sent a 6-digit code to <strong>{pendingEmail}</strong>
                </p>
              </div>

              <form className="login-form" onSubmit={handleVerifyOtp}>
                {/* OTP INPUT */}
                <div className="login-input-group">
                  <label htmlFor="login-otp">6-Digit Verification Code</label>
                  <input
                    id="login-otp"
                    name="otp"
                    type="text"
                    maxLength={6}
                    placeholder="• • • • • •"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="otp-digit-input"
                    autoFocus
                    required
                  />
                </div>

                {error && <p className="login-error">{error}</p>}
                {message && <p className="login-success">{message}</p>}

                <button
                  type="submit"
                  className="login-submit"
                  disabled={loading || otp.length < 4}
                >
                  <span>{loading ? "Signing in..." : "Verify & Sign In"}</span>
                  <strong>{loading ? "..." : "↗"}</strong>
                </button>

                {/* RESEND & BACK BUTTONS */}
                <div className="otp-controls">
                  <button
                    type="button"
                    className="otp-resend-link"
                    disabled={resendCooldown > 0 || loading}
                    onClick={handleResendOtp}
                  >
                    {resendCooldown > 0
                      ? `Resend code in ${resendCooldown}s`
                      : "Resend code"}
                  </button>

                  <button
                    type="button"
                    className="otp-back-link"
                    onClick={() => {
                      setStep("form");
                      setError("");
                      setMessage("");
                    }}
                  >
                    ← Back to login
                  </button>
                </div>
              </form>
            </>
          )}

        </div>
      </section>

    </div>
  );
}

export default Login;