import { useRef, useState, useEffect } from 'react';
import { HeroSection } from './landing/HeroSection';
import { FeaturesSection } from './landing/FeaturesSection';
import { CTASection } from './landing/CTASection';
import { ProblemSection } from './landing/ProblemSection';
import { BenefitsSection } from './landing/BenefitsSection';
import { PricingSection } from './landing/PricingSection';
import { Footer } from './Footer';
import useAuthStore from '../store/authStore';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { toast } from 'react-hot-toast';
import { ArrowUp } from 'lucide-react';

interface LandingPageProps {
  onSignInClick: () => void;
}

export function LandingPage({ onSignInClick }: LandingPageProps) {
  const { user } = useAuthStore();
  const { hasActiveSubscription } = useSubscriptionStore();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const pricingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGetStarted = () => {
    if (user && !hasActiveSubscription) {
      // If logged in but no subscription, scroll to pricing
      pricingRef.current?.scrollIntoView({ behavior: 'smooth' });
      toast.error('Please subscribe to access the app');
    } else if (!user) {
      onSignInClick();
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1">
        <HeroSection 
          onGetStarted={handleGetStarted} 
          pricingRef={pricingRef}
        />
        <ProblemSection />
        <FeaturesSection />
        <BenefitsSection />
        <div ref={pricingRef}>
          <PricingSection />
        </div>
        <CTASection onGetStarted={handleGetStarted} />
      </div>
      <Footer showCredit={true} />

      {/* Floating Go to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 p-3 rounded-full bg-yellow-500 text-white shadow-lg hover:bg-yellow-600 transition-all duration-300 transform hover:scale-110 focus:outline-none ${
          showScrollTop ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
        }`}
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-6 h-6" />
      </button>
    </div>
  );
}