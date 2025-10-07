import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { HomePage } from './';
import LoadingSpinner from '../components/LoadingSpinner';
import ChatPage from './ChatPage';

const RootPage: React.FC = () => {
  const { loading, isAuthenticated } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <LoadingSpinner 
        size="large" 
        message="Checking authentication..." 
        className="fullScreen"
      />
    );
  }

  // Conditional rendering based on authentication status
  if (isAuthenticated) {
    // User is logged in, show chat interface (new conversation mode)
    return <ChatPage mode="new" />;
  }

  // User is not logged in, show homepage/landing page
  return <HomePage />;
};

export default RootPage;
