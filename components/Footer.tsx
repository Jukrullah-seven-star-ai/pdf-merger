import React from 'react';
import { Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-white border-t border-gray-200 mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="flex items-center justify-center gap-2 text-gray-500 text-sm">
          Made with <Heart className="w-4 h-4 text-[#E53935] fill-current" /> using React, pdf-lib, and Gemini.
        </p>
        <p className="text-xs text-gray-400 mt-2">
          © {new Date().getFullYear()} MergeMate PDF. All rights reserved.
        </p>
      </div>
    </footer>
  );
};