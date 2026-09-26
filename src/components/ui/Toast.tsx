import React from 'react';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'info', onClose }) => {
  const typeStyles = {
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
  };

  return (
    <div
      className={`flex items-center justify-between p-4 mb-4 border rounded-xl shadow-sm text-sm ${typeStyles[type]}`}
      role="alert"
    >
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 font-bold hover:opacity-75 focus:outline-none"
          aria-label="Close"
        >
          ×
        </button>
      )}
    </div>
  );
};
