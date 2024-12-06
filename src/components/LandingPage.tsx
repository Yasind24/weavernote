import React, { useState } from 'react';
import { Auth } from './Auth';
import { HeroSection } from './landing/HeroSection';
import { FeaturesSection } from './landing/FeaturesSection';
import { CTASection } from './landing/CTASection';
import { ProblemSection } from './landing/ProblemSection';
import { BenefitsSection } from './landing/BenefitsSection';
import { Footer } from './Footer';

export function LandingPage() {
  const [showAuth, setShowAuth] = useState(false);

  if (showAuth) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1">
        <HeroSection onGetStarted={() => setShowAuth(true)} />
        <ProblemSection />
        <BenefitsSection />
        <FeaturesSection />
        <CTASection onGetStarted={() => setShowAuth(true)} />
      </div>
      <Footer showCredit={true} />
    </div>
  );
}