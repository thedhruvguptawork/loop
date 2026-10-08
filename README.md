# Loop - Full-Stack Social Media Platform

Loop is a modern full-stack social media application built with the MERN stack (MongoDB, Express, React, Node.js), featuring real-time feed updates, comments, profile customization, and **two-factor OTP authentication with Nodemailer**.

---

## Key Highlights

- **Nodemailer OTP Authentication**: Secure 6-digit email verification for both **User Registration** and **User Login**.
- **Interview & Demo-Safe Architecture**: If email credentials are not configured or SMTP encounters network issues/delays during an interview demo, the application never crashes or blocks. OTP is automatically printed to the terminal console, returned to the UI in demo mode, and supports the universal demo bypass code `123456`.
- **Production-Ready Deployment**: Configured for split deployment (e.g., Render backend + Vercel frontend) or single full-stack deployment, featuring dynamic CORS, health-checks (`/api/health`), and environment variable centralization.

---

## Tech Stack

### Frontend
- **React 19** with **Vite**
- **React Router 7**
- **Axios** (Centralized client with JWT request interceptors)
- Modern Dark-mode Glassmorphic CSS

### Backend
- **Node.js** & **Express**
- **MongoDB** & **Mongoose**
- **Nodemailer** (SMTP email delivery)
- **JWT** (JSON Web Tokens)
- **bcryptjs** (Password hashing)
- **CORS** & **dotenv**

---

## Features

### Authentication & Security
- **Email Verification on Signup**: 6-digit OTP code sent via Nodemailer to verify genuine email accounts.
- **2FA OTP on Login**: Two-step authentication flow with OTP email delivery.
- **Resend OTP Support**: Countdown-protected resend mechanism.
- **Fail-Safe Interview Mode**: Instant auto-fill and console logging so demos run smoothly without depending on external email providers.
- **JWT-Protected API Endpoints**: Automatic authorization headers via Axios interceptor.

### Social Features
- **Feed**: Create posts, view community posts, like/unlike posts.
- **Comments**: Add, edit, and delete comments on posts.
- **Profiles**: View profiles, follower/following counts, user posts, and bio.
- **Social Graph**: Follow/unfollow users in real-time.
- **Notifications**: Alerts for likes, comments, and follows.

---

## Local Setup & Development

### 1. Prerequisites
- Node.js (v18+)
- MongoDB Atlas account or local MongoDB instance

### 2. Backend Setup
```bash
cd server
npm install
```

Configure `server/.env` (refer to `server/.env.example`):
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:5173

# Optional: Nodemailer SMTP settings (leave blank for demo/console mode)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

# Interview & Demo Fallback Mode
ALLOW_DEMO_OTP=true
DEMO_BYPASS_OTP=123456
```

Start the backend:
```bash
npm run dev
# or: npm start
```

### 3. Frontend Setup
```bash
cd client
npm install
```

Configure `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```

Visit `http://localhost:5173` to use the app.

---

## Interview & Demo Tips

1. **Email Service Independence**: If you don't enter Gmail SMTP credentials in `server/.env`, the backend automatically logs all OTP codes directly to your server terminal:
   ```text
   ============================================================
                [LOOP AUTHENTICATION - OTP NOTIFICATION]        
    Target Email : user@example.com
    OTP Code     : >>>  492810  <<<
   ============================================================
   ```
2. **One-Click Auto-Fill**: In demo/development mode, the frontend renders a helper button to auto-fill the code with one click.
3. **Emergency Master Bypass**: In demo mode, typing `123456` into the OTP field will always verify any account!

---

## Deployment Guide

### Option A: Separated Deployment (Recommended)

#### Backend (Render / Railway / Fly.io)
1. Deploy the `server` folder.
2. Build command: `npm install`
3. Start command: `node src/server.js` (or `npm start`)
4. Set Environment Variables:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `CLIENT_URL` (URL of your deployed frontend, e.g., `https://loop-app.vercel.app`)
   - `EMAIL_USER` & `EMAIL_PASS` (Optional Gmail app password)
   - `ALLOW_DEMO_OTP=true` (if you want interview bypass to work in staging)

#### Frontend (Vercel / Netlify)
1. Deploy the `client` folder.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Set Environment Variable:
   - `VITE_API_URL=https://your-backend.onrender.com/api`

### Health Check Endpoint
To keep free tier instances awake or verify server health:
- `GET /api/health` returns `{ "status": "ok", "uptime": ... }`