import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, LogOut, LogIn, Store, Package, User, Users, Home, History, MessageCircle, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCartStore } from '../stores/cartStore';
import { supabase } from '../lib/supabase';
import Notification from './Notification';

export default function Navbar() {
  const {user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const cartItems = useCartStore((state) => state.items);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const [telegramLink, setTelegramLink] = useState('');
  const [whatsappLink, setWhatsappLink] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isAdmin = profile?.email === 'proxcyadmin@gmail.com';

  useEffect(() => {
    if (user && !isAdmin) {
      fetchGroupLinks();
    }
  }, [user, isAdmin]);

  const fetchGroupLinks = async () => {
    try {
      const { data: telegramData, error: telegramError } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'telegram_group_link')
        .single();

      const { data: whatsappData, error: whatsappError } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'whatsapp_group_link')
        .single();

      if (telegramError) throw telegramError;
      if (whatsappError) throw whatsappError;

      if (telegramData?.value) {
        setTelegramLink(telegramData.value);
      }
      if (whatsappData?.value) {
        setWhatsappLink(whatsappData.value);
      }
    } catch (error) {
      console.error('Error fetching group links:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const renderNavLinks = () => {
    if (!user) {
      return (
        <Link 
          to="/login" 
          className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
          onClick={closeMenu}
        >
          <LogIn className="h-5 w-5" />
          <span>Login</span>
        </Link>
      );
    }

    if (isAdmin) {
      return (
        <>
          <Notification />
          <button
            onClick={handleSignOut}
            className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </>
      );
    }

    return (
      <>
        <Link 
          to="/services" 
          className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
          onClick={closeMenu}
        >
          <Package className="h-5 w-5" />
          <span>Services</span>
        </Link>
        
        <Link 
          to="/orders" 
          className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
          onClick={closeMenu}
        >
          <User className="h-5 w-5" />
          <span>Orders</span>
        </Link>

        <Link 
          to="/order-history" 
          className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
          onClick={closeMenu}
        >
          <History className="h-5 w-5" />
          <span>History</span>
        </Link>

        {telegramLink && (
          <a
            href={telegramLink.startsWith('https') ? telegramLink : `https://${telegramLink}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
            onClick={closeMenu}
          >
            <Users className="h-5 w-5" />
            <span>Telegram</span>
          </a>
        )}

        {whatsappLink && (
          <a
            href={whatsappLink.startsWith('https') ? whatsappLink : `https://${whatsappLink}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors"
            onClick={closeMenu}
          >
            <MessageCircle className="h-5 w-5" />
            <span>WhatsApp</span>
          </a>
        )}

        <Link 
          to="/cart" 
          className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors relative"
          onClick={closeMenu}
        >
          <ShoppingCart className="h-5 w-5" />
          <span>Cart</span>
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </Link>

        <Notification />

        <button
          onClick={handleSignOut}
          className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </>
    );
  };

  return (
    <nav className="bg-white shadow-lg fixed w-full top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link 
              to="/" 
              className="flex items-center space-x-2 text-xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
              onClick={closeMenu}
            >
              <Store className="h-6 w-6" />
              <span>ServiceHub</span>
            </Link>
            <Link
              to={isAdmin ? '/admin' : '/'}
              className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition-colors md:inline-flex hidden"
              onClick={closeMenu}
            >
              <Home className="h-5 w-5" />
              <span>Home</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="md:hidden flex items-center"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-gray-600" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600" />
            )}
          </button>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {renderNavLinks()}
          </div>
        </div>

        {/* Mobile navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            <Link
              to={isAdmin ? '/admin' : '/'}
              className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition-colors"
              onClick={closeMenu}
            >
              <Home className="h-5 w-5" />
              <span>Home</span>
            </Link>
            {renderNavLinks()}
          </div>
        )}
      </div>
    </nav>
  );
}