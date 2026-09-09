import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Feed from "./pages/Feed";
import Profile from "./pages/Profile";
function Landing() {
  return (
    <div className="landing-page">
      <nav className="navbar">

        <Link to="/" className="logo">
          <span className="logo-mark">✦</span>
          loop
        </Link>

        <div className="nav-actions">

          <Link to="/login" className="login-btn">
            Log in
          </Link>

          <Link to="/register" className="signup-btn">
            Join loop <span>↗</span>
          </Link>

        </div>

      </nav>

      <main className="hero">

        <section className="hero-content">

          <div className="hero-badge">
            <span className="status-dot"></span>
            made for real conversations
          </div>

          <h1>
            Your people.
            <br />
            Your space.
            <br />
            <em>Your vibe.</em>
          </h1>

          <p>
            A place to post what's on your mind, find people
            who get you, and keep the good conversations going.
          </p>

          <div className="hero-buttons">

            <Link to="/register" className="primary-btn">
              Get in
              <span>↗</span>
            </Link>

            <Link to="/login" className="secondary-btn">
              Already here?
            </Link>

          </div>

          <div className="social-proof">

            <div className="avatars">
              <span>R</span>
              <span>A</span>
              <span>K</span>
              <span>+</span>
            </div>

            <div className="proof-text">
              <strong>10k+ people already here</strong>
              <small>come find your people.</small>
            </div>

          </div>

        </section>


        <section className="hero-visual">

          <div className="visual-glow"></div>

          <div className="image-wrapper">
            <img
              src="/hero.png"
              alt="People connecting on loop"
              className="hero-image"
            />
          </div>

          <div className="floating-tag tag-one">
            <span>♥</span>
            428 likes
          </div>

          <div className="floating-tag tag-two">
            <span>✦</span>
            new connection
          </div>

          <div className="floating-tag tag-three">
            <span>💬</span>
            good vibes
          </div>

        </section>

      </main>

      <div className="scroll-hint">
        scroll to explore ↓
      </div>

    </div>
  );
}

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Landing />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/feed" element={<Feed />} />

        <Route path="/profile/:userId" element={<Profile />} />

      </Routes>

    </BrowserRouter>
  );
}

export default App;