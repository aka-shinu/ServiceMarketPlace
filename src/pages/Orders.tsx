import React, { useEffect, useState } from 'react';
import { formatINR, supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Package } from 'lucide-react';

interface OrderItem {
  id: string;
  service_id: string;
  quantity: number;
  price_per_unit: number;
  credentials: string | null;
  service: {
    name: string;
  };
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  order_items: OrderItem[];
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  async function fetchOrders() {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            service:services (
              name
            )
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-2 text-lg font-medium text-gray-900">No orders yet</h2>
          <p className="mt-1 text-sm text-gray-500">Start shopping to see your orders here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Orders</h1>
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-sm text-gray-500">
                      Order placed: {new Date(order.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      Total: {formatINR(order.total_amount)}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    order.status === 'completed' ? 'bg-green-100 text-green-800' :
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="py-3">
                      <div className="flex justify-between">
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{item.service.name}</h4>
                          <p className="text-sm text-gray-500">
                            Quantity: {item.quantity} × {formatINR(item.price_per_unit)}
                          </p>
                        </div>
                        <p className="text-lg font-medium">
                          ${(item.quantity * item.price_per_unit).toFixed(2)}
                        </p>
                      </div>
                      {item.credentials && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-md">
                          <p className="text-sm font-mono">{item.credentials}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}