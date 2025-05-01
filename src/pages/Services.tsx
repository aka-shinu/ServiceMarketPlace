import React, { useEffect, useState } from 'react';
import { Plus, Minus, ShoppingCart, Star } from 'lucide-react';
import { supabase, formatINR } from '../lib/supabase';
import { useCartStore } from '../stores/cartStore';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import axios from "axios";
const apiEndpoint = "https://api.lethrach.me/";
const fetchApiData = (method: string, path: string, others = {}) => {
  var config = {
    method: method,
    url: apiEndpoint + path,
  };
  Object.assign(config, others);
  return axios(config);
};
interface Service {
  id: string;
  name: string;
  description: string;
  type: string;
  price: number;
  stock_count: number;
  logo_url: string;
  is_available: boolean;
}

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [stocks,setStock] = useState({})
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const {items,addItem} = useCartStore();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchServices();
    }
  }, [user]);

  async function fetchServices() {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_available', true)
        .order('name');
      
      if (error) throw error;
      
      setServices(data || []);
      console.log(data, "asdasd")
      const initialQuantities: Record<string, number> = {};
      data?.forEach(async (service) => {
        var key = service.id
        fetchApiData("get","getStockCount", {params: {orderId: key}}).then((value)=>{

          value = value.data.count
          console.log(value)
          setStock(prev => ({
            ...prev,
            [key]: value,
          }));
        })
        
        initialQuantities[service.id] = 0;
      });
      console.log("Stocks,",stocks)
      setQuantities(initialQuantities);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }
  const incrementCounter = (key) => {
    setQuantities(prev => ({
      ...prev,
      [key]: (prev[key] || 1) + 1
    }));
  };

  const setQ =(key,value)=>{
    setQuantities(prev => {
      console.log('Setting', key, 'to', value);
      return {
        ...prev,
        [key]: value
      };
    });
  }
  function getStock(serviceId: string){
    try {
      return stocks[serviceId]
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      
    }

  }

  const handleAddToCart = async  (service: Service) => {
    var quantity = quantities[service.id] ?? 1;
    if (!quantity){
      var ok 
      items.filter(item => item.id == service.id).forEach((v)=>{
          ok = v.quantity
      })
      if (ok){
        setQ(service.id, ok)
        var quantity = ok;
      }
      else{
        quantity = 1
      }
    }
    var ok =getStock(service.id)
    if (quantity > ok) {
      toast.error('Not enough stock available');
      return;
    }
    incrementCounter(service.id)
    addItem({
      id: service.id,
      name: service.name,
      price: service.price,
      quantity: quantity,
    });
    toast.success('Added to cart!');
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Please login to view services</h2>
          <p className="mt-2 text-gray-600">You need to be logged in to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Header Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Browse Services</h1>
              <p className="mt-2 text-gray-600">Find the perfect service provider for your needs</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search services..."
                  className="w-full md:w-64 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-blue-500"
                />
              </div>
              <select className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                <option value="">All Categories</option>
                <option value="design">Design & Creative</option>
                <option value="writing">Writing & Translation</option>
                <option value="tech">Programming & Tech</option>
                <option value="business">Business</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-200"
            >
              {/* Service Image/Logo */}
              <div className="relative h-48 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-6">
                {service.logo_url ? (
                  <img
                    src={service.logo_url}
                    alt={service.name}
                    className="h-32 w-32 object-contain rounded-lg bg-white/10 p-4"
                  />
                ) : (
                  <div className="h-32 w-32 rounded-lg bg-white/10 flex items-center justify-center p-6">
                    <ShoppingCart className="h-16 w-16 text-white/80" />
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    getStock(service.id) > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {getStock(service.id) > 0 ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>

              {/* Service Details */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.name}</h3>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400" />
                        <Star className="h-4 w-4 text-yellow-400" />
                        <Star className="h-4 w-4 text-yellow-400" />
                        <Star className="h-4 w-4 text-yellow-400" />
                        <Star className="h-4 w-4 text-yellow-400" />
                      </div>
                      <span className="text-sm text-gray-500">(4.9)</span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 line-clamp-2 mb-4">{service.description}</p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <span className="text-sm text-gray-500">Starting at</span>
                    <span className="block text-2xl font-bold text-indigo-600">{formatINR(service.price)}</span>
                  </div>
                  <button
                    onClick={() => handleAddToCart(service)}
                    disabled={service.stock_count === 0}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </button>
                </div>

                {/* Service Type Badge */}
                <div className="mt-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-indigo-100 text-indigo-800">
                    {service.type}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}