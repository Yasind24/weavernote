import React, { Suspense, useEffect, useState } from 'react';
import { Auth } from './components/Auth';
import { Sidebar } from './components/Sidebar';
import { NoteList } from './components/NoteList';
import { LandingPage } from './components/LandingPage';
import { Footer } from './components/Footer';
import { AuthInitializer } from './components/AuthInitializer';
import { useSupabase } from './hooks/useSupabase';
import { Toaster } from 'react-hot-toast';
import { connectionManager } from './lib/supabaseConnection';

export default function App() {
  const { user } = useSupabase();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Initialize connection manager
  useEffect(() => {
    // Just accessing the connection manager is enough to initialize it
    connectionManager;
  }, []);

  return (
    <>
      <Toaster />
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500"></div>
        </div>
      }>
        <AuthInitializer>
          {!user ? (
            <LandingPage />
          ) : (
            <div className="flex h-screen bg-gray-50 overflow-x-hidden">
              <div className={`${isCollapsed ? 'w-16' : 'w-64'} flex-shrink-0 h-screen bg-white border-r border-gray-200 transition-all duration-300`}>
                <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
              </div>
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto">
                  <NoteList />
                </div>
                <div className={`hidden sm:block fixed bottom-0 right-0 transition-all duration-300 ${isCollapsed ? 'left-16' : 'left-64'} bg-white border-t`}>
                  <Footer showCredit={false} size="compact" />
                </div>
              </div>
            </div>
          )}
        </AuthInitializer>
      </Suspense>
    </>
  );
}