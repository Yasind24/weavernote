import React, { useRef, useState } from 'react';
import { Auth } from './Auth';
import { HeroSection } from './landing/HeroSection';
import { FeaturesSection } from './landing/FeaturesSection';
import { CTASection } from './landing/CTASection';
import { ProblemSection } from './landing/ProblemSection';
import { BenefitsSection } from './landing/BenefitsSection';
import { PricingSection } from './landing/PricingSection';
import { Footer } from './Footer';

export function LandingPage() {
  const [showAuth, setShowAuth] = useState(false);
  const pricingRef = useRef<HTMLDivElement>(null);

  if (showAuth) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1">
        <HeroSection 
          onGetStarted={() => setShowAuth(true)} 
          pricingRef={pricingRef}
        />
        <ProblemSection />
        <FeaturesSection />
        <BenefitsSection />
        <PricingSection 
          ref={pricingRef} 
          onGetStarted={() => setShowAuth(true)} 
        />
        <CTASection onGetStarted={() => setShowAuth(true)} />
      </div>
      <Footer showCredit={true} />
    </div>
  );
}