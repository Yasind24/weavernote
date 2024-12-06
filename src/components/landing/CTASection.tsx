import React from 'react';

interface CTASectionProps {
  onGetStarted: () => void;
}

export function CTASection({ onGetStarted }: CTASectionProps) {
  return (
    <div className="bg-yellow-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              <span className="block">Ready to organize your thoughts?</span>
              <span className="block text-yellow-500">Start your journey today.</span>
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl">
              Join thousands of users who have transformed their note-taking experience with Quirip. 
              Your organized, productive future starts here.
            </p>
          </div>
          <div className="flex-shrink-0">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-4 text-lg font-medium rounded-lg text-white bg-yellow-500 hover:bg-yellow-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Plan, Learn, Achieve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}