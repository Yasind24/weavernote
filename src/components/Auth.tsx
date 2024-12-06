import React from 'react';
import { Auth as SupabaseAuth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabase';
import { Footer } from './Footer';

export function Auth() {
  // Use VITE_SUPABASE_REDIRECT_URL from environment variables if available, otherwise fallback to environment check
  const redirectUrl = import.meta.env.VITE_SUPABASE_REDIRECT_URL || 
    (import.meta.env.DEV ? 'http://localhost:5173' : 'https://weavernote.com');

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-8">Welcome to Weavernote</h1>
          <SupabaseAuth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#eab308',
                    brandAccent: '#ca8a04',
                  },
                },
              },
            }}
            providers={['google']}
            redirectTo={redirectUrl}
          />
        </div>
      </div>
      <Footer showCredit={true} />
    </div>
  );
}