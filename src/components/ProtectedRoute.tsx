import { Navigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function ProtectedRoute({ 
  children, 
  requireAdmin = false,
  requireSubAdmin = false 
}: { 
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireSubAdmin?: boolean;
}) {
  const { user, loading, isAdmin, isSubAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-temple-cream">
        <div className="w-12 h-12 border-4 border-temple-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" />;
  }

  if (requireSubAdmin && !isSubAdmin) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}
