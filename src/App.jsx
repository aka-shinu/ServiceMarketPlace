import React,{useState,useEffect} from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Services from './pages/Services';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import AdminDashboard from './pages/AdminDashboard';
import OrderHistory from './pages/OrderHistory';
import PolicyPage from './pages/PolicyPage';
import { AuthProvider } from './contexts/AuthContext';
import Footer from './components/Footer';

function App() {
  
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Navbar />
          <main className="container mx-auto px-4 py-8 flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/services" element={<Services />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/order-history" element={<OrderHistory />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/policy/:slug" element={<PolicyPage />} />
              <Route path="/terms" element={<PolicyPage initialSlug="terms" />} />
              <Route path="/privacy" element={<PolicyPage initialSlug="privacy-policy" />} />
              <Route path="/acceptable-use" element={<PolicyPage initialSlug="acceptable-use-policy" />} />
              <Route path="/refund" element={<PolicyPage initialSlug="refund-policy" />} />
            </Routes>
          </main>
          <Footer />
          <Toaster position="top-right" />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;