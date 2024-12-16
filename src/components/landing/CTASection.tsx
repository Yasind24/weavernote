import React from 'react';

interface CTASectionProps {}

export function CTASection({}: CTASectionProps) {
  return (
    <div className="bg-yellow-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              <span className="block">Transform Your Notes Into Knowledge</span>
              <span className="block text-yellow-500">Unlock your productivity today.</span>
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl">
              Secure your spot among the first to unlock its full potential.
            </p>
          </div>
          <div className="flex-shrink-0">
            <a
              href="#features"
              className="w-full sm:w-auto px-8 py-4 text-lg font-medium rounded-lg text-yellow-500 bg-white border border-yellow-500 hover:bg-yellow-100 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Explore Features
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
