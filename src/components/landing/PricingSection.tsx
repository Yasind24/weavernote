import React from 'react';
import { Check } from 'lucide-react';
import { openCheckout } from '../../lib/lemonsqueezy';
import useAuthStore from '../../store/authStore';
import { useAuth } from '../../hooks/useAuth';
import { useSubscriptionStore } from '../../store/subscriptionStore';
import { toast } from 'react-hot-toast';

export const PricingSection = React.forwardRef<HTMLDivElement>((_, ref) => {
  const { user } = useAuthStore();
  const { signInWithGoogle } = useAuth();
  const { hasActiveSubscription, checkSubscription } = useSubscriptionStore();

  const handleClick = async () => {
    try {
      if (!user) {
        await signInWithGoogle();
        return;
      }

      if (!user.email) {
        toast.error('Unable to proceed: Email is required');
        return;
      }

      if (hasActiveSubscription) {
        return;
      }

      // User is logged in but no subscription, proceed to checkout
      openCheckout({
        userId: user.id,
        userEmail: user.email,
        onSuccess: async () => {
          toast.success('Thank you for your purchase!');
          // Add longer delay since Make.com needs time to process
          await new Promise(resolve => setTimeout(resolve, 5000));
          // Check subscription status
          await checkSubscription(user.email!);
          if (!hasActiveSubscription) {
            toast('Your subscription is being processed. Please refresh the page in a few moments.', {
              icon: 'ℹ️',
              duration: 5000
            });
          }
        },
        onError: () => {
          toast.error('Error occurred during checkout');
        }
      });
    } catch (error) {
      console.error('Error in subscription flow:', error);
      toast.error('Something went wrong. Please try again.');
    }
  };

  // Determine button text based on user and subscription status
  const getButtonText = () => {
    if (!user) return 'Sign in to Continue';
    if (hasActiveSubscription) return 'Access Your Account';
    return 'Get Lifetime Access';
  };

  return (
    <div id="pricing" ref={ref} className="bg-gray-50 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            Special Launch Offer
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Get lifetime access to Weavernote at an unbeatable price
          </p>
        </div>

        <div className="relative mx-auto max-w-3xl">
          {/* Background decoration */}
          <div className="absolute inset-0 transform -skew-y-6 bg-yellow-100 rounded-3xl" />
          
          <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-yellow-500" />
            
            <div className="px-8 py-12 sm:p-16">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-block bg-yellow-100 rounded-full px-4 py-1 mb-4">
                  <span className="text-yellow-800 font-medium">Only 100 spots available!</span>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  Lifetime Access Pass
                </h3>
                <div className="flex justify-center items-baseline mb-4">
                  <span className="text-5xl font-bold text-gray-900">$100</span>
                  <span className="ml-2 text-gray-500">one-time payment</span>
                </div>
              </div>

              {/* Features grid */}
              <div className="grid sm:grid-cols-2 gap-6 mb-8">
                {[
                  "Lifetime access to your notes",
                  "No subscription required",
                  "Unlimited Notes & Visualizations",
                  "All AI features fully unlocked",
                  "Free updates for current features",
                  "Priority access to upcoming upgrades"
                ].map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 flex-shrink-0 text-yellow-500 mt-1" />
                    <span className="text-gray-600">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <div className="text-center">
                <button
                  onClick={handleClick}
                  className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 text-lg font-semibold text-white bg-yellow-500 rounded-xl hover:bg-yellow-600 transition-all hover:scale-105 shadow-lg"
                >
                  {getButtonText()}
                </button>
                <p className="mt-4 text-sm text-gray-500">
                  Secure checkout • Instant access • No recurring payments
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});