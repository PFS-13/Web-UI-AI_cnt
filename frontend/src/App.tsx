// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Login, Register, Verification, AuthCallback, TellUsAboutYou, ResetPassword, InputPassword, NewPassword, ConversationHistory } from './pages';
import RootPage from './pages/RootPage';
import ChatPage from './pages/ChatPage';
import styles from './App.module.css';
import ProtectedRoute from './ProtectedRoute';
import FileUpload from './FileUpload';
// import ChangePasswordPage from './forgotpassword';

const App: React.FC = () => {
  return (
    <Router>
      <div className={styles.app}>
        <Routes>
          {/* Root route dengan conditional rendering */}
          <Route path="/" element={<RootPage />} />
          
          {/* Auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verification" element={<Verification />} />
          <Route path="/auth-callback" element={<AuthCallback />} />
          <Route path="/tell-us-about-you" element={<TellUsAboutYou />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/input-password" element={<InputPassword />} />
          <Route path="/new-password" element={<NewPassword />} />
          
          {/* Chat routes */}
          <Route path="/c/:id" element={
            <ProtectedRoute>
              <ChatPage mode="existing" />
            </ProtectedRoute>
          } />
          
          {/* Other routes */}
          <Route path="/file-upload" element={<FileUpload messageId={123} />} />
          <Route path="/chat" element={<ChatPage mode="new" />} />
          <Route path="/conversations" element={<ConversationHistory />} />
          
          {/* Legacy dashboard route - redirect to root */}
          <Route path="/dashboard" element={<RootPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;