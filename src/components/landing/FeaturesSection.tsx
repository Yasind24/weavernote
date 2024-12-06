import React from 'react';
import { FolderTree, Network, Bot, Layout, Zap, Shield } from 'lucide-react';

const features = [
  {
    icon: FolderTree,
    title: 'Purpose-Built for Versatility',
    description: 'Flexible structure with folders, notebooks, and notes for organizing everything from ideas to projects.'
  },
  {
    icon: Network,
    title: 'Visual Organization',
    description: 'Visual canvas to connect and map your thoughts like never before.'
  },
  {
    icon: Bot,
    title: 'Powered by Intelligence',
    description: 'AI tools for summarizing, creating flashcards, and generating quizzes that enhance your productivity.'
  },
  {
    icon: Zap,
    title: 'Smart Search',
    description: 'Find anything in seconds with intelligent search and tagging capabilities.'
  },
  {
    icon: Layout,
    title: 'Designed with Simplicity',
    description: 'Minimalistic, distraction-free interface for staying focused on what matters.'
  },
  {
    icon: Shield,
    title: 'Customizable Experience',
    description: 'Personalize your workspace with customizable layouts and themes to match your style.'
  }
];

export function FeaturesSection() {
  return (
    <div id="features" className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            Discover What Makes Weavernote Stand Out
          </h2>
          <p className="mt-4 text-lg sm:text-xl text-gray-500">
            Powerful features designed to enhance your note-taking experience
          </p>
        </div>

        <div className="mt-12 sm:mt-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="relative group">
                  <div className="h-full flow-root bg-gray-50 rounded-lg px-6 pb-8 pt-12 hover:shadow-lg transition-shadow duration-300">
                    <div className="absolute top-0 inline-block -translate-y-1/2">
                      <div className="inline-flex items-center justify-center p-3 bg-yellow-500 rounded-lg shadow-lg group-hover:scale-110 transition-transform duration-200">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 tracking-tight">
                      {feature.title}
                    </h3>
                    <p className="mt-4 text-base text-gray-500">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}