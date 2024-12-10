import React from 'react';
import { FolderTree, Network, Bot, Layout, Zap, Shield } from 'lucide-react';

// Import images from media folder
import foldersStructure from '../../../media/OrganizeBetter.png';
import visualCanvas from '../../../media/Visualizer.png';
import aiFeatures from '../../../media/AI studio.png';
import smartSearch from '../../../media/Search and tag.png';
import distractionFree from '../../../media/Distraction free.png';
import customization from '../../../media/Customize.png';

const features = [
  {
    icon: FolderTree,
    title: 'Purpose-Built for Versatility',
    description: 'Flexible structure with folders, notebooks, and notes for organizing everything from ideas to projects.',
    imageUrl: foldersStructure,
    imageAlt: 'Weavernote folder structure and organization'
  },
  {
    icon: Network,
    title: 'Visual Organization',
    description: 'Visual canvas to connect and map your thoughts like never before.',
    imageUrl: visualCanvas,
    imageAlt: 'Visual mind mapping and note connections'
  },
  {
    icon: Bot,
    title: 'Powered by Intelligence',
    description: 'AI tools for summarizing, creating flashcards, and generating quizzes that enhance your productivity.',
    imageUrl: aiFeatures,
    imageAlt: 'AI-powered note enhancement features'
  },
  {
    icon: Zap,
    title: 'Smart Search',
    description: 'Find anything in seconds with intelligent search and tagging capabilities.',
    imageUrl: smartSearch,
    imageAlt: 'Intelligent search interface'
  },
  {
    icon: Layout,
    title: 'Designed with Simplicity',
    description: 'Minimalistic, distraction-free interface for staying focused on what matters.',
    imageUrl: distractionFree,
    imageAlt: 'Clean and minimalistic user interface'
  },
  {
    icon: Shield,
    title: 'Customizable Experience',
    description: 'Personalize your workspace with customizable layouts and themes to match your style.',
    imageUrl: customization,
    imageAlt: 'Theme customization and layout options'
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

        <div className="mt-16 space-y-24">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isEven = index % 2 === 0;

            return (
              <div 
                key={index}
                className="relative lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center"
              >
                <div className={`relative ${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
                  <div className="relative">
                    <div className="inline-flex items-center justify-center p-3 bg-yellow-500 rounded-lg shadow-lg mb-4">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 tracking-tight sm:text-3xl">
                      {feature.title}
                    </h3>
                    <p className="mt-3 text-lg text-gray-500">
                      {feature.description}
                    </p>
                  </div>
                </div>

                <div className={`mt-10 -mx-4 relative lg:mt-0 ${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
                  <div 
                    className="relative mx-auto w-full rounded-lg shadow-lg overflow-hidden lg:max-w-xl"
                    aria-hidden="true"
                  >
                    <div className="relative block w-full bg-gray-100 rounded-lg overflow-hidden">
                      <div className="aspect-w-16 aspect-h-9">
                        <img
                          src={feature.imageUrl}
                          alt={feature.imageAlt}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-white opacity-20"></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}