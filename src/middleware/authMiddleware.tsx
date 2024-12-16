import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (session?.session?.user) {
        const { data: subscription } = await supabase
          .from('user_subscriptions')
          .select('subscription_status')
          .eq('user_id', session.session.user.id)
          .single();

        setIsAuthenticated(true);
        setHasSubscription(subscription?.subscription_status === 'active');
      } else {
        setIsAuthenticated(false);
        setHasSubscription(false);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setIsAuthenticated(false);
      setHasSubscription(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500"></div>
    </div>;
  }

  if (!isAuthenticated || !hasSubscription) {
    window.location.href = '/';
    return null;
  }

  return <>{children}</>;
}
