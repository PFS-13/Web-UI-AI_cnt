// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage, Login, Register, Verification, AuthCallback, TellUsAboutYou, ResetPassword, InputPassword, NewPassword, Dashboard, ChatPage, ConversationHistory } from './pages';
import styles from './App.module.css';
import ProtectedRoute from './ProtectedRoute';
import ChatIdPage from './pages/chat/[id]/Page';
// import ChangePasswordPage from './forgotpassword';
const App: React.FC = () => {
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
          <Route path="/tell-us-about-you" element={<TellUsAboutYou />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/input-password" element={<InputPassword />} />
          <Route path="/new-password" element={<NewPassword />} />
          <Route path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }></Route>

            <Route path="/c/:id" element={
                <ProtectedRoute>
                  <ChatIdPage />
                </ProtectedRoute>
              } />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/conversations" element={<ConversationHistory />} />
          {/* Arahkan semua rute yang tidak cocok ke halaman dashboard */}
          {/* <Route path="*" element={<Navigate to="/dashboard" replace />} /> */}
        </Routes>
      </div>
    </Router>
  );
};

export default App;