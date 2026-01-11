import React from 'react';

const Header = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a href="/" className="flex items-center space-x-2">
            <img
              src="https://public.readdy.ai/ai/img_res/5bde7704-1cb0-4365-9e92-f123696b11d9.png"
              alt="Nông Sản Sạch"
              className="h-10 md:h-12"
            />
            <span className="text-xl md:text-2xl font-black text-gray-900">Smart fruit shop</span>
          </a>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="/" className="text-gray-900 font-semibold hover:text-green-600 transition-colors">Homepage</a>
            <a href="/products" className="text-gray-700 hover:text-green-600 font-medium transition-colors">Products</a>
            <a href="/categories" className="text-gray-700 hover:text-green-600 font-medium transition-colors">Categories</a>
            <a href="/about" className="text-gray-700 hover:text-green-600 font-medium transition-colors">About Us</a>
            <a href="/contact" className="text-gray-700 hover:text-green-600 font-medium transition-colors">Contact</a>
            <a href="/faq" className="text-gray-700 hover:text-green-600 font-medium transition-colors">FAQ</a>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <button className="relative text-gray-700 hover:text-green-600 transition-colors">
              <i className="ri-shopping-cart-line text-2xl"></i>
              <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                0
              </span>
            </button>
            <button className="md:hidden text-gray-900">
              <i className="ri-menu-line text-2xl"></i>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
