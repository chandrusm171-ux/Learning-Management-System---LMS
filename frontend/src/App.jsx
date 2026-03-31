import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import MainLayout from "@/layouts/MainLayout";
import DashboardLayout from "@/layouts/DashboardLayout";
import AdminLayout from "@/layouts/AdminLayout";
import Home from "@/pages/Home";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import CourseCatalog from "@/pages/courses/CourseCatalog";
import CourseDetail from "@/pages/courses/CourseDetail";
import StudentDashboard from "@/pages/student/Dashboard";
import InstructorDashboard from "@/pages/instructor/Dashboard";
import AdminDashboard from "@/pages/admin/Dashboard";
import CourseBuilder from "@/pages/instructor/CourseBuilder";
import CoursePlayer from "@/pages/courses/CoursePlayer";
import { useSocket } from '@/hooks/useSocket';

const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  const { isDark } = useUIStore();
  useSocket(); // initialize socket connection

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<CourseCatalog />} />
          <Route path="/courses/:slug" element={<CourseDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Student routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={["student", "instructor", "admin"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<StudentDashboard />} />
        </Route>

        <Route
          path="/my-courses"
          element={
            <ProtectedRoute roles={["student", "instructor", "admin"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<StudentDashboard />} />
        </Route>

        {/* Course Player — full screen, no dashboard sidebar */}
        <Route
          path="/learn/:courseId"
          element={
            <ProtectedRoute roles={["student", "instructor", "admin"]}>
              <CoursePlayer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/learn/:courseId/:lessonId"
          element={
            <ProtectedRoute roles={["student", "instructor", "admin"]}>
              <CoursePlayer />
            </ProtectedRoute>
          }
        />

        {/* Instructor routes */}
        <Route
          path="/instructor"
          element={
            <ProtectedRoute roles={["instructor", "admin"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<InstructorDashboard />} />
          <Route path="courses" element={<InstructorDashboard />} />
          <Route path="courses/create" element={<CourseBuilder />} />
          <Route path="courses/:id/edit" element={<CourseBuilder />} />
        </Route>

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminDashboard />} />
          <Route path="courses" element={<AdminDashboard />} />
          <Route path="categories" element={<AdminDashboard />} />
          <Route path="analytics" element={<AdminDashboard />} />{" "}
          {/* ADD THIS */}
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
