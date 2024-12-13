import React, { useRef, useState } from 'react';
import { Auth } from './Auth';
import { HeroSection } from './landing/HeroSection';
import { FeaturesSection } from './landing/FeaturesSection';
import { CTASection } from './landing/CTASection';
import { ProblemSection } from './landing/ProblemSection';
import { BenefitsSection } from './landing/BenefitsSection';
import { PricingSection } from './landing/PricingSection';
import { Footer } from './Footer';
import useAuthStore from '../store/authStore';

export function LandingPage() {
  const [showAuth, setShowAuth] = useState(false);
  const { initialized } = useAuthStore();
  const pricingRef = useRef<HTMLDivElement>(null);

  // Don't render anything until auth is initialized
  if (!initialized) {
    return null;
  }

  if (showAuth) {
    return <Auth />;
  }

  const handleGetStarted = () => {
    setShowAuth(true);
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
        <PricingSection 
          ref={pricingRef} 
          onGetStarted={handleGetStarted}
        />
        <CTASection onGetStarted={handleGetStarted} />
      </div>
      <Footer showCredit={true} />
    </div>
  );
}