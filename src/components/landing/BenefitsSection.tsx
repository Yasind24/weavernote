import React from 'react';
import { FolderKanban, Network, Rocket, Shield } from 'lucide-react';

const benefits = [
  {
    icon: FolderKanban,
    title: 'Stay Organized Effortlessly',
    description: 'Keep everything in one place, neatly structured for quick access. Use labels and tags to maintain clarity, no matter how many notes you have.'
  },
  {
    icon: Network,
    title: 'Clarity Through Visualization',
    description: 'Connect ideas and concepts visually for better understanding and creativity. Gain a big-picture view of your notes and projects.'
  },
  {
    icon: Rocket,
    title: 'Boost Your Efficiency',
    description: 'Save time with AI-powered tools that simplify repetitive tasks. Manage tasks alongside your notes for a seamless workflow.'
  },
  {
    icon: Shield,
    title: 'Secure and Accessible',
    description: 'Access your notes anytime, anywhere, with seamless syncing across devices. Safeguard your work with archive and trash features.'
  }
];

export function BenefitsSection() {
  return (
    <div className="bg-white py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            Why Choose Weavernote?
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Experience a new way of note-taking that adapts to your thinking process
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div 
                key={index} 
                className="relative p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}