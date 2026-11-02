# Intelligence Attendance - AI Attendance System ⚡

Intelligence Attendance is a modern, full-stack Attendance Monitoring System that leverages Facial Recognition to mark attendance in real-time. It features dedicated portals for Students, Teachers, and Admins.

## ✨ Features
- **Face Recognition Attendance:** Real-time AI face matching (using face-api.js).
- **Role-Based Access:** Dedicated Student, Teacher, and Admin portals.
- **Real-Time Analytics:** Dashboards with attendance metrics, defaulters list, and historical records.
- **Modern UI:** Built with React and an entirely custom glassmorphism design system.
- **Secure Backend:** Express & MongoDB with helmet, rate-limiting, mongo-sanitize, and JWT authentication.

## 🛠️ Tech Stack
- **Frontend:** React, Vite, React Router, face-api.js, Axios
- **Backend:** Node.js, Express, MongoDB, Mongoose, JWT, bcrypt
- **Security:** helmet, express-rate-limit, express-mongo-sanitize

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB (Running locally on default port 27017 or a MongoDB URI)

### Environment Variables
1. **Backend:** Check `backend/.env.example`. Create `backend/.env` with:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/attendance
   JWT_SECRET=your_super_secret_jwt_key
   ```
2. **Frontend:** Check `frontend/.env.example`. Create `frontend/.env` with:
   ```env
   VITE_API_URL=http://localhost:5000
   ```

### Installation

1. **Install Backend Dependencies:**
   ```bash
   cd backend
   npm install
   ```
2. **Install Frontend Dependencies:**
   ```bash
   cd frontend
   npm install
   ```

### Running Locally

- **Windows (One-Click):** Double-click `dev.bat` or `start.bat` in the root folder to start both servers.
- **Manual (Two Terminals):**
  - Terminal 1: `cd backend && npm start`
  - Terminal 2: `cd frontend && npm run dev`

### 🔑 Default Credentials (Auto-Seeded)
- **Admin Portal:** Email: `admin@system.com` | Password: `admin123`
- **Teacher Portal:** Teacher ID: `T101` | Password: `teacher123`
- **Student Portal:** College ID: `S101` | Password: `student123`

1. **Start Backend Server:**
   ```bash
   cd backend
   npm run dev
   # (or node server.js)
   ```
2. **Start Frontend Dev Server:**
   ```bash
   cd frontend
   npm run dev
   ```

## 📦 Deployment (Production)

1. Deploy the backend as a separate Node service and configure `MONGO_URI`, `JWT_SECRET`, and `PORT` there. Vercel serves the frontend; it does not run `backend/server.js` as part of this static Vite deployment.
2. In Vercel Project Settings → Environment Variables, set `VITE_API_URL` to the public backend origin (for example, `https://your-backend.example.com`, without a trailing slash). The previous Render URL `https://attendance-ai-rs6k.onrender.com` is no longer resolving and should not be used unless you confirm that service has been restored.
3. Allow the Vercel site origin in the backend's CORS configuration.
4. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```
3. Copy `frontend/dist` to your web server (or serve via Express).
4. Run the backend in production mode:
   ```bash
   NODE_ENV=production node server.js
   ```

## 🔒 Security Measures Implemented
- **Rate Limiting:** Prevents brute-force attacks.
- **Helmet:** Sets secure HTTP headers.
- **Mongo Sanitize:** Prevents NoSQL injection attacks.
- **JWT & bcrypt:** Secure auth flow and password hashing.
