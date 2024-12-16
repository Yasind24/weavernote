import React from 'react';
import useAuthStore from '../store/authStore';

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { initialized } = useAuthStore();

  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return children;
}