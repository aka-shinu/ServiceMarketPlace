import React from 'react';
import { Link } from 'react-router-dom';
import { Store } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Store className="h-6 w-6 text-indigo-400" />
              <span className="text-xl font-bold text-indigo-400">ServiceHub</span>
            </div>
            <p className="text-gray-300 mb-4">
              Your one-stop marketplace for professional services. Connect with skilled professionals and get your tasks done efficiently.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider">Services</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/services" className="text-gray-300 hover:text-indigo-400 transition-colors">
                  Browse Services
                </Link>
              </li>
              <li>
                <Link to="/order-history" className="text-gray-300 hover:text-indigo-400 transition-colors">
                  Order History
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-gray-300 hover:text-indigo-400 transition-colors">
                  Cart
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider">Support</h3>
            <ul className="mt-4 space-y-2">
              <li className="text-gray-300">
                <a href="https://t.me/your_telegram" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors">
                  Telegram Support
                </a>
              </li>
              <li className="text-gray-300">
                <a href="mailto:support@servicehub.com" className="hover:text-indigo-400 transition-colors">
                  support@servicehub.com
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-center text-gray-400 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} ServiceHub. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link to="/terms" className="text-gray-400 hover:text-indigo-400 text-sm transition-colors">
                Terms
              </Link>
              <Link to="/privacy" className="text-gray-400 hover:text-indigo-400 text-sm transition-colors">
                Privacy
              </Link>
              <Link to="/acceptable-use" className="text-gray-400 hover:text-indigo-400 text-sm transition-colors">
                Acceptable Use
              </Link>
              <Link to="/refund" className="text-gray-400 hover:text-indigo-400 text-sm transition-colors">
                Refund Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 