import React from 'react';
import { FolderKanban, Brain, Network, TrendingUp } from 'lucide-react';

const benefits = [
  {
    icon: FolderKanban,
    title: 'Simplify Your Workflow',
    description: 'Say goodbye to scattered notes and endless tabs. Weavernote keeps everything organized in one space, so you can focus on what truly matters.'
  },
  {
    icon: Brain,
    title: 'Learn Faster with AI',
    description: 'Transform your notes into quizzes, flashcards, and summaries instantly. Perfect for acing exams, retaining knowledge, or prepping for big presentations.'
  },
  {
    icon: Network,
    title: 'Think Visually, Act Strategically',
    description: 'Visualize ideas, connect concepts, and see the bigger picture with our dynamic canvas. Ideal for brainstorming, planning, and creative work.'
  },
  {
    icon: TrendingUp,
    title: 'Built for Growth',
    description: 'Whether you\'re a student, creator, or professional, Weavernote grows with you—adapting to your needs and boosting your productivity.'
  }
];

export function BenefitsSection() {
  return (
    <div className="bg-gray-50 py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            Why Choose Weavernote?
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Experience a new way of note-taking that adapts to your thinking process
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div 
                key={index} 
                className="flex items-start p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 bg-yellow-50 rounded-xl flex items-center justify-center">
                    <Icon className="w-7 h-7 text-yellow-600" />
                  </div>
                </div>
                <div className="ml-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}