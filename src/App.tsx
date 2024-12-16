import { useEffect, useState } from 'react';
import useAuthStore from './store/authStore';
import { useSubscriptionStore } from './store/subscriptionStore';
import { LandingPage } from './components/LandingPage';
import { AppLayout } from './components/AppLayout';
import { Auth } from './components/Auth';
import { Suspense } from 'react';
import { Toaster } from 'react-hot-toast';

function App() {
  const { user, initialized, initializeAuth } = useAuthStore();
  const { hasActiveSubscription, isLoading, checkSubscription } = useSubscriptionStore();
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (user?.email) {
      checkSubscription(user.email);
      setShowAuth(false);
    }
  }, [user?.email, checkSubscription]);

  useEffect(() => {
    // Check for loading parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('loading') === 'true') {
      setPaymentLoading(true);
      // Remove the loading parameter
      urlParams.delete('loading');
      window.history.replaceState({}, '', `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ''}`);
      
      // Check subscription status periodically
      const checkInterval = setInterval(async () => {
        if (user?.email) {
          await checkSubscription(user.email);
          if (hasActiveSubscription) {
            setPaymentLoading(false);
            clearInterval(checkInterval);
          }
        }
      }, 3000);

      // Clear interval after 30 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        setPaymentLoading(false);
      }, 30000);

      return () => clearInterval(checkInterval);
    }
  }, [user?.email, hasActiveSubscription, checkSubscription]);

  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (paymentLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-500 mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800">Setting up your account...</h2>
        <p className="text-gray-600 mt-2">This may take a few moments</p>
      </div>
    );
  }

  if (showAuth) {
    return <Auth onClose={() => setShowAuth(false)} />;
  }

  return (
    <>
      <Toaster position="top-center" />
      <Suspense fallback={
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      }>
        {!user || !hasActiveSubscription || isLoading ? (
          <LandingPage onSignInClick={() => setShowAuth(true)} />
        ) : (
          <AppLayout />
        )}
      </Suspense>
    </>
  );
}

export default App;