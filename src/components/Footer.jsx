import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider">Legal</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/policy/terms" className="text-gray-300 hover:text-white">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/policy/acceptable-use-policy" className="text-gray-300 hover:text-white">
                  Acceptable Use Policy
                </Link>
              </li>
              <li>
                <Link to="/policy/privacy-policy" className="text-gray-300 hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/policy/refund-policy" className="text-gray-300 hover:text-white">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
          {/* Add other footer sections as needed */}
        </div>
      </div>
    </footer>
  );
} 