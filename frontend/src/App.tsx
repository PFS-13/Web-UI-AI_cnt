// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { 
  Login, 
  Register, 
  Verification, 
  AuthCallback, 
  TellUsAboutYou, 
  ResetPassword, 
  InputPassword, 
  NewPassword, 
  ConversationHistory,
  ChatPage,
  RootPage
} from './pages/LazyPages';
import styles from './App.module.css';
import ProtectedRoute from './ProtectedRoute';
import FileUpload from './FileUpload';
import { ErrorBoundary, ToastContainer } from './components/common';
import { ToastProvider } from './contexts/ToastContext';
import LazyWrapper from './components/LazyWrapper';
// import ChangePasswordPage from './forgotpassword';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <Router>
          <div className={styles.app}>
            <Routes>
              {/* Root route dengan conditional rendering */}
              <Route path="/" element={
                <LazyWrapper>
                  <RootPage />
                </LazyWrapper>
              } />
              
              {/* Auth routes */}
              <Route path="/login" element={
                <LazyWrapper>
                  <Login />
                </LazyWrapper>
              } />
              <Route path="/register" element={
                <LazyWrapper>
                  <Register />
                </LazyWrapper>
              } />
              <Route path="/verification" element={
                <LazyWrapper>
                  <Verification />
                </LazyWrapper>
              } />
              <Route path="/auth-callback" element={
                <LazyWrapper>
                  <AuthCallback />
                </LazyWrapper>
              } />
              <Route path="/tell-us-about-you" element={
                <LazyWrapper>
                  <TellUsAboutYou />
                </LazyWrapper>
              } />
              <Route path="/reset-password" element={
                <LazyWrapper>
                  <ResetPassword />
                </LazyWrapper>
              } />
              <Route path="/input-password" element={
                <LazyWrapper>
                  <InputPassword />
                </LazyWrapper>
              } />
              <Route path="/new-password" element={
                <LazyWrapper>
                  <NewPassword />
                </LazyWrapper>
              } />
              
              {/* Chat routes */}
              <Route path="/c/:id" element={
                <ProtectedRoute>
                  <LazyWrapper>
                    <ChatPage mode="existing" />
                  </LazyWrapper>
                </ProtectedRoute>
              } />
              
              {/* Other routes */}
              <Route path="/file-upload" element={<FileUpload messageId={123} />} />
              <Route path="/chat" element={
                <LazyWrapper>
                  <ChatPage mode="new" />
                </LazyWrapper>
              } />
              <Route path="/conversations" element={
                <LazyWrapper>
                  <ConversationHistory />
                </LazyWrapper>
              } />
              
              {/* Legacy dashboard route - redirect to root */}
              {/* <Route path="/dashboard" element={<RootPage />} /> */}
            </Routes>
          </div>
          <ToastContainer />
        </Router>
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default App;