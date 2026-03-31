# Learning Management System [LMS]

<img width="1887" height="954" alt="Screenshot 2026-03-31 145949" src="https://github.com/user-attachments/assets/2129d544-cdee-4d56-a360-853ac9daf67f" />

A full-stack, production-ready Learning Management System built with **React**, **Node.js**, **MongoDB**, and **Cloudinary** — inspired by Udemy and Coursera.

---

##  Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 + Vite | UI framework |
| Tailwind CSS | Styling |
| React Query | Data fetching & caching |
| Zustand | State management |
| React Hook Form + Zod | Form validation |
| Recharts | Analytics charts |
| Socket.io Client | Real-time notifications |
| React Router DOM v6 | Routing |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js + Express | Server framework |
| MongoDB + Mongoose | Database |
| JWT | Authentication |
| Cloudinary | Video & image storage |
| Socket.io | Real-time communication |
| Multer | File upload handling |
| Bcryptjs | Password hashing |
| Helmet + Rate Limiting | Security |

---

## Features

### UI/UX
- Modern Udemy/Coursera-inspired design
- Fully responsive (mobile + tablet + desktop)
- Dark mode support
- Smooth animations and transitions
- Loading skeletons
- Toast notifications
- Breadcrumb navigation

### Student Features
- Course catalog with filters (category, level, price, rating)
- Grid/List view toggle
- Course detail page with curriculum accordion
- Free course enrollment
- Video player with progress tracking
- Continue where you left off
- Notes taking during video
- Certificate of completion
- Wishlist / save for later
- Student dashboard with learning stats

### Instructor Features
- Professional instructor dashboard
- Revenue & enrollment analytics
- Multi-step course creation wizard
- Lesson builder with Cloudinary video upload
- Upload progress bar with percentage
- Section drag-and-drop reordering
- Course submission for admin review
- Student enrollment tracking

### Admin Features
- Platform analytics dashboard with Recharts
- User management (ban, role change)
- Course approval system
- Category management
- Revenue reports with charts
- User growth tracking

### Real-time
- Socket.io notifications
- New enrollment alerts
- Course approval/rejection alerts
- Real-time unread badge count

---

## Project Structure

```
lms-pro/
├── backend/
│   ├── src/
│   │   ├── config/          # DB, Cloudinary, Redis config
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Auth, error, upload middleware
│   │   ├── models/          # 13 Mongoose models
│   │   ├── routes/          # Express route definitions
│   │   ├── services/        # Email, payment, AI services
│   │   ├── sockets/         # Socket.io handlers
│   │   ├── utils/           # Helpers, response utils
│   │   ├── validators/      # Joi validation schemas
│   │   ├── app.js           # Express app setup
│   │   └── server.js        # HTTP + Socket server
│   ├── .env
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/             # Axios API functions
    │   ├── components/      # Reusable UI components
    │   ├── hooks/           # Custom React hooks
    │   ├── layouts/         # MainLayout, DashboardLayout, AdminLayout
    │   ├── pages/           # All route pages
    │   ├── store/           # Zustand state stores
    │   ├── utils/           # Formatters, helpers
    │   ├── App.jsx          # Router setup
    │   └── main.jsx         # React entry point
    ├── .env
    └── package.json
```

---

## Quick Start

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free)
- Cloudinary account (free)
- Git

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/lms-pro.git
cd lms-pro
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in the `backend/` folder:
```env
# Server
NODE_ENV=development
PORT=5001
CLIENT_URL=http://localhost:5173

# MongoDB Atlas
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/lms-pro

# JWT
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
JWT_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Start the backend:
```bash
npm run dev
```

Expected output:
```
MongoDB connected: cluster0.xxxxx.mongodb.net
Server running on port 5001
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create `.env` file in the `frontend/` folder:
```env
VITE_API_URL=http://localhost:5001
VITE_SOCKET_URL=http://localhost:5001
```

Update `vite.config.js` proxy target to match backend port:
```js
proxy: {
  '/api': {
    target: 'http://localhost:5001',
    changeOrigin: true,
  },
},
```

Start the frontend:
```bash
npm run dev
```

Open browser at: `http://localhost:5173`

---

## Initial Setup (First Run)

### Step 1 — Create an Admin account

Register a normal account via the UI, then in **MongoDB Atlas**:
1. Go to Collections → `users`
2. Find your user document
3. Change `"role": "student"` to `"role": "admin"`
4. Save

### Step 2 — Create Categories (as Admin)

Login as admin and go to `localhost:5173/admin/categories`, or use Thunder Client/Postman:

```
POST http://localhost:5001/api/v1/admin/categories
Authorization: Bearer ADMIN_TOKEN

{ "name": "Web Development", "slug": "web-development", "color": "#3b82f6" }
{ "name": "Data Science", "slug": "data-science", "color": "#8b5cf6" }
{ "name": "Design", "slug": "design", "color": "#ec4899" }
```

### Step 3 — Create an Instructor account

Register with `role: "instructor"` via the register page.

### Step 4 — Create and Publish a Course

