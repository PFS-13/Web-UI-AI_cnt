// src/ProtectedRoute.tsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const { user } = useAuth();

  // 🔒 Belum login → redirect ke /login
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 🚫 Belum verifikasi email
  if (!user.is_active) {
    return (
      <Navigate
        to="/verification"
        replace
        state={{ email: user.email }}
      />
    );
  }

  // 🧩 Belum lengkapi profil (username kosong)
  if (!user.username) {
    return <Navigate to="/tell-us-about-you" replace />;
  }

  // ✅ Lolos semua pengecekan → render halaman
  return <>{children}</>;
}
