import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Package, ChevronDown, Copy, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ServiceDelivery {
  id: string;
  created_at: string;
  user_id: string;
  email: string;
  password: string;
  two_factor_key: string;
  coupon_code: string;
  status: string;
  service_id: string;
  name: string | null;
  description: string | null;
  services: {
    name: string;
  };
}

export default function OrderHistory() {
  const [deliveries, setDeliveries] = useState<ServiceDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchDeliveries();
    }
  }, [user]);

  async function fetchDeliveries() {
    try {
      const { data, error } = await supabase
        .from('service_deliveries')
        .select(`
          *,
          services (
            name
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      console.log(data)
      if (error) throw error;
      setDeliveries(data || []);
    } catch (error: any) {
      console.error('Error fetching deliveries:', error);
    } finally {
      setLoading(false);
    }
  }

  // Group deliveries by service
  const groupedDeliveries = deliveries.reduce((acc, delivery) => {
    const serviceId = delivery.service_id;
    if (!acc[serviceId]) {
      acc[serviceId] = {
        serviceName: delivery.services?.name || 'Unknown Service',
        deliveries: []
      };
    }
    acc[serviceId].deliveries.push(delivery);
    return acc;
  }, {} as Record<string, { serviceName: string; deliveries: ServiceDelivery[] }>);

  // Get unique services for the dropdown
  const services = Object.entries(groupedDeliveries).map(([id, data]) => ({
    id,
    name: data.serviceName
  }));

  // Filter deliveries based on selected service
  const filteredDeliveries = selectedService 
    ? Object.entries(groupedDeliveries).filter(([serviceId]) => serviceId === selectedService)
    : Object.entries(groupedDeliveries);

  const handleCopyCredentials = (delivery: ServiceDelivery) => {
    const text = `${delivery.email}:${delivery.password}`;
    navigator.clipboard.writeText(text)
      .then(() => {
        toast.success('Credentials copied to clipboard');
      })
      .catch(() => {
        toast.error('Failed to copy credentials');
      });
  };

  const handleCopyAllCredentials = (deliveries: ServiceDelivery[]) => {
    const text = deliveries
      .map(delivery => `${delivery.email}:${delivery.password}`)
      .join('\n');
    
    navigator.clipboard.writeText(text)
      .then(() => {
        toast.success('All credentials copied to clipboard');
      })
      .catch(() => {
        toast.error('Failed to copy credentials');
      });
  };

  const handleDownloadCredentials = (deliveries: ServiceDelivery[]) => {
    const credentialsText = deliveries.map(delivery => {
      return `Service: ${delivery.services.name}
Email: ${delivery.email}
Password: ${delivery.password}
${delivery.two_factor_key ? `2FA Key: ${delivery.two_factor_key}` : ''}
${delivery.coupon_code ? `Coupon Code: ${delivery.coupon_code}` : ''}
----------------------------------------`;
    }).join('\n\n');

    const blob = new Blob([credentialsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${deliveries[0].services.name}_credentials.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (deliveries.length === 0) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-2 text-lg font-medium text-gray-900">No delivery history</h2>
          <p className="mt-1 text-sm text-gray-500">Your completed orders will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
          {services.length > 0 && (
            <div className="relative">
              <select
                value={selectedService || ''}
                onChange={(e) => setSelectedService(e.target.value || null)}
                className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-10 py-2 text-base focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Services</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          )}
        </div>
        <div className="space-y-6">
          {filteredDeliveries.map(([serviceId, group]) => (
            <div key={serviceId} className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{group.serviceName}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyAllCredentials(group.deliveries)}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                      title="Copy all credentials"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDownloadCredentials(group.deliveries)}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                      title="Download all credentials"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  {group.deliveries.map((delivery) => (
                    <div key={delivery.id} className="bg-white shadow-lg rounded-lg overflow-hidden">
                      <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <p className="text-sm text-gray-500">
                              Delivered on: {new Date(delivery.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <button
                            onClick={() => handleCopyCredentials(delivery)}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
                            title="Copy credentials"
                          >
                            <Copy className="h-5 w-5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-medium text-gray-700">Email / Username:</p>
                            <p className="font-mono">{delivery.email}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">Password:</p>
                            <p className="font-mono">{delivery.password}</p>
                          </div>
                          {delivery.two_factor_key && (
                            <div>
                              <p className="font-medium text-gray-700">Two Factor Key:</p>
                              <p className="font-mono">{delivery.two_factor_key}</p>
                            </div>
                          )}
                          {delivery.coupon_code && (
                            <div>
                              <p className="font-medium text-gray-700">Coupon Code:</p>
                              <p className="font-mono">{delivery.coupon_code}</p>
                            </div>
                          )}
                        </div>
                      </div>
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