import React from 'react';
import Link from 'next/link';
import { Search, Phone } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
              <Phone className="w-5 h-5 text-yellow-900" />
            </div>
            <span className="text-xl font-bold text-gray-900">YellowBook</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link 
              href="/" 
              className="text-gray-700 hover:text-yellow-600 px-3 py-2 text-sm font-medium transition-colors"
            >
              Нүүр
            </Link>
            <Link 
              href="/directory" 
              className="text-gray-700 hover:text-yellow-600 px-3 py-2 text-sm font-medium transition-colors"
            >
              Лавлах
            </Link>
            <Link 
              href="/yellow-books/assistant" 
              className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <span>🤖</span>
              AI Assistant
            </Link>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-gray-700 hover:text-yellow-600">
              <Search className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      <div className="md:hidden bg-gray-50 border-t border-gray-200">
        <div className="px-4 py-2 space-y-1">
          <Link 
            href="/" 
            className="block text-gray-700 hover:text-yellow-600 px-3 py-2 text-sm font-medium"
          >
            Нүүр
          </Link>
          <Link 
            href="/directory" 
            className="block text-gray-700 hover:text-yellow-600 px-3 py-2 text-sm font-medium"
          >
            Лавлах
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;