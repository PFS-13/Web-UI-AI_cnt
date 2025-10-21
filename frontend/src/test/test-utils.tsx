import React, { type ReactElement } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from '../contexts/ToastContext';

// Mock AuthContext
const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <div data-testid="mock-auth-provider">
      {children}
    </div>
  );
};

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  withRouter?: boolean;
  withToast?: boolean;
  withAuth?: boolean;
}

const AllTheProviders = ({ 
  children, 
  withRouter = true, 
  withToast = true, 
  withAuth = true 
}: { 
  children: React.ReactNode;
  withRouter?: boolean;
  withToast?: boolean;
  withAuth?: boolean;
}) => {
  let content = children;

  if (withAuth) {
    content = <MockAuthProvider>{content}</MockAuthProvider>;
  }

  if (withToast) {
    content = <ToastProvider>{content}</ToastProvider>;
  }

  if (withRouter) {
    content = <BrowserRouter>{content}</BrowserRouter>;
  }

  return <>{content}</>;
};

const customRender = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const {
    withRouter = true,
    withToast = true,
    withAuth = true,
    ...renderOptions
  } = options;

  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders 
        withRouter={withRouter} 
        withToast={withToast} 
        withAuth={withAuth}
      >
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  });
};

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };
