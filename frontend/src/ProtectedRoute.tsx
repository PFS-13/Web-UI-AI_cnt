import React, { useEffect, useState } from "react";
import { Navigate, useLocation, useParams } from "react-router-dom";
import { authAPI } from "./services";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const { id } = useParams();

  useEffect(() => {
    let ignore = false;
    const checkAuth = async () => {
      try {
        const user = await authAPI.getMe(); // pastikan ambil data user
        if (!ignore) setUser(user);
      } catch {
        if (!ignore) setUser(null);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    checkAuth();
    return () => { ignore = true; };
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!user.is_active) {
    return <Navigate to="/verification" replace />;
  }

  if (!user.username) {
    return <Navigate to="/tell-us-about-you" replace />;
  }

  return <>{children}</>;
}
