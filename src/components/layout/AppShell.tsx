import React from 'react';
import { Navbar } from './Navbar';

export interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-surface-50 text-surface-900 font-sans antialiased">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="border-t border-surface-200 bg-white py-4 text-center text-xs text-surface-500">
        Odoo Hack Foundation Scaffold &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
};
