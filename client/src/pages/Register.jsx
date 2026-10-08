import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  // Registration step: "form" or "otp"
  const [step, setStep] = useState("form");

  const [formData, setFormData] = useState({
    username: "",
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

  // Step 1: Submit signup form -> Trigger OTP
  const handleSubmitForm = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/register", formData);

      setPendingEmail(formData.email.toLowerCase().trim());
      setMessage(response.data.message || "Verification code sent to your email.");
      
      if (response.data.demoOtp) {
        setDemoOtp(response.data.demoOtp);
      }

      setStep("otp");
      setResendCooldown(30);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/verify-signup-otp", {
        email: pendingEmail,
        otp: otp.trim()
      });

      const { token, user } = response.data;

      // Save session credentials
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setMessage(response.data.message || "Account verified successfully!");

      // Seamless redirect to feed
      setTimeout(() => {
        navigate("/feed");
      }, 1000);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Invalid or expired OTP. Please try again."
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
        type: "signup"
      });

      setMessage(response.data.message || "A new OTP has been sent.");
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

      {/* RIGHT REGISTER / OTP */}
      <section className="register-form-section">
        <div className="register-card">

          <Link to="/" className="register-logo">
            <span>✦</span>
            loop
          </Link>

          {step === "form" ? (
            /* ================= STEP 1: INITIAL REGISTRATION ================= */
            <>
              <div className="register-heading">
                <p className="register-eyebrow">JOIN THE LOOP</p>
                <h1>
                  Make your<br />space <em>yours.</em>
                </h1>
                <p className="register-subtitle">
                  Create an account and find your people.
                </p>
              </div>

              <form className="register-form" onSubmit={handleSubmitForm}>
                {/* USERNAME */}
                <div className="register-input-group">
                  <label htmlFor="username">Username</label>
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
                  <label htmlFor="register-email">Email</label>
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
                  <label htmlFor="register-password">Password</label>
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

                {error && <p className="register-error">{error}</p>}
                {message && <p className="register-success">{message}</p>}

                <button
                  type="submit"
                  className="register-submit"
                  disabled={loading}
                >
                  <span>{loading ? "Sending verification code..." : "Create account"}</span>
                  <strong>{loading ? "..." : "↗"}</strong>
                </button>
              </form>

              <div className="register-login">
                <span>Already have an account?</span>
                <Link to="/login">Log in</Link>
              </div>
            </>
          ) : (
            /* ================= STEP 2: OTP VERIFICATION ================= */
            <>
              <div className="register-heading">
                <p className="register-eyebrow">VERIFY EMAIL</p>
                <h1>
                  Check your<br /><em>inbox.</em>
                </h1>
                <p className="register-subtitle">
                  We sent a 6-digit verification code to <strong>{pendingEmail}</strong>
                </p>
              </div>

              <form className="register-form" onSubmit={handleVerifyOtp}>
                {/* OTP INPUT */}
                <div className="register-input-group">
                  <label htmlFor="register-otp">6-Digit Verification Code</label>
                  <input
                    id="register-otp"
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

                {error && <p className="register-error">{error}</p>}
                {message && <p className="register-success">{message}</p>}

                <button
                  type="submit"
                  className="register-submit"
                  disabled={loading || otp.length < 4}
                >
                  <span>{loading ? "Verifying..." : "Verify & Continue"}</span>
                  <strong>{loading ? "..." : "↗"}</strong>
                </button>

                {/* RESEND & CHANGE EMAIL BUTTONS */}
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
                    ← Change email / details
                  </button>
                </div>
              </form>
            </>
          )}

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