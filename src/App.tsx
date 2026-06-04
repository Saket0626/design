import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { AuthProvider } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import { LoginPage, SignupPage } from "./pages/AuthPages";
import { CategoryPage, NewCategoryPage } from "./pages/CategoryPages";
import { DesignerPage } from "./pages/DesignerPage";
import { ExplorePage } from "./pages/ExplorePage";
import { FeedPage } from "./pages/FeedPage";
import { ProfileEditPage } from "./pages/ProfileEditPage";
import { ProfilePage } from "./pages/ProfilePage";
import { WorkshopPage } from "./pages/WorkshopPage";

function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<FeedPage />} />
        <Route path="explore" element={<ExplorePage />} />
        <Route path="workshop" element={<WorkshopPage />} />
        <Route path="workshop/:roomId" element={<WorkshopPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="profile/edit" element={<ProfileEditPage />} />
        <Route path="profile/categories/new" element={<NewCategoryPage />} />
        <Route path="category/:slug" element={<CategoryPage />} />
        <Route path="designer/:username" element={<DesignerPage />} />
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