1. Login as instructor → go to `/instructor/courses/create`
2. Fill in all 4 steps of the course wizard
3. Submit for review
4. Login as admin → go to `/admin/courses` → Approve the course

---

## API Endpoints

### Authentication
```
POST   /api/v1/auth/register       Register new user
POST   /api/v1/auth/login          Login
GET    /api/v1/auth/me             Get current user
PATCH  /api/v1/auth/me             Update profile
PATCH  /api/v1/auth/change-password Change password
```

### Courses
```
GET    /api/v1/courses             Get all courses (with filters)
GET    /api/v1/courses/:slug       Get course by slug
GET    /api/v1/courses/by-id/:id   Get course by ID
POST   /api/v1/courses             Create course (instructor)
PATCH  /api/v1/courses/:id         Update course (instructor)
DELETE /api/v1/courses/:id         Delete course (instructor)
PATCH  /api/v1/courses/:id/submit  Submit for review
GET    /api/v1/courses/my-courses  Get instructor's courses
GET    /api/v1/courses/analytics   Instructor analytics
```

### Enrollments
```
POST   /api/v1/enrollments/:courseId/enroll  Enroll in free course
GET    /api/v1/enrollments/my               Get my enrollments
GET    /api/v1/enrollments/:courseId/progress Get progress
PATCH  /api/v1/enrollments/:courseId/progress Update progress
POST   /api/v1/enrollments/:courseId/notes   Add note
DELETE /api/v1/enrollments/:courseId/notes/:noteId Delete note
```

### Upload
```
POST   /api/v1/upload/image        Upload image to Cloudinary
POST   /api/v1/upload/video        Upload video to Cloudinary
DELETE /api/v1/upload/delete       Delete from Cloudinary
```

### Admin
```
GET    /api/v1/admin/stats         Platform statistics
GET    /api/v1/admin/analytics     Charts data
GET    /api/v1/admin/users         All users
PATCH  /api/v1/admin/users/:id/role Change user role
PATCH  /api/v1/admin/users/:id/ban  Ban/unban user
GET    /api/v1/admin/courses/pending Pending courses
PATCH  /api/v1/admin/courses/:id/approve Approve course
PATCH  /api/v1/admin/courses/:id/reject  Reject course
GET    /api/v1/admin/categories    All categories
POST   /api/v1/admin/categories    Create category
```

---

## User Roles

| Role | Permissions |
|------|------------|
| **Student** | Browse courses, enroll (free), track progress, take notes, view certificates |
| **Instructor** | All student permissions + create/manage courses, view analytics |
| **Admin** | All permissions + approve courses, manage users, view platform analytics |

---

## Database Models

| Model | Description |
|-------|-------------|
| User | Students, instructors, admins with auth |
| Course | Course data with instructor, category refs |
| Section | Course chapters/sections |
| Lesson | Individual lessons with video URLs |
| Enrollment | Student-course enrollment with progress |
| Assignment | Course assignments with rubrics |
| Submission | Student assignment submissions |
| Review | Course ratings and reviews |
| Payment | Payment records (Razorpay/Stripe ready) |
| Notification | Real-time notification records |
| ForumPost | Course Q&A discussions |
| Certificate | Completion certificates |
| Category | Course categories |

---

## Environment Variables Reference

### Backend `.env`
```env
NODE_ENV=development
PORT=5001
CLIENT_URL=http://localhost:5173
MONGODB_URI=
JWT_SECRET=
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
RAZORPAY_KEY_ID=           # Optional: for payments
RAZORPAY_KEY_SECRET=       # Optional: for payments
SMTP_HOST=smtp.gmail.com   # Optional: for emails
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:5001
VITE_SOCKET_URL=http://localhost:5001
```

---

## Deployment Guide

### Frontend → Vercel
1. Push code to GitHub
2. Connect repo to [vercel.com](https://vercel.com)
3. Set root directory to `frontend`
4. Add environment variables
5. Deploy

### Backend → Render
1. Connect repo to [render.com](https://render.com)
2. Create Web Service, root directory: `backend`
3. Build command: `npm install`
4. Start command: `node src/server.js`
5. Add all `.env` variables
6. Deploy

### Database → MongoDB Atlas
- Already configured — just ensure IP whitelist includes `0.0.0.0/0` for production

---

## Screenshots

| Page | URL |
|------|-----|
| Landing Page | `/` |
| Course Catalog | `/courses` |
| Course Detail | `/courses/:slug` |
| Student Dashboard | `/dashboard` |
| Course Player | `/learn/:courseId` |
| Instructor Dashboard | `/instructor/dashboard` |
| Course Builder | `/instructor/courses/create` |
| Admin Panel | `/admin` |
| Admin Analytics | `/admin/analytics` |

---

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## Acknowledgements

- Design inspired by [Udemy](https://udemy.com) and [Coursera](https://coursera.org)
- Icons by [Lucide React](https://lucide.dev)
- UI components by [shadcn/ui](https://ui.shadcn.com)
- Charts by [Recharts](https://recharts.org)
- Stock images by [Unsplash](https://unsplash.com)

---
