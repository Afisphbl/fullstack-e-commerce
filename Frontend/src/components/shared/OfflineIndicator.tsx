import React from 'react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
      <div className="flex items-center gap-2 rounded-lg border border-destructive bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive shadow-lg backdrop-blur">
        <WifiOff className="h-4 w-4" />
        <span>You are offline</span>
      </div>
    </div>
  );
};
