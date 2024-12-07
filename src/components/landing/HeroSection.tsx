import React, { useState } from 'react';
import { Logo } from '../Logo';

interface HeroSectionProps {
  onGetStarted: () => void;
}

export function HeroSection({ onGetStarted }: HeroSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleModalToggle = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <div className="relative bg-white overflow-hidden">
      {/* Modal for video */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative w-full max-w-3xl">
            <button
              onClick={handleModalToggle}
              className="absolute top-0 right-0 m-4 text-white"
            >
              Close
            </button>
            <iframe
              className="w-full h-64 sm:h-96"
              src="https://www.youtube.com/embed/YOUR_VIDEO_ID_HERE"
              title="Weavernote Demo"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:pb-28 xl:pb-32 bg-white lg:bg-transparent">
          <div className="pt-6 px-4 sm:px-6 lg:px-8">
            <Logo size="large" className="mx-auto lg:mx-0" />
          </div>

          <main className="mt-8 sm:mt-12 md:mt-16 px-4 sm:px-6 lg:px-8">
            <div className="text-center lg:text-left lg:grid lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-6 xl:col-span-5">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block">Transform your ideas into</span>{' '}
                  <span className="block text-yellow-500">organized brilliance</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Capture, organize, and bring your ideas to life with Weavernote. The modern note-taking app designed for the way your mind works.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <button
                    onClick={onGetStarted}
                    className="rounded-md shadow px-8 py-3 text-base font-medium text-white bg-yellow-500 hover:bg-yellow-600 md:py-4 md:text-lg md:px-10 transform transition-all hover:scale-105"
                  >
                    Weave your ideas
                  </button>
                  <button
                    onClick={handleModalToggle}
                    className="rounded-md px-8 py-3 text-base font-medium text-yellow-600 bg-yellow-50 hover:bg-yellow-100 md:py-4 md:text-lg md:px-10"
                  >
                    Watch Demo
                  </button>
                </div>
              </div>
              <div className="mt-12 lg:mt-0 lg:col-span-6 xl:col-span-7">
                <div 
                  onClick={handleModalToggle}
                  className="relative mx-auto w-full rounded-lg shadow-lg lg:max-w-none aspect-video cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <iframe
                    className="w-full h-full rounded-lg pointer-events-none"
                    src="https://www.youtube.com/embed/YOUR_VIDEO_ID_HERE"
                    title="Weavernote Demo"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}