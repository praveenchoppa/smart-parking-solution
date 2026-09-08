import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from './common/Button';

export default function ErrorState({
  title = 'Something went wrong',
  message = 'Unable to fetch data from the server.',
  onRetry
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-red-500/5 border border-red-500/20 rounded-3xl">
      <div className="p-3 bg-red-500/10 rounded-2xl text-red-500 mb-3">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h3 className="text-base font-bold text-red-900 dark:text-red-300 mb-1">{title}</h3>
      <p className="text-xs text-red-700/80 dark:text-red-400 max-w-sm mb-5">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="danger" size="sm" icon={RefreshCw}>
          Retry Request
        </Button>
      )}
    </div>
  );
}
