import { Routes, Route, Navigate, useLocation } from "react-router-dom";
<<<<<<< HEAD
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
=======
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
>>>>>>> 7c98477d3d428d3dc4275f5222ce141a91c64676
import AppLayout from "@/layouts/AppLayout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Employees from "@/pages/Employees";
import EmployeeProfile from "@/pages/EmployeeProfile";
import NewEmployee from "@/pages/NewEmployee";
import Attendance from "@/pages/Attendance";
import TimeOff from "@/pages/TimeOff";
import Payroll from "@/pages/Payroll";
import Settings from "@/pages/Settings";
import { PageLoader } from "@/components/ui/Feedback";
import type { Role } from "@/types";

function Protected({ children, roles }: { children: React.ReactNode; roles?: Role[] }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route element={<Protected><AppLayout /></Protected>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<EmployeeProfile />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/time-off" element={<TimeOff />} />
        <Route path="/employees" element={<Protected roles={["hr_officer", "admin"]}><Employees /></Protected>} />
        <Route path="/employees/new" element={<Protected roles={["admin"]}><NewEmployee /></Protected>} />
        <Route path="/employees/:id" element={<EmployeeProfile />} />
        <Route path="/payroll" element={<Protected roles={["admin"]}><Payroll /></Protected>} />
        <Route path="/settings" element={<Protected roles={["admin"]}><Settings /></Protected>} />
      </Route>
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ToastProvider>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> 7c98477d3d428d3dc4275f5222ce141a91c64676
