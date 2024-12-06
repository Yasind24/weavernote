import React from 'react';
import { Heart } from 'lucide-react';

interface FooterProps {
  showCredit?: boolean;
}

export function Footer({ showCredit = false }: FooterProps) {
  return (
    <footer className="bg-white border-t">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          {showCredit ? (
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <span>Made with</span>
              <Heart size={16} className="fill-yellow-500 text-yellow-500" />
              <span>by</span>
              <a 
                href="https://x.com/yasiten" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-yellow-600 hover:text-yellow-700"
              >
                Yas Merak
              </a>
            </div>
          ) : (
            <div className="text-sm text-gray-600">
              Weave your thoughts, empower your creativity
            </div>
          )}
          <div className="text-sm text-gray-500">
            © {new Date().getFullYear()} Weavernote. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}