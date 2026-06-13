import type { ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { AuthProvider, useAuth } from "./context/AuthContext";
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

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[calc(100dvh-3.5rem)] items-center justify-center text-charcoal/60">
        Loading account...
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
            <RequireAuth>
              <WorkshopPage />
            </RequireAuth>
          }
        />
        <Route
          path="workshop/:roomId"
          element={
            <RequireAuth>
              <WorkshopPage />
            </RequireAuth>
          }
        />
        <Route
          path="profile"
          element={
            <RequireAuth>
              <ProfilePage />
            </RequireAuth>
          }
        />
        <Route
          path="profile/edit"
          element={
            <RequireAuth>
              <ProfileEditPage />
            </RequireAuth>
          }
        />
        <Route
          path="profile/categories/new"
          element={
            <RequireAuth>
              <NewCategoryPage />
            </RequireAuth>
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
