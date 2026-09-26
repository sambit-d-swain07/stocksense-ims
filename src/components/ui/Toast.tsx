import React from 'react';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'info', onClose }) => {
  const typeStyles = {
    success: 'bg-white text-leaf-text border-l-4 border-l-leaf border-surface-200',
    error: 'bg-white text-coral-text border-l-4 border-l-coral border-surface-200',
    info: 'bg-white text-brand-700 border-l-4 border-l-brand-600 border-surface-200',
  };

  return (
    <div
      className={`flex items-center justify-between p-4 mb-4 border rounded-xl shadow-pop text-xs font-semibold ${typeStyles[type]}`}
      role="alert"
    >
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 text-surface-400 hover:text-surface-700 focus:outline-none"
          aria-label="Close notification"
        >
          ×
        </button>
      )}
    </div>
  );
};
