import React, { createContext, useContext } from 'react';
import { Book, User, AppSettings } from '../types';

interface AppContextType {
  books: Book[];
  setBooks: (books: Book[]) => void;
  currentBook: Book | null;
  setCurrentBook: (book: Book | null) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  settings: AppSettings;
  setSettings: (settings: AppSettings) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export { AppContext };

export const AppProvider: React.FC<{
  value: AppContextType;
  children: React.ReactNode;
}> = ({ value, children }) => {
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};