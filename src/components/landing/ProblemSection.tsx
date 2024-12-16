import React from 'react';

export function ProblemSection() {
  return (
    <div className="bg-gray-50 py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6">
              Ready to transform the way you work and learn?
            </h2>
            <div className="space-y-6 text-lg text-gray-600">
              <div>
                <h3 className="font-semibold mb-2">For Students:</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">✗</span>
                    Hours spent creating study materials from scratch
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">✗</span>
                    Struggle to retain information from lengthy readings
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">For Creators:</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">✗</span>
                    Ideas lost in countless notebooks and devices
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">✗</span>
                    No clear way to visualize and connect inspirations
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">For Professionals:</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">✗</span>
                    Important information scattered across multiple platforms
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">✗</span>
                    Time wasted searching through disconnected notes
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-12 lg:mt-0">
            <img
              src="https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
              alt="Person overwhelmed with scattered information"
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
}