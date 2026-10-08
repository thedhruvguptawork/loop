# 🚀 Production Deployment Guide: Loop Social Media App

This guide will walk you through deploying your **Loop MERN Stack** application live to the web for free using **Render** (Backend API), **Vercel** (Frontend UI), and **MongoDB Atlas** (Database).

---

## 📋 Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [Step 1: Commit and Push Code to GitHub](#step-1-commit-and-push-code-to-github)
3. [Step 2: Configure MongoDB Atlas](#step-2-configure-mongodb-atlas)
4. [Step 3: Deploy Backend on Render](#step-3-deploy-backend-on-render)
5. [Step 4: Deploy Frontend on Vercel](#step-4-deploy-frontend-on-vercel)
6. [Step 5: Link Frontend and Backend (CORS)](#step-5-link-frontend-and-backend-cors)
7. [Step 6: Live Verification Checklist](#step-6-live-verification-checklist)
8. [Troubleshooting & Interview Tips](#troubleshooting--interview-tips)

---

## 1. Prerequisites
Before beginning, ensure you have:
* A **[GitHub](https://github.com/)** account.
* A **[MongoDB Atlas](https://www.mongodb.com/cloud/atlas)** account.
* A **[Render](https://render.com/)** account (Free tier).
* A **[Vercel](https://vercel.com/)** account (Free tier).

---

## Step 1: Commit and Push Code to GitHub

Open your terminal in the project root and push your latest code to GitHub:

```bash
git add .
git commit -m "feat: complete OTP auth, global feed, follow system, and deployment configs"
git push origin main
```

*(If you haven't connected your GitHub repository yet, run `git remote add origin https://github.com/<your-username>/<your-repo-name>.git` and `git push -u origin main`).*

---

## Step 2: Configure MongoDB Atlas

For cloud providers like Render to connect to your database without being blocked:

1. Log in to [MongoDB Atlas](https://cloud.mongodb.com/).
2. In the left navigation, click **Network Access**.
3. Check your IP Access List:
   * Click **+ Add IP Address**.
   * Click **Allow Access from Anywhere** (`0.0.0.0/0`).
   * Click **Confirm**.
4. In the left navigation, click **Database**.
5. Click **Connect** on your cluster -> select **Drivers**.
6. Copy your connection string (format: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/<dbname>?retryWrites=true&w=majority`).

---

## Step 3: Deploy Backend on Render

1. Log in to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** and select **Web Service**.
3. Choose **Build and deploy from a Git repository** and connect your GitHub repo.
4. Configure the Web Service settings:
   * **Name**: `loop-backend` (or your choice)
   * **Region**: Choose the closest region (e.g., Singapore, Frankfurt, Oregon)
   * **Branch**: `main`
   * **Root Directory**: `server` ⚠️ *(Important: type `server`)*
   * **Runtime**: `Node`
   * **Build Command**: `npm install`
   * **Start Command**: `node src/server.js`
   * **Instance Type**: `Free`
5. Scroll down to **Environment Variables** and add the following keys:

| Key | Value | Notes |
| :--- | :--- | :--- |
| `PORT` | `5000` | Server listening port |
| `MONGO_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection URI |
| `JWT_SECRET` | `socialmediasecret0001` | Your secret token signing key |
| `CLIENT_URL` | `http://localhost:5173` | We will update this with your Vercel URL in Step 5 |
| `ALLOW_DEMO_OTP` | `true` | Allows terminal logging and your secret bypass code |
| `DEMO_BYPASS_OTP` | `123456` | Your secret emergency OTP |
| `EMAIL_USER` | `(optional)` | Gmail address (if using live SMTP emails) |
| `EMAIL_PASS` | `(optional)` | 16-character Gmail App Password |

6. Click **Create Web Service**.
7. Wait 2-3 minutes for the build to finish. Once live, Render will give you a public URL (e.g., `https://loop-backend.onrender.com`).
8. **Test your backend:** Open `https://loop-backend.onrender.com/api/health` in your browser. You should see:
   ```json
   { "status": "ok", "environment": "production" }
   ```

---

## Step 4: Deploy Frontend on Vercel

1. Log in to [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository.
4. Configure the project:
   * **Framework Preset**: `Vite`
   * **Root Directory**: Click **Edit** and select `client` ⚠️ *(Important)*
   * Leave Build Command as `npm run build` and Output Directory as `dist`.
5. Expand **Environment Variables** and add:

| Key | Value |
| :--- | :--- |
| `VITE_API_URL` | `https://loop-backend.onrender.com/api` *(Your Render backend URL followed by `/api`)* |

6. Click **Deploy**.
7. In about 30 seconds, Vercel will finish and provide your live frontend domain (e.g., `https://loop-app.vercel.app`).

---

## Step 5: Link Frontend and Backend (CORS)

Now that you have your live Vercel URL:

1. Copy your Vercel URL (e.g., `https://loop-app.vercel.app`).
2. Go back to your [Render Dashboard](https://dashboard.render.com/) -> click your `loop-backend` service.
3. Click **Environment**.
4. Find the `CLIENT_URL` variable, update it with your Vercel URL:
   ```env
   CLIENT_URL=https://loop-app.vercel.app,http://localhost:5173
   ```
5. Click **Save Changes**. Render will automatically restart your server with the updated configuration.

---

## Step 6: Live Verification Checklist

Open your live Vercel website and test all features:
- [ ] **Sign Up**: Register a new account. Notice the clean OTP verification step appears.
- [ ] **Secret OTP Bypass**: Enter `123456` in the OTP field. It should immediately verify and redirect you to the feed.
- [ ] **Global Feed**: Check that community posts are visible under the **"✦ Everyone"** tab.
- [ ] **Follow / Unfollow**: Click the `+ Follow` button on someone's post in the feed. Notice it toggles to `Following`.
- [ ] **Profile Posts**: Click on another user's name or avatar. Verify that the profile page shows **strictly that user's posts only**, along with their follower count.
- [ ] **Create Post & Comment**: Post a message and write a comment.

---

## Troubleshooting & Interview Tips

### 1. Render Free Tier Spin-down (Cold Starts)
* Free instances on Render go to sleep after 15 minutes of inactivity. The first request after a sleep period may take ~30 seconds to wake up.
* **Pro Tip:** In an interview, open your live website or ping `https://your-backend.onrender.com/api/health` 2-3 minutes before your interview starts so the server is warm and responds instantly.

### 2. CORS Errors in Browser Console
* If you see `Access to fetch has been blocked by CORS policy`:
  * Verify that `CLIENT_URL` in your Render Environment Variables exactly matches your Vercel URL (without trailing slashes).
  * In `server/src/server.js`, we have already configured permissive defaults to prevent deployment lockouts.

### 3. Vite Environment Variable Not Updating
* In Vite, environment variables are bundled during build time. If you ever change `VITE_API_URL` on Vercel, you must trigger a **Redeploy** on Vercel for the new URL to take effect.
