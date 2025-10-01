// ProtectedRoute.tsx
import React, { useEffect, useState } from "react";
import { Navigate, useLocation, useParams } from "react-router-dom";
import { authAPI } from "./services";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const location = useLocation();
  const { id } = useParams();
  useEffect(() => {
    let ignore = false;
    const checkAuth = async () => {
      try {
        const currentUser = await authAPI.getMe();
        if (!ignore) setUser(currentUser);
      } catch {
        if (!ignore) setUser(null);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    checkAuth();
    return () => {
      ignore = true;
    };
  }, [id]);

console.log("ProtectedRoute - user:", user, "loading:", loading);
  // 🔄 Loading state (rapih + spinner)
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-600">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-lg font-medium">Checking authentication...</p>
      </div>
    );
  }

  // 🔒 Jika belum login → redirect ke /login
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  // 📲 Jika sudah login tapi belum OTP verified → /verify-otp
  if (!user.is_active) {
    return <Navigate to="/verify-otp" replace />;
  }
  // 📝 Jika sudah aktif tapi belum isi username → /tell-us-about-you
  // if (!!user.username) {
  //   return <Navigate to="/tell-us-about-you" replace />;
  // }

  // ✅ Jika semua beres → render children
  return <>{children}</>;
}
