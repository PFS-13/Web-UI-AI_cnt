// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage, Login, Register, Verification, AuthCallback, Dashboard, ChatPage, ConversationHistory } from './pages';
import styles from './App.module.css';

const App: React.FC = () => {
  // Menghapus hook useAuth karena tidak lagi diperlukan
  // const { isAuthenticated, isLoading } = useAuth();
  
  // Menghapus kondisi loading screen
  /*
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading...</p>
      </div>
    );
  }
  */

  return (
    <Router>
      <div className={styles.app}>
        <Routes>
          {/* Semua halaman sekarang bisa diakses tanpa syarat autentikasi */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verification" element={<Verification />} />
          <Route path="/auth-callback" element={<AuthCallback />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/conversations" element={<ConversationHistory />} />
          
          {/* Arahkan semua rute yang tidak cocok ke halaman dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;