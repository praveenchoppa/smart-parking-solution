import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingState({ message = 'Loading...', fullScreen = false }) {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="p-3.5 bg-brand-500/10 rounded-2xl text-brand-600 dark:text-brand-400 mb-3 animate-bounce">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
      <p className="text-xs font-bold text-slate-600 dark:text-slate-300 tracking-wide uppercase">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}
