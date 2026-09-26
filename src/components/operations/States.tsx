import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { Toast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';

export interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading data...',
}) => {
  return (
    <div className="py-20 flex flex-col items-center justify-center text-center">
      <Spinner size="lg" />
      <p className="mt-4 text-sm text-surface-500 font-medium">{message}</p>
    </div>
  );
};

export interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No records found',
  description = 'Try adjusting your search criteria.',
  actionText,
  onAction,
}) => {
  return (
    <div className="py-16 flex flex-col items-center justify-center text-center p-8 bg-white border border-surface-200 rounded-card shadow-card">
      <div className="w-[44px] h-[44px] rounded-full bg-surface-100 text-surface-500 flex items-center justify-center mb-4 shadow-inner">
        <PackageOpen className="w-5 h-5" />
      </div>
      <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
      <p className="text-[13px] text-surface-500 mt-1 max-w-sm">{description}</p>
      {actionText && onAction && (
        <div className="mt-6">
          <Button variant="primary" size="sm" onClick={onAction} className="rounded-full px-5">
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
};

export interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => {
  return (
    <div className="py-12 space-y-4 max-w-lg mx-auto">
      <Toast message={message} type="error" />
      {onRetry && (
        <div className="flex justify-center">
          <Button variant="outline" size="sm" onClick={onRetry} className="rounded-full">
            Retry Loading
          </Button>
        </div>
      )}
    </div>
  );
};

