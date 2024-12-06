import React, { Suspense } from 'react';
import { Auth } from './components/Auth';
import { Sidebar } from './components/Sidebar';
import { NoteList } from './components/NoteList';
import { LandingPage } from './components/LandingPage';
import { Footer } from './components/Footer';
import { AuthInitializer } from './components/AuthInitializer';
import { useSupabase } from './hooks/useSupabase';
import { Toaster } from 'react-hot-toast';

export default function App() {
  const { user } = useSupabase();

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
            <div className="flex h-screen bg-gray-50">
              <Sidebar />
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-auto">
                  <NoteList />
                </div>
                <div className="hidden sm:block">
                  <Footer showCredit={false} />
                </div>
              </div>
            </div>
          )}
        </AuthInitializer>
      </Suspense>
    </>
  );
}