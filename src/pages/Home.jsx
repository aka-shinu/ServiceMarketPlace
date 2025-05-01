import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Palette, Book, Camera, Code, MessageCircle, Star, Clock, Shield } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  const popularCategories = [
    { name: 'Design & Creative', icon: Palette, description: 'Logo Design, UI/UX, Illustrations' },
    { name: 'Writing & Translation', icon: Book, description: 'Content Writing, Translation Services' },
    { name: 'Photography', icon: Camera, description: 'Product & Portrait Photography' },
    { name: 'Programming', icon: Code, description: 'Web, Mobile & Software Development' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-blue-50 via-blue-100 to-purple-100">
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Find the Perfect Service</span>
              <span className="block text-indigo-600">for Your Needs</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-600 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Connect with skilled professionals and get your projects done efficiently.
            </p>
            
            {/* Search Bar */}
            <div className="mt-8 max-w-3xl mx-auto px-4">
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="What service are you looking for?"
                  className="w-full px-4 py-3 rounded-lg text-gray-900 bg-white/80 backdrop-blur-sm shadow-md focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:bg-white"
                />
                <button className="absolute right-3 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                  Search
                </button>
              </div>
            </div>

            {/* CTA Button */}
            <div className="mt-8">
              <button
                onClick={() => navigate('/services')}
                className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-md"
              >
                Browse All Services
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Categories Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">Popular Categories</h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {popularCategories.map((category) => (
              <div key={category.name} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 p-3 bg-indigo-600 rounded-lg">
                      <category.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                    </div>
                  </div>
                  <p className="mt-4 text-base text-gray-600">{category.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Why Choose ServiceHub</h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-600 text-white mx-auto">
                <Star className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Top-rated Professionals</h3>
              <p className="mt-2 text-base text-gray-500">Work with the best service providers in their fields</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-600 text-white mx-auto">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Quick Delivery</h3>
              <p className="mt-2 text-base text-gray-500">Get your projects completed on time, every time</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-600 text-white mx-auto">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Secure Payments</h3>
              <p className="mt-2 text-base text-gray-500">Your transactions are always protected</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}