import React from 'react';
import { Files, Menu } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="w-full bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.reload()}>
          <div className="bg-[#E53935] p-1.5 rounded-md">
            <Files className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-800 tracking-tight">Merge<span className="text-[#E53935]">Mate</span></span>
        </div>

        {/* Desktop Nav - Simplified for tool context */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <a href="#" className="hover:text-[#E53935] transition-colors">Merge PDF</a>
          <a href="#" className="hover:text-[#E53935] transition-colors">Split PDF</a>
          <a href="#" className="hover:text-[#E53935] transition-colors">Compress PDF</a>
        </nav>

        {/* Mobile Menu Icon */}
        <div className="md:hidden">
            <Menu className="w-6 h-6 text-gray-600" />
        </div>
        
        <div className="hidden md:flex items-center gap-4">
            <span className="text-sm font-semibold text-gray-600 hover:text-gray-900 cursor-pointer">Login</span>
            <button className="bg-[#E53935] text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-[#D32F2F] transition">
                Sign up
            </button>
        </div>
      </div>
    </header>
  );
};