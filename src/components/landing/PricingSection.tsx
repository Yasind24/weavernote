import React from 'react';
import { Check } from 'lucide-react';

interface PricingCardProps {
  title: string;
  price: string;
  subtitle: string;
  features: string[];
  icon: string;
  buttonText: string;
  onGetStarted: () => void;
  isPopular?: boolean;
}

function PricingCard({
  title,
  price,
  subtitle,
  features,
  icon,
  buttonText,
  onGetStarted,
  isPopular = false,
}: PricingCardProps) {
  return (
    <div className={`relative rounded-2xl bg-white p-8 shadow-lg flex flex-col ${isPopular ? 'border-2 border-yellow-500' : 'border border-gray-200'}`}>
      {isPopular && (
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-4 py-1 bg-yellow-500 text-white text-sm font-medium rounded-full">
          Limited Time Offer
        </div>
      )}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{icon}</span>
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold tracking-tight text-gray-900">{price}</span>
          {price === '$10' && <span className="text-gray-600">/month</span>}
        </div>
        <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
      </div>

      <ul className="mb-8 space-y-4 flex-1">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <Check className="h-5 w-5 flex-shrink-0 text-yellow-500" />
            <span className="text-gray-600 text-sm">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={onGetStarted}
        className={`w-full rounded-lg px-4 py-3 text-base font-semibold shadow-sm transition-all hover:scale-105 
          ${isPopular 
            ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
            : 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'}`}
      >
        {buttonText}
      </button>
    </div>
  );
}

interface PricingSectionProps {
  onGetStarted: () => void;
}

export function PricingSection({ onGetStarted }: PricingSectionProps) {
  return (
    <div className="bg-gray-50 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            Weavernote Pricing
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the plan that best fits your needs
          </p>
        </div>

        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <PricingCard
              title="Exclusive Lifetime Plan"
              price="$100"
              subtitle="One-time payment - Only 100 spots available!"
              icon="💰"
              buttonText="Get Lifetime Access"
              onGetStarted={onGetStarted}
              isPopular={true}
              features={[
                "Lifetime access to your notes",
                "Monthly AI credits: 50 Credits (≈50,000 tokens)",
                "Additional AI credits: $5 for 50 Credits",
                "No recurring payments",
                "Lifetime storage for all your notes",
                "Access to all future updates and features",
                "Priority access to upcoming AI upgrades"
              ]}
            />

            <PricingCard
              title="Pro Plan"
              price="$10"
              subtitle="or $100/year (Save 2 months!)"
              icon="🔑"
              buttonText="Start Free Trial"
              onGetStarted={onGetStarted}
              features={[
                "Unlimited note creation and editing",
                "Full access to AI features: summarization, flashcards, and quizzes",
                "Monthly AI credits: 200 Credits (≈200,000 tokens)",
                "Additional AI credits: $5 for 50 Credits",
                "Advanced visualization and organizational tools",
                "Early access to new features",
                "Priority support",
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 