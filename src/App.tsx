import type { ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import { AuthCallbackPage } from "./pages/AuthCallbackPage";
import { LoginPage, SignupPage } from "./pages/AuthPages";
import { CategoryPage, NewCategoryPage } from "./pages/CategoryPages";
import { DesignerPage } from "./pages/DesignerPage";
import { ExplorePage } from "./pages/ExplorePage";
import { FeedPage } from "./pages/FeedPage";
import { ProfileEditPage } from "./pages/ProfileEditPage";
import { ProfilePage } from "./pages/ProfilePage";
import { WorkshopPage } from "./pages/WorkshopPage";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4 text-center text-charcoal/70">
        Loading your account...
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<FeedPage />} />
        <Route path="explore" element={<ExplorePage />} />
        <Route
          path="workshop"
          element={
            <ProtectedRoute>
              <WorkshopPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="workshop/:roomId"
          element={
            <ProtectedRoute>
              <WorkshopPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile/edit"
          element={
            <ProtectedRoute>
              <ProfileEditPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile/categories/new"
          element={
            <ProtectedRoute>
              <NewCategoryPage />
            </ProtectedRoute>
          }
        />
        <Route path="category/:slug" element={<CategoryPage />} />
        <Route path="designer/:username" element={<DesignerPage />} />
        <Route path="auth/callback" element={<AuthCallbackPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <AppRoutes />
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
