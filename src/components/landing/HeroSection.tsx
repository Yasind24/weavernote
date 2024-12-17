import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useSubscriptionStore } from '../../store/subscriptionStore';
import toast from 'react-hot-toast';
import { Logo } from '../Logo';
import { openCheckout } from '../../lib/lemonsqueezy';

// Add Google logo SVG component
interface GoogleLogoProps {
  className?: string;
}

const GoogleLogo: React.FC<GoogleLogoProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="currentColor"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="currentColor"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="currentColor"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

// Add Spinner component
const Spinner = () => (
  <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

// Add these product images (adjust paths and add more as needed)
const productImages = [
  {
    src: "../media/Visualizer.png",
    alt: "Weavernote Knowledge Graph"
  },
  {
    src: "/media/AI studio.png",
    alt: "Weavernote AI Assistant"
  },
  {
    src: "/media/OrganizeBetter.png",
    alt: "Weavernote organization"
  },
  {
    src: "../media/Customize.png",
    alt: "Weavernote Note Taking"
  },
  {
    src: "../media/Search and tag.png",
    alt: "Weavernote Search"
  },
  {
    src: "../media/Distraction free.png",
    alt: "Weavernote read mode"
  }
];

interface HeroSectionProps {
  pricingRef: React.RefObject<HTMLDivElement>;
  onGetStarted: () => void;
}

export function HeroSection({ pricingRef, onGetStarted }: HeroSectionProps) {
  const { session, signInWithGoogle } = useAuth();
  const { hasActiveSubscription, checkSubscription } = useSubscriptionStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (session?.user?.email) {
      checkSubscription(session.user.email);
    }
  }, [session?.user?.email, checkSubscription]);

  const handleCheckout = async () => {
    if (!session?.user) {
      try {
        await signInWithGoogle();
      } catch (error) {
        console.error('Sign in error:', error);
        toast.error('Failed to sign in');
      }
      return;
    }

    if (!session.user.email) {
      toast.error('Unable to proceed: Email is required');
      return;
    }

    if (hasActiveSubscription) {
      return;
    }

    openCheckout({
      userId: session.user.id,
      userEmail: session.user.email,
      onSuccess: async () => {
        toast.success('Thank you for your purchase!');
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 5000));
        await checkSubscription(session.user.email!);
        if (!hasActiveSubscription) {
          toast('Your subscription is being processed. Please refresh the page in a few moments.', {
            icon: 'ℹ️',
            duration: 5000
          });
          setIsLoading(false);
        } else {
          window.location.reload();
        }
      },
      onError: () => {
        toast.error('Error occurred during checkout');
        setIsLoading(false);
      }
    });
  };

  const getButtonContent = () => {
    if (isLoading) {
      return (
        <>
          <Spinner />
          Loading Your App...
        </>
      );
    }
    
    if (!session?.user) {
      return (
        <>
          <GoogleLogo className="w-5 h-5 mr-2" />
          Sign In to Continue
        </>
      );
    }
    
    if (hasActiveSubscription) {
      return 'Open App';
    }
    
    return 'Get Lifetime Access';
  };

  return (
    <div className="relative bg-white overflow-hidden">
      {isVideoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75" onClick={() => setIsVideoOpen(false)}>
          <div className="relative w-full max-w-4xl mx-4 aspect-video">
            <button 
              className="absolute -top-8 right-0 text-white hover:text-gray-300"
              onClick={() => setIsVideoOpen(false)}
            >
              Close
            </button>
            <iframe
              className="w-full h-full rounded-lg"
              src="https://www.youtube.com/embed/PL7m8UXvBAM"
              title="Weavernote Demo"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:pb-28 xl:pb-32 bg-white lg:bg-transparent">
          <div className="pt-6 px-4 sm:px-6 lg:px-8">
            <Logo size="large" className="mx-auto lg:mx-0" />
          </div>

          <main className="mt-8 sm:mt-12 md:mt-16 px-4 sm:px-6 lg:px-8">
            <div className="text-center lg:text-left lg:grid lg:grid-cols-12 lg:gap-12">
              <div className="lg:col-span-5">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block">Weave Your Notes into Knowledge.</span>
                  <span className="block text-yellow-500 text-3xl md:text-4xl mt-3">
                    Smarter, Faster, Better.
                  </span>
                </h1>
                
                <div className="mt-6 space-y-4">
                  <p className="text-lg text-gray-600 sm:text-xl">
                    Weavernote is your ultimate platform to effortlessly organize, connect, and visualize your notes—powered by AI to be your personal knowledge companion.
                  </p>
                  <p className="text-lg text-gray-600 sm:text-xl">
                    Perfect for students, creators, and lifelong learners.
                  </p>
                </div>

                <div className="mt-8 flex justify-center lg:justify-start">
                  <button
                    onClick={onGetStarted}
                    className="rounded-md px-8 py-3 text-base font-medium text-white bg-yellow-500 hover:bg-yellow-600 md:py-4 md:text-lg md:px-10 transform transition-all hover:scale-105 shadow-md inline-flex items-center justify-center disabled:opacity-75 disabled:cursor-wait w-full sm:w-auto"
                    disabled={isLoading}
                  >
                    {getButtonContent()}
                  </button>
                </div>
              </div>
              <div className="mt-12 lg:mt-0 lg:col-span-7">
                <div className="space-y-6">
                  <div className="relative">
                    <img
                      src={productImages[currentImageIndex].src}
                      alt={productImages[currentImageIndex].alt}
                      className="w-full shadow-lg"
                    />
                    <div className="absolute inset-x-0 bottom-4 flex justify-center space-x-2">
                      {productImages.map((_, index) => (
                        <button
                          key={index}
                          className={`w-2 h-2 rounded-full ${
                            index === currentImageIndex ? 'bg-yellow-500' : 'bg-gray-300'
                          }`}
                          onClick={() => setCurrentImageIndex(index)}
                        />
                      ))}
                    </div>
                    <button
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 hover:bg-white shadow-md"
                      onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? productImages.length - 1 : prev - 1))}
                    >
                      ←
                    </button>
                    <button
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 hover:bg-white shadow-md"
                      onClick={() => setCurrentImageIndex((prev) => (prev === productImages.length - 1 ? 0 : prev + 1))}
                    >
                      →
                    </button>
                  </div>

                  <button
                    onClick={() => setIsVideoOpen(true)}
                    className="w-full py-3 px-4 inline-flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors shadow-sm"
                  >
                    <div className="w-8 h-8 bg-[#FF0000] rounded-lg flex items-center justify-center mr-2">
                      <svg height="100%" version="1.1" viewBox="0 0 68 48" width="100%">
                        <path className="fill-white" d="M 45,24 27,14 27,34" />
                      </svg>
                    </div>
                    <span className="font-medium">Watch Demo Video</span>
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}