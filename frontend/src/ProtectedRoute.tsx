// ProtectedRoute.tsx
import React, { useEffect, useState } from "react";
import { Navigate, useLocation, useParams } from "react-router-dom";
import { authAPI } from "./services";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const location = useLocation();
  const { id } = useParams();

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        const currentUser = await authAPI.getMe();
        const ok = !!currentUser && Object.keys(currentUser).length > 0;
        if (mounted) setIsAuthenticated(ok);
      } catch (err) {
        if (mounted) setIsAuthenticated(false);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [id]);

  // Loading state while mengecek autentikasi
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Checking authentication...</p>
      </div>
    );
  }

  // Jika belum authenticated -> redirect ke /login (simpan lokasi awal di state)
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Jika authenticated -> render children (halaman yang diproteksi)
  return <>{children}</>;
}
