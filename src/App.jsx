// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useSession } from "@supabase/auth-helpers-react";

// Pages
import Landing from "./pages/Landing.jsx";
import Auth from "./pages/Auth.jsx";
import AuthCallback from "./pages/AuthCallback.jsx"; // ✅ NEW
import Dashboard from "./components/Dashboard.jsx";
import Library from "./pages/Library.jsx";
import Flashcards from "./pages/Flashcards.jsx";
import Quizzes from "./pages/Quizzes.jsx";
import Courses from "./pages/Courses.jsx";
import Subscriptions from "./pages/Subscriptions.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";

// ============================
// 🔐 PRIVATE ROUTE WRAPPERS
// ============================

// 🔒 Only logged-in users can access
function PrivateRoute({ children }) {
  const session = useSession();
  const currentUser = session?.user ?? null;
  return currentUser ? children : <Navigate to="/auth" replace />;
}

// 💎 Paid or Admin-only routes
function ProtectedContent({ children }) {
  const session = useSession();
  const currentUser = session?.user ?? null;
  const isAdmin = currentUser?.user_metadata?.isAdmin ?? false;
  const isPaid = currentUser?.user_metadata?.isPaid ?? false;

  return isAdmin || isPaid ? (
    children
  ) : (
    <div className="p-6 text-center text-gray-600">
      🔒 This feature is locked. Please subscribe to gain access.
    </div>
  );
}

// 🧠 Admin-only routes
function AdminRoute({ children }) {
  const session = useSession();
  const currentUser = session?.user ?? null;
  const isAdmin = currentUser?.user_metadata?.isAdmin ?? false;

  if (!currentUser) return <Navigate to="/auth" replace />;
  return isAdmin ? children : <Navigate to="/dashboard" replace />;
}

// ============================
// 🚀 MAIN APP
// ============================

function App() {
  const session = useSession();
  const currentUser = session?.user ?? null;

  return (
    <Routes>
      {/* 🏠 Landing Page */}
      <Route
        path="/"
        element={
          currentUser ? <Navigate to="/dashboard" replace /> : <Landing />
        }
      />

      {/* 🔑 Auth Page */}
      <Route
        path="/auth"
        element={
          currentUser ? <Navigate to="/dashboard" replace /> : <Auth />
        }
      />

      {/* ✅ OAuth Callback (handles Google redirect) */}
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* ============================ */}
      {/* 👤 PRIVATE ROUTES */}
      {/* ============================ */}

      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />

      <Route
        path="/flashcards"
        element={
          <PrivateRoute>
            <Flashcards />
          </PrivateRoute>
        }
      />

      <Route
        path="/quizzes"
        element={
          <PrivateRoute>
            <Quizzes />
          </PrivateRoute>
        }
      />

      {/* ============================ */}
      {/* 💎 PAID / ADMIN ROUTES */}
      {/* ============================ */}

      <Route
        path="/library"
        element={
          <PrivateRoute>
            <ProtectedContent>
              <Library />
            </ProtectedContent>
          </PrivateRoute>
        }
      />

      <Route
        path="/courses"
        element={
          <PrivateRoute>
            <ProtectedContent>
              <Courses />
            </ProtectedContent>
          </PrivateRoute>
        }
      />

      <Route
        path="/subscriptions"
        element={
          <PrivateRoute>
            <ProtectedContent>
              <Subscriptions />
            </ProtectedContent>
          </PrivateRoute>
        }
      />

      {/* ============================ */}
      {/* 🧠 ADMIN ROUTES */}
      {/* ============================ */}

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminPanel />
          </AdminRoute>
        }
      />

      <Route
        path="/admin-page"
        element={
          <AdminRoute>
            <AdminPage />
          </AdminRoute>
        }
      />

      {/* ============================ */}
      {/* ⚠️ CATCH-ALL ROUTE */}
      {/* ============================ */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
