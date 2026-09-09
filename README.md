# Loop

Loop is a full-stack social media web application built using the MERN stack.

It is a simple social platform where users can create posts, follow other users, like posts, comment on posts, and interact with their community.

## Tech Stack

### Frontend
- React
- Vite
- React Router
- Axios
- CSS

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- CORS
- dotenv

## Features

### Authentication
- User registration
- User login
- Password hashing
- JWT authentication
- Protected routes

### Users
- View user profiles
- View own profile
- Follow users
- Unfollow users
- Followers count
- Following count
- User bio

### Posts
- Create posts
- View personalized feed
- View all posts
- Update posts
- Delete own posts
- Like posts
- Unlike posts

### Comments
- Add comments
- View comments
- Edit own comments
- Delete own comments

### Notifications
- Follow notifications
- Like notifications
- Comment notifications
- View notifications

## Project Structure

```text
social-media-app/
│
├── client/
│   ├── public/
│   │   ├── hero.png
│   │   └── feed.png
│   │
│   └── src/
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Login.css
│       │   ├── Register.jsx
│       │   ├── Register.css
│       │   ├── Feed.jsx
│       │   ├── Feed.css
│       │   ├── Profile.jsx
│       │   └── Profile.css
│       │
│       ├── App.jsx
│       ├── index.css
│       └── main.jsx
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── commentController.js
│   │   │   ├── notificationController.js
│   │   │   ├── postController.js
│   │   │   └── userController.js
│   │   │
│   │   ├── middleware/
│   │   │   └── authMiddleware.js
│   │   │
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Post.js
│   │   │   ├── Comment.js
│   │   │   └── Notification.js
│   │   │
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── commentRoutes.js
│   │   │   ├── notificationRoutes.js
│   │   │   ├── postRoutes.js
│   │   │   └── userRoutes.js
│   │   │
│   │   └── server.js
│   │
│   ├── .env
│   └── package.json
│
└── README.md