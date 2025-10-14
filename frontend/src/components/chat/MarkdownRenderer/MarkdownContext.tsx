import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface MarkdownContextType {
  lastOrderedListNumber: number;
  setLastOrderedListNumber: (number: number) => void;
  resetNumbering: () => void;
}

const MarkdownContext = createContext<MarkdownContextType | undefined>(undefined);

export const useMarkdownContext = () => {
  const context = useContext(MarkdownContext);
  if (!context) {
    throw new Error('useMarkdownContext must be used within a MarkdownProvider');
  }
  return context;
};

interface MarkdownProviderProps {
  children: ReactNode;
}

export const MarkdownProvider: React.FC<MarkdownProviderProps> = ({ children }) => {
  const [lastOrderedListNumber, setLastOrderedListNumber] = useState<number>(0);

  const resetNumbering = () => {
    setLastOrderedListNumber(0);
  };

  return (
    <MarkdownContext.Provider value={{
      lastOrderedListNumber,
      setLastOrderedListNumber,
      resetNumbering
    }}>
      {children}
    </MarkdownContext.Provider>
  );
};
