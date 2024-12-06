import React from 'react';

export function ProblemSection() {
  return (
    <div className="bg-gray-50 py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6">
              Struggling with scattered thoughts?
            </h2>
            <div className="space-y-4 text-lg text-gray-600">
              <p>
                In today's fast-paced world, keeping track of ideas, tasks, and information
                can feel overwhelming. Traditional note-taking tools often fall short:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">✗</span>
                  Scattered notes across multiple apps and platforms
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">✗</span>
                  Difficulty finding important information when needed
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">✗</span>
                  Limited organization and connection between ideas
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">✗</span>
                  Complex interfaces that slow you down
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 lg:mt-0">
            <img
              src="https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
              alt="Person overwhelmed with sticky notes"
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
}