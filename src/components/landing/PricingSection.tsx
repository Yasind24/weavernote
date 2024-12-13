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
        className="w-full rounded-lg px-4 py-3 text-base font-semibold shadow-sm transition-all hover:scale-105 bg-yellow-500 text-white hover:bg-yellow-600"
      >
        {buttonText}
      </button>
    </div>
  );
}

interface PricingSectionProps {
  onGetStarted: () => void;
  ref?: React.RefObject<HTMLDivElement>;
}

export const PricingSection = React.forwardRef<HTMLDivElement, PricingSectionProps>(
  ({ onGetStarted }, ref) => {
    return (
      <div ref={ref} className="bg-gray-50 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              Weavernote Pricing
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Who doesn't love a good deal?
            </p>
          </div>

          <div className="mx-auto max-w-lg">
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
                "No recurring payments",
                "Unlimited Notes",
                "Unlimited AI credits",
                "Unlimited Visualizations",
                "Free updates for current features",
                "Priority access to upcoming upgrades"
              ]}
            />
          </div>
        </div>
      </div>
    );
  }
); 