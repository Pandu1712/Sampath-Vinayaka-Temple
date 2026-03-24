import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";

// Pages
import Home from "./pages/Home";
import Gallery from "./pages/Gallery";
import Events from "./pages/Events";
import Timings from "./pages/Timings";
import Login from "./pages/Login";

// Admin Pages
import AdminDashboard from "./pages/Admin/Dashboard";
import ManageGallery from "./pages/Admin/ManageGallery";
import ManageEvents from "./pages/Admin/ManageEvents";
import ManageTimings from "./pages/Admin/ManageTimings";
import ManageUsers from "./pages/Admin/ManageUsers";

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/events" element={<Events />} />
              <Route path="/timings" element={<Timings />} />
              <Route path="/login" element={<Login />} />
              
              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireSubAdmin>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/gallery"
                element={
                  <ProtectedRoute requireSubAdmin>
                    <ManageGallery />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/events"
                element={
                  <ProtectedRoute requireSubAdmin>
                    <ManageEvents />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/timings"
                element={
                  <ProtectedRoute requireSubAdmin>
                    <ManageTimings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute requireAdmin>
                    <ManageUsers />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}
