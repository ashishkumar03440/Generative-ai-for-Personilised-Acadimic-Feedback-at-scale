import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import StudentDashboard from "./pages/student/StudentDashboard";
import AssignmentList from "./pages/student/AssignmentList";
import SubmissionPage from "./pages/student/SubmissionPage";
import FeedbackView from "./pages/student/FeedbackView";
import ProgressDashboard from "./pages/student/ProgressDashboard";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import AssignmentCreator from "./pages/teacher/AssignmentCreator";
import ReviewEditor from "./pages/teacher/ReviewEditor";
import ClassAnalytics from "./pages/teacher/ClassAnalytics";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import AIMonitor from "./pages/admin/AIMonitor";
import AuditLog from "./pages/admin/AuditLog";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) return <Navigate to={`/${user.role}`} replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to={`/${user!.role}`} replace /> : <HomePage />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to={`/${user!.role}`} replace /> : <LoginPage />} />

      <Route path="/student" element={<ProtectedRoute allowedRoles={["student"]}><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/assignments" element={<ProtectedRoute allowedRoles={["student"]}><AssignmentList /></ProtectedRoute>} />
      <Route path="/student/submit" element={<ProtectedRoute allowedRoles={["student"]}><SubmissionPage /></ProtectedRoute>} />
      <Route path="/student/feedback" element={<ProtectedRoute allowedRoles={["student"]}><FeedbackView /></ProtectedRoute>} />
      <Route path="/student/progress" element={<ProtectedRoute allowedRoles={["student"]}><ProgressDashboard /></ProtectedRoute>} />

      <Route path="/teacher" element={<ProtectedRoute allowedRoles={["teacher"]}><TeacherDashboard /></ProtectedRoute>} />
      <Route path="/teacher/create" element={<ProtectedRoute allowedRoles={["teacher"]}><AssignmentCreator /></ProtectedRoute>} />
      <Route path="/teacher/review" element={<ProtectedRoute allowedRoles={["teacher"]}><ReviewEditor /></ProtectedRoute>} />
      <Route path="/teacher/analytics" element={<ProtectedRoute allowedRoles={["teacher"]}><ClassAnalytics /></ProtectedRoute>} />

      <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["admin"]}><UserManagement /></ProtectedRoute>} />
      <Route path="/admin/ai" element={<ProtectedRoute allowedRoles={["admin"]}><AIMonitor /></ProtectedRoute>} />
      <Route path="/admin/audit" element={<ProtectedRoute allowedRoles={["admin"]}><AuditLog /></ProtectedRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
