import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Package2, Users, Plus, X, Edit, Save, Upload, Ban, Send, Settings, Key, FileText, Trash, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import MDEditor from '@uiw/react-md-editor';
import axios from "axios";
import { useAuth } from '../contexts/AuthContext';

const apiEndpoint = "https://api.lethrach.me/";
const fetchApiData = (method:string, path:string, others = {}) => {
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
  is_deleted: boolean;
}
interface ServiceCred {
  id: string;
  service_id: string;
  email: string;
  password: string;
  two_factor_key: string;
  description: string;
  coupon_code: string;
  is_used: boolean;
  logo_url: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  contact_username: string;
  is_banned: boolean;
  last_login: string;
  created_at: string;
  refer_code: string;
  referred_by: string;
  full_name: string;
  telegram_id: string;
}

interface OrderStats {
  total_orders: number;
  total_revenue: number;
  orders_by_service: {
    service_name: string;
    count: number;
    revenue: number;
  }[];
}

interface Page {
  id: string;
  slug: string;
  title: string;
  content: string;
}

interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  created_at: string;
  order_items: {
    id: string;
    service_id: string;
    quantity: number;
    price_per_unit: number;
    service: {
      name: string;
    };
  }[];
  user: {
    name: string;
    email: string;
  };
}

interface ServiceDelivery {
  id: string;
  user_id: string;
  service_id: string;
  email: string;
  password: string;
  two_factor_key: string;
  coupon_code: string;
  created_at: string;
  services: {
    name: string;
  };
  user: {
    name: string;
    email: string;
  };
}

interface CouponUsage {
  id: string;
  coupon_id: string;
  user_id: string;
  used_at: string;
  user: {
    name: string;
    email: string;
  };
  coupon: {
    code: string;
    discount_percentage: number;
  };
}

function AdminDashboard() {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [servicesCred, setServicesCred] = useState<ServiceCred[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingService, setIsAddingService] = useState(false);
  const [telegramLink, setTelegramLink] = useState('');
  const [whatsappLink, setWhatsappLink] = useState('');
  const [newNotification, setNewNotification] = useState({ title: '', message: '' });
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [dateFilter, setDateFilter] = useState({
    start: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
    end: new Date().toISOString()
  });
  const [orderStats, setOrderStats] = useState<OrderStats>({
    total_orders: 0,
    total_revenue: 0,
    orders_by_service: []
  });
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    type: '',
    price: 0,
    stock_count: 0,
    logo_url: '',
    is_available: true
  });
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [isEditingPage, setIsEditingPage] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discount_percentage: 0,
    max_uses: 0,
    expires_at: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0]
  });
  const [isAddingCoupon, setIsAddingCoupon] = useState(false);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [credentials, setCredentials] = useState<any[]>([]);
  const [isAddingCredentials, setIsAddingCredentials] = useState(false);
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const [bulkUploadFile, setBulkUploadFile] = useState<File | null>(null);
  const [newCredentials, setNewCredentials] = useState({
    service_id: '',
    email: '',
    password: '',
    two_factor_key: '',
    description: '',
    coupon_code: '',
    logo_url: ''
  });
  const [isEditingService, setIsEditingService] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(null);
  const [showDeletedServices, setShowDeletedServices] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [userPurchases, setUserPurchases] = useState<ServiceDelivery[]>([]);
  const [isLoadingPurchases, setIsLoadingPurchases] = useState(true);
  const [searchEmail, setSearchEmail] = useState('');
  const [couponUsages, setCouponUsages] = useState<CouponUsage[]>([]);
  const [isLoadingUsages, setIsLoadingUsages] = useState(true);
  const [selectedCoupon, setSelectedCoupon] = useState<string | null>(null);
  const [selectedCredential, setSelectedCredential] = useState<any | null>(null);
  const [isEditingCredential, setIsEditingCredential] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    checkAdminAccess();
    fetchServices();
    fetchUsers();
    fetchSettings();
    fetchOrderStats();
    fetchPages();
    fetchCoupons();
    fetchCredentials();
    fetchOrders();
    fetchUserPurchases();
    fetchCouponUsages();
  }, [dateFilter, showDeletedServices]);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/login');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', user.id)
      .single();

    if (profile?.email !== 'proxcyadmin@gmail.com') {
      navigate('/');
    }
  };

  const fetchServices = async () => {
    try {
      let query = supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (showDeletedServices) {
        query = query.eq('is_deleted', true);
      } else {
        query = query.or('is_deleted.eq.false,is_deleted.is.null');
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      setServices(data || []);
    } catch (error: any) {
      console.error('Error fetching services:', error);
      toast.error('Failed to fetch services');
    }
  };

  const fetchServiceCreds = async ()=>{
    try {
      const { data, error } = await supabase
        .from('service_credentials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServicesCred(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to fetch services');
    }
  }

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select("*")
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      toast.error('Failed to fetch users');
      throw( error);
    }
  };

  const fetchSettings = async () => {
    try {
      const { data: telegramData, error: telegramError } = await supabase
        .from('settings')
        .select('*')
        .eq('key', 'telegram_group_link')
        .single();

      const { data: whatsappData, error: whatsappError } = await supabase
        .from('settings')
        .select('*')
        .eq('key', 'whatsapp_group_link')
        .single();

      if (telegramError) throw telegramError;
      if (whatsappError) throw whatsappError;

      setTelegramLink(telegramData?.value || '');
      setWhatsappLink(whatsappData?.value || '');
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to fetch settings');
    }
  };

  const fetchPages = async () => {
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .order('title');

      if (error) throw error;
      setPages(data || []);
    } catch (error) {
      console.error('Error fetching pages:', error);
      toast.error('Failed to fetch pages');
    }
  };

  const fetchCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from('coupon_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCoupons(data || []);
      console.log("dsd",data)
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error('Failed to fetch coupons');
    }
  };

  const fetchCredentials = async () => {
    try {
      const { data, error } = await supabase
        .from('service_credentials')
        .select('*, service:services(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCredentials(data || []);
    } catch (error) {
      console.error('Error fetching credentials:', error);
      toast.error('Failed to fetch credentials');
    }
  };

  const fetchOrders = async () => {
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
          ),
          user:profiles (
            name,
            email
          )
        `)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const fetchUserPurchases = async () => {
    try {
      const { data, error } = await supabase
        .from('service_deliveries')
        .select(`
          *,
          services (
            name
          ),
          user:profiles (
            name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log("User purchases", data)
      setUserPurchases(data || []);
    } catch (error: any) {
      console.error('Error fetching user purchases:', error);
      toast.error('Failed to fetch user purchases');
    } finally {
      setIsLoadingPurchases(false);
    }
  };

  const fetchCouponUsages = async () => {
    try {
      const { data, error } = await supabase
        .from('coupon_usages')
        .select(`
          *,
          user:profiles (
            name,
            email
          ),
          coupon:coupon_codes (
            code,
            discount_percentage
          )
        `)
        .order('used_at', { ascending: false });

      if (error) throw error;
      console.log("cpn",data)
      setCouponUsages(data || []);
    } catch (error) {
      console.error('Error fetching coupon usages:', error);
      toast.error('Failed to fetch coupon usages');
    } finally {
      setIsLoadingUsages(false);
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    if (!window.confirm('Are you sure you want to delete this coupon? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('coupon_codes')
        .delete()
        .eq('id', couponId);

      if (error) throw error;

      toast.success('Coupon deleted successfully');
      fetchCoupons();
      fetchCouponUsages();
    } catch (error: any) {
      toast.error('Failed to delete coupon: ' + error.message);
    }
  };

  // Group orders by user
  const ordersByUser = orders.reduce((acc, order) => {
    if (!acc[order.user_id]) {
      acc[order.user_id] = {
        user: order.user,
        orders: []
      };
    }
    acc[order.user_id].orders.push(order);
    return acc;
  }, {} as Record<string, { user: { name: string; email: string }; orders: Order[] }>);

  const handleAddCredentials = async () => {
    try {
      if (!newCredentials.service_id || !newCredentials.email || !newCredentials.password) {
        toast.error('Please fill in all required fields');
        return;
      }

      const { error } = await supabase
        .from('service_credentials')
        .insert([{
          ...newCredentials,
          is_used: false
        }]);

      if (error) throw error;

      toast.success('Credentials added successfully');
      setIsAddingCredentials(false);
      setNewCredentials({
        service_id: '',
        email: '',
        password: '',
        two_factor_key: '',
        description: '',
        coupon_code: '',
        logo_url: ''
      });
      fetchCredentials();
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to add credentials: ' + error.message);
    }
  };

  const handleAddCoupon = async () => {
    try {
      const { error } = await supabase
        .from('coupon_codes')
        .insert([{
          ...newCoupon,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }]);

      if (error) throw error;

      toast.success('Coupon added successfully');
      setIsAddingCoupon(false);
      setNewCoupon({
        code: '',
        discount_percentage: 0,
        max_uses: 0,
        expires_at: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0]
      });
      fetchCoupons();
    } catch (error: any) {
      toast.error('Failed to add coupon: ' + error.message);
    }
  };

  const handleUpdatePage = async () => {
    if (!selectedPage) return;

    try {
      const { error } = await supabase
        .from('pages')
        .update({
          title: selectedPage.title,
          content: selectedPage.content,
          updated_by: (await supabase.auth.getUser()).data.user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedPage.id);

      if (error) throw error;

      toast.success('Page updated successfully');
      setIsEditingPage(false);
      fetchPages();
    } catch (error: any) {
      toast.error('Failed to update page: ' + error.message);
    }
  };

  const handleChangeAdminPassword = async () => {
    try {
      if (!currentPassword || !newAdminPassword) {
        toast.error('Please fill in all fields');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      console.log(user)
      if (!user) throw new Error('Not authenticated');

      // First verify current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: 'proxcyadmin@gmail.com',
        password: currentPassword,
      });

      if (signInError) {
        console.log(signInError)
        toast.error('Current password is incorrect');
        return;
      }
      fetchApiData("POST", "admin/change-password", {
        data: {
          userId: user.id,
          newPassword: newAdminPassword
        }
      }).then(
        (v)=> {
      toast.success('Password updated successfully');
      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewAdminPassword('');
          navigate("/login")
        }
      ).catch((v)=>{
        console.log(v)
        toast.error("Failed " + v.response.data.error)
      })
     
    } catch (error: any) {
      toast.error('Failed to update password: ' + error.message);
    }
  };

  const fetchOrderStats = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            quantity,
            price_per_unit,
            service:services (name)
          )
        `)
        .gte('created_at', dateFilter.start)
        .lte('created_at', dateFilter.end);

      if (error) throw error;

      const stats = data.reduce((acc: OrderStats, order) => {
        acc.total_orders++;
        acc.total_revenue += order.total_amount;

        order.order_items.forEach((item: any) => {
          const serviceName = item.service.name;
          const existingService = acc.orders_by_service.find(s => s.service_name === serviceName);
          
          if (existingService) {
            existingService.count += item.quantity;
            existingService.revenue += item.quantity * item.price_per_unit;
          } else {
            acc.orders_by_service.push({
              service_name: serviceName,
              count: item.quantity,
              revenue: item.quantity * item.price_per_unit
            });
          }
        });

        return acc;
      }, {
        total_orders: 0,
        total_revenue: 0,
        orders_by_service: []
      });

      setOrderStats(stats);
    } catch (error) {
      console.error('Error fetching order stats:', error);
      toast.error('Failed to fetch order statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = async () => {
    try {
      if (!newService.name || !newService.type || newService.price <= 0) {
        toast.error('Please fill in all required fields');
        return;
      }

      const { error } = await supabase
        .from('services')
        .insert([newService]);

      if (error) throw error;

      toast.success('Service added successfully!');
      setIsAddingService(false);
      setNewService({
        name: '',
        description: '',
        type: '',
        price: 0,
        stock_count: 0,
        logo_url: '',
        is_available: true
      });
      fetchServices();
      fetchCredentials()
    } catch (error: any) {
      toast.error('Failed to add service: ' + error.message);
    }
  };

  const handleUpdateStock = async (serviceId: string, newStock: number) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ stock_count: newStock })
        .eq('id', serviceId);

      if (error) throw error;
      toast.success('Stock updated successfully!');
      fetchServices();
    } catch (error: any) {
      toast.error('Failed to update stock: ' + error.message);
    }
  };

  const handleToggleAvailability = async (serviceId: string, isAvailable: boolean) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ is_available: !isAvailable })
        .eq('id', serviceId);

      if (error) throw error;
      toast.success(`Service ${isAvailable ? 'disabled' : 'enabled'} successfully`);
      fetchServices();
    } catch (error: any) {
      toast.error('Failed to update service availability: ' + error.message);
    }
  };

  const handleToggleUserBan = async (userId: string, isBanned: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_banned: !isBanned })
        .eq('id', userId);

      if (error) throw error;
      toast.success(`User ${isBanned ? 'unbanned' : 'banned'} successfully`);
      fetchUsers();
    } catch (error: any) {
      toast.error('Failed to update user ban status: ' + error.message);
    }
  };

  const handleUpdatePassword = async () => {
    if (!selectedUser || !newPassword) {
      toast.error('Please select a user and enter a new password');
      return;
    }

    try {
      


      fetchApiData("POST", "admin/change-password", {
        data: {
          userId: selectedUser,
          newPassword: newPassword
        }
      }).then(
        (v)=> {
          toast.success(v.data.message)
          setSelectedUser(null)
          setNewPassword("")
        }
      ).catch((v)=>{
        console.log(v)
        toast.error(v.response.data.error)
      })
    } catch (error: any) {
      toast.error('Failed to update password: ' + error.message);
      throw error
    }
  };

  const handleUpdateTelegramLink = async () => {
    try {
      const { error } = await supabase
        .from('settings')
        .update({ 
          value: telegramLink,
          updated_by: (await supabase.auth.getUser()).data.user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('key', 'telegram_group_link');

      if (error) throw error;
      toast.success('Telegram group link updated successfully');
    } catch (error: any) {
      toast.error('Failed to update Telegram link: ' + error.message);
    }
  };

  const handleUpdateWhatsappLink = async () => {
    try {
      const { error } = await supabase
        .from('settings')
        .update({ 
          value: whatsappLink,
          updated_by: (await supabase.auth.getUser()).data.user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('key', 'whatsapp_group_link');

      if (error) throw error;
      toast.success('WhatsApp group link updated successfully');
    } catch (error: any) {
      toast.error('Failed to update WhatsApp link: ' + error.message);
    }
  };

  const handleSendNotification = async () => {
    try {
      if (!newNotification.title || !newNotification.message) {
        toast.error('Please enter both title and message');
        return;
      }

      const { error } = await supabase
        .from('notifications')
        .insert([{
          title: newNotification.title,
          message: newNotification.message,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }]);

      if (error) throw error;
      toast.success('Notification sent successfully');
      setNewNotification({ title: '', message: '' });
    } catch (error: any) {
      toast.error('Failed to send notification: ' + error.message);
    }
  };

  const handleEditService = async () => {
    try {
      if (!selectedService) return;

      const { error } = await supabase
        .from('services')
        .update({
          name: selectedService.name,
          description: selectedService.description,
          type: selectedService.type,
          price: selectedService.price,
          stock_count: selectedService.stock_count,
          logo_url: selectedService.logo_url,
          is_available: selectedService.is_available
        })
        .eq('id', selectedService.id);

      if (error) throw error;

      toast.success('Service updated successfully');
      setIsEditingService(false);
      setSelectedService(null);
      fetchServices();
    } catch (error: any) {
      toast.error('Failed to update service: ' + error.message);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!window.confirm('Are you sure you want to mark this service as deleted? This action can be undone later.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('services')
        .update({ 
          is_deleted: true,
          is_available: false  // Also mark as unavailable
        })
        .eq('id', serviceId);

      if (error) throw error;

      toast.success('Service marked as deleted successfully');
      fetchServices();
    } catch (error: any) {
      toast.error('Failed to delete service: ' + error.message);
    }
  };

  const handleEditUser = async () => {
    try {
      if (!selectedUserForEdit) return;

      const { error } = await supabase
        .from('profiles')
        .update({
          name: selectedUserForEdit.full_name,
          email: selectedUserForEdit.email,
          contact_username: selectedUserForEdit.telegram_id
        })
        .eq('id', selectedUserForEdit.id);

      if (error) throw error;

      toast.success('User updated successfully');
      setIsEditingUser(false);
      setSelectedUserForEdit(null);
      fetchUsers();
    } catch (error: any) {
      toast.error('Failed to update user: ' + error.message);
    }
  };

  const handleRestoreService = async (serviceId: string) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ 
          is_deleted: false,
          is_available: false  // Set as unavailable by default when restoring
        })
        .eq('id', serviceId);

      if (error) throw error;

      toast.success('Service restored successfully');
      fetchServices();
    } catch (error: any) {
      toast.error('Failed to restore service: ' + error.message);
    }
  };

  const handleClearUserCart = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ clear_cart: true })
        .eq('id', userId);

      if (error) throw error;
      toast.success('User cart will be cleared on their next page load');
    } catch (error: any) {
      toast.error('Failed to set cart clear flag: ' + error.message);
    }
  };

  const handleBulkUpload = async () => {
    try {
      if (!bulkUploadFile) {
        toast.error('Please select a file to upload');
        return;
      }

      if (!newCredentials.service_id) {
        toast.error('Please select a service');
        return;
      }

      if (!user) {
        toast.error('User not authenticated');
        return;
      }

      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          if (!text) {
            toast.error('File is empty');
            return;
          }

          const lines = text.split('\n').map(line => line.trim()).filter(line => line);
          if (lines.length === 0) {
            toast.error('File must contain at least one credential');
            return;
          }

          const credentials = lines.map(line => {
            const [email, password, twoFactorKey, couponCode] = line.split(':').map(item => item.trim());
            if (!email || !password) {
              throw new Error('Invalid format. Each line should contain at least email and password separated by ":"');
            }
            return {
              email,
              password,
              two_factor_key: twoFactorKey || '',
              coupon_code: couponCode || '',
              service_id: newCredentials.service_id,
            };
          });

          supabase
            .from('service_credentials')
            .insert(credentials)
            .then(({ error }) => {
              if (error) throw error;
              toast.success(`Successfully added ${credentials.length} credentials`);
              setIsBulkUploading(false);
              setBulkUploadFile(null);
              fetchCredentials();
            })
            .catch(error => {
              console.error('Error uploading credentials:', error);
              toast.error(error.message || 'Failed to upload credentials');
            });
        } catch (error: any) {
          console.error('Error processing file:', error);
          toast.error(error.message || 'Failed to process credentials file');
        }
      };

      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        toast.error('Error reading file. Please try again.');
      };

      reader.readAsText(bulkUploadFile);
    } catch (error: any) {
      console.error('Error in handleBulkUpload:', error);
      toast.error('Failed to upload credentials: ' + error.message);
    }
  };

  const filteredPurchases = userPurchases.filter(purchase => 
    purchase.user.email.toLowerCase().includes(searchEmail.toLowerCase())
  );

  const handleDeleteCredential = async (credentialId: string) => {
    if (!window.confirm('Are you sure you want to delete this credential? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('service_credentials')
        .delete()
        .eq('id', credentialId);

      if (error) throw error;

      toast.success('Credential deleted successfully');
      fetchCredentials();
    } catch (error: any) {
      toast.error('Failed to delete credential: ' + error.message);
    }
  };

  const handleEditCredential = async (credential: any) => {
    try {
      const { error } = await supabase
        .from('service_credentials')
        .update({
          email: credential.email,
          password: credential.password,
          two_factor_key: credential.two_factor_key,
          coupon_code: credential.coupon_code,
          logo_url: credential.logo_url
        })
        .eq('id', credential.id);

      if (error) throw error;

      toast.success('Credential updated successfully');
      fetchCredentials();
    } catch (error: any) {
      toast.error('Failed to update credential: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fadeIn">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setIsAddingService(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors transform hover:scale-105"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Service
          </button>
          <button
            onClick={() => setIsChangingPassword(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors transform hover:scale-105"
          >
            <Key className="w-5 h-5 mr-2" />
            Change Password
          </button>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 transform hover:scale-105 transition-transform">
          <div className="flex items-center gap-4">
            <Package2 className="w-8 h-8 text-blue-500" />
            <div>
              <h2 className="text-xl font-semibold">Total Services</h2>
              <p className="text-3xl font-bold text-blue-600">{services.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 transform hover:scale-105 transition-transform">
          <div className="flex items-center gap-4">
            <Users className="w-8 h-8 text-green-500" />
            <div>
              <h2 className="text-xl font-semibold">Total Users</h2>
              <p className="text-3xl font-bold text-green-600">{users.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 transform hover:scale-105 transition-transform">
          <div className="flex items-center gap-4">
            <Package2 className="w-8 h-8 text-purple-500" />
            <div>
              <h2 className="text-xl font-semibold">Today's Orders</h2>
              <p className="text-3xl font-bold text-purple-600">{orderStats.total_orders}</p>
            </div>
          </div>
        </div>
      </div>

      {/* User Purchases Section - Moved above Order Statistics */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">User Purchases</h2>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by email..."
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <button
              onClick={fetchUserPurchases}
              className="flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </button>
          </div>
        </div>
        {isLoadingPurchases ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredPurchases.length === 0 ? (
          <p className="text-gray-500 text-center">No purchases found</p>
        ) : (
          <div className="overflow-x-auto hgj">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Password</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">2FA Key</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Coupon Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purchase Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPurchases.map((purchase) => (
                  <tr key={purchase.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{purchase.user.name}</div>
                      <div className="text-sm text-gray-500">{purchase.user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{purchase.services.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{purchase.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{purchase.password}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{purchase.two_factor_key || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{purchase.coupon_code || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(purchase.created_at).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Statistics */}
      <div className="bg-white rounded-lg shadow p-6 mb-8 transform hover:scale-105 transition-transform">
        <h2 className="text-xl font-semibold mb-4">Order Statistics</h2>
        <div className="flex space-x-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              value={dateFilter.start.split('T')[0]}
              onChange={(e) => setDateFilter({
                ...dateFilter,
                start: new Date(e.target.value).toISOString()
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              value={dateFilter.end.split('T')[0]}
              onChange={(e) => setDateFilter({
                ...dateFilter,
                end: new Date(e.target.value).toISOString()
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between text-lg font-semibold">
            <span>Total Revenue:</span>
            <span>${orderStats.total_revenue.toFixed(2)}</span>
          </div>
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-2">Orders by Service</h3>
            {orderStats.orders_by_service.map((stat, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>{stat.service_name}</span>
                <span>{stat.count} orders (${stat.revenue.toFixed(2)})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content Management */}
      <div className="bg-white rounded-lg shadow p-6 mb-8 transform hover:scale-105 transition-transform">
        <h2 className="text-xl font-semibold mb-4">Content Management</h2>
        <div className="space-y-4">
          {pages.map((page) => (
            <div key={page.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="font-medium">{page.title}</span>
              <button
                onClick={() => {
                  setSelectedPage(page);
                  setIsEditingPage(true);
                }}
                className="flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Discount Codes */}
      <div className="bg-white rounded-lg shadow p-6 mb-8 transform hover:scale-105 transition-transform">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Discount Codes</h2>
          <button
            onClick={() => setIsAddingCoupon(true)}
            className="flex items-center px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Coupon
          </button>
        </div>
        <div className="overflow-x-auto hgj">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Discount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uses</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expires</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="border-t">
                  <td className="px-6 py-4 whitespace-nowrap">{coupon.code}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{coupon.discount_percentage}%</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {(couponUsages.filter(usage => usage.coupon_id === coupon.id).length || coupon.current_uses)}/{coupon.max_uses}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(coupon.expires_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => setSelectedCoupon(coupon.id)}
                      className="text-blue-600 hover:text-blue-800 mr-2"
                    >
                      View Usage
                    </button>
                    <button
                      onClick={() => handleDeleteCoupon(coupon.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Coupon Usage Modal */}
        {selectedCoupon && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Coupon Usage History</h2>
                <button onClick={() => setSelectedCoupon(null)}>
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="overflow-x-auto hgj">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Used At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {couponUsages
                      .filter(usage => usage.coupon_id === selectedCoupon)
                      .map(usage => (
                        <tr key={usage.id} className="border-t">
                          <td className="px-6 py-4 whitespace-nowrap">{usage.user.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{usage.user.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {new Date(usage.used_at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pre-added Stock */}
      <div className="bg-white rounded-lg shadow p-6 mb-8 transform hover:scale-105 transition-transform">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Pre-added Stock</h2>
          <div className="flex space-x-2">
          <button
            onClick={() => setIsAddingCredentials(true)}
            className="flex items-center px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Credentials
          </button>
            <button
              onClick={() => setIsBulkUploading(true)}
              className="flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Upload className="w-4 h-4 mr-1" />
              Bulk Upload
            </button>
          </div>
        </div>
        <div className="overflow-x-auto hgj">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Logo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Added</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {credentials.map((cred) => (
                <tr key={cred.id} className="border-t">
                  <td className="px-6 py-4 whitespace-nowrap">{cred.service.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {cred.logo_url && (
                      <img
                        src={cred.logo_url}
                        alt={`${cred.service.name} logo`}
                        className="h-8 w-8 object-contain rounded"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/150';
                        }}
                      />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{cred.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      cred.is_used ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {cred.is_used ? 'Used' : 'Available'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(cred.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedCredential(cred);
                          setIsEditingCredential(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCredential(cred.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Credential Modal */}
      {isEditingCredential && selectedCredential && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Credential</h2>
              <button onClick={() => {
                setIsEditingCredential(false);
                setSelectedCredential(null);
              }}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={selectedCredential.email}
                  onChange={(e) => setSelectedCredential({ ...selectedCredential, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="text"
                  value={selectedCredential.password}
                  onChange={(e) => setSelectedCredential({ ...selectedCredential, password: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">2FA Key (Optional)</label>
                <input
                  type="text"
                  value={selectedCredential.two_factor_key}
                  onChange={(e) => setSelectedCredential({ ...selectedCredential, two_factor_key: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Coupon Code (Optional)</label>
                <input
                  type="text"
                  value={selectedCredential.coupon_code}
                  onChange={(e) => setSelectedCredential({ ...selectedCredential, coupon_code: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Logo URL (Optional)</label>
                <input
                  type="url"
                  value={selectedCredential.logo_url}
                  onChange={(e) => setSelectedCredential({ ...selectedCredential, logo_url: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => handleEditCredential(selectedCredential)}
                  className="flex-1 justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setIsEditingCredential(false);
                    setSelectedCredential(null);
                  }}
                  className="flex-1 justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Telegram Group Link */}
      <div className="bg-white rounded-lg shadow p-6 mb-8 transform hover:scale-105 transition-transform">
        <h2 className="text-xl font-semibold mb-4">Telegram Group Settings</h2>
        <div className="flex space-x-4">
          <input
            type="text"
            value={telegramLink}
            onChange={(e) => setTelegramLink(e.target.value)}
            placeholder="Enter Telegram group link"
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <button
            onClick={handleUpdateTelegramLink}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save
          </button>
        </div>
      </div>

      {/* WhatsApp Group Link */}
      <div className="bg-white rounded-lg shadow p-6 mb-8 transform hover:scale-105 transition-transform">
        <h2 className="text-xl font-semibold mb-4">WhatsApp Group Settings</h2>
        <div className="flex space-x-4">
          <input
            type="text"
            value={whatsappLink}
            onChange={(e) => setWhatsappLink(e.target.value)}
            placeholder="Enter WhatsApp group link"
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <button
            onClick={handleUpdateWhatsappLink}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Save
          </button>
        </div>
      </div>

      {/* Broadcast Message */}
      <div className="bg-white rounded-lg shadow p-6 mb-8 transform hover:scale-105 transition-transform">
        <h2 className="text-xl font-semibold mb-4">Send Broadcast Message</h2>
        <div className="space-y-4">
          <input
            type="text"
            value={newNotification.title}
            onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
            placeholder="Notification Title"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <textarea
            value={newNotification.message}
            onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
            placeholder="Notification Message"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={3}
          />
          <button
            onClick={handleSendNotification}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors transform hover:scale-105"
          >
            Send to All Users
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">User Management</h2>
          <div className="overflow-x-auto hgj">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referral Info</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-all duration-200 transform hover:scale-[1.01]">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      <div className="text-xs text-gray-400">ID: {user.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{user.contact_username}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        Joined: {new Date(user.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        Last Login: {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        Code: {user.refer_code || 'N/A'}
                      </div>
                      {user.referred_by && (
                        <div className="text-sm text-gray-500">
                          Referred by: {user.referred_by_user?.name || 'Unknown'}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.is_banned ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {user.is_banned ? 'Banned' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium space-y-2">
                      <button
                        onClick={() => handleToggleUserBan(user.id, user.is_banned)}
                        className={`block w-full text-center px-3 py-1 rounded ${
                          user.is_banned 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {user.is_banned ? 'Unban User' : 'Ban User'}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUserForEdit(user);
                          setIsEditingUser(true);
                        }}
                        className="block w-full text-center px-3 py-1 rounded bg-blue-100 text-blue-800 hover:bg-blue-200"
                      >
                        Edit User
                      </button>
                      <button
                        onClick={() => handleClearUserCart(user.id)}
                        className="text-yellow-600 hover:text-yellow-800"
                      >
                        <Trash className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-lg mb-8 shadow overflow-hidden transform hover:scale-105 transition-transform">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Services Overview</h2>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showDeletedServices}
                  onChange={(e) => setShowDeletedServices(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Show deleted services</span>
              </label>
              <button
                onClick={() => setIsAddingService(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add New Service
              </button>
            </div>
          </div>
          <div className="overflow-x-auto hgj">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {services.map((service) => (
                  <tr 
                    key={service.id} 
                    className={`hover:bg-gray-50 ${
                      service.is_deleted 
                        ? 'bg-red-50 opacity-60' 
                        : !service.is_available 
                          ? 'opacity-60' 
                          : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {service.logo_url && (
                          <img
                            src={service.logo_url}
                            alt={service.name}
                            className="h-10 w-10 rounded-full mr-3"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{service.name}</div>
                          <div className="text-sm text-gray-500">{service.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{service.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${service.price}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        value={service.stock_count}
                        onChange={(e) => handleUpdateStock(service.id, parseInt(e.target.value))}
                        className="w-20 px-2 py-1 border rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleAvailability(service.id, service.is_available)}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          service.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {service.is_available ? 'Available' : 'Out of Stock'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedService(service);
                            setIsEditingService(true);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        {service.is_deleted ? (
                          <button
                            onClick={() => handleRestoreService(service.id)}
                            className="text-green-600 hover:text-green-800"
                          >
                            <RefreshCw className="h-5 w-5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDeleteService(service.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Service Modal */}
      {isAddingService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add New Service</h2>
              <button onClick={() => setIsAddingService(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={newService.name}
                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={newService.description}
                  onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <input
                  type="text"
                  value={newService.type}
                  onChange={(e) => setNewService({ ...newService, type: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Logo URL</label>
                <input
                  type="url"
                  value={newService.logo_url}
                  onChange={(e) => setNewService({ ...newService, logo_url: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter logo URL"
                />
                {newService.logo_url && (
                  <div className="mt-2">
                    <img
                      src={newService.logo_url}
                      alt="Service logo preview"
                      className="h-16 w-16 object-contain rounded border"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/150';
                      }}
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Price</label>
                <input
                  type="number"
                  value={newService.price}
                  onChange={(e) => setNewService({ ...newService, price: parseFloat(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Stock Count</label>
                <input
                  type="number"
                  value={newService.stock_count}
                  onChange={(e) => setNewService({ ...newService, stock_count: parseInt(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_available"
                  checked={newService.is_available}
                  onChange={(e) => setNewService({ ...newService, is_available: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_available" className="ml-2 block text-sm text-gray-900">
                  Available for Purchase
                </label>
              </div>
              <button
                onClick={handleAddService}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Add Service
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Change User Password</h2>
              <button onClick={() => setSelectedUser(null)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter new password"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={handleUpdatePassword}
                  className="flex-1 justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Update Password
                </button>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="flex-1 justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Admin Password Modal */}
      {isChangingPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Change Admin Password</h2>
              <button onClick={() => setIsChangingPassword(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">New Password</label>
                <input
                  type="password"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter new password"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={handleChangeAdminPassword}
                  className="flex-1 justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Update Password
                </button>
                <button
                  onClick={() => setIsChangingPassword(false)}
                  className="flex-1 justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Page Modal */}
      {isEditingPage && selectedPage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit {selectedPage.title}</h2>
              <button onClick={() => setIsEditingPage(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={selectedPage.title}
                  onChange={(e) => setSelectedPage({ ...selectedPage, title: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Slug</label>
                <input
                  type="text"
                  value={selectedPage.slug}
                  onChange={(e) => setSelectedPage({ ...selectedPage, slug: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  disabled
                />
                <p className="mt-1 text-sm text-gray-500">
                  The page will be accessible at /policy/{selectedPage.slug}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content (Markdown)</label>
                <MDEditor
                  value={selectedPage.content}
                  onChange={(value) => setSelectedPage({ ...selectedPage, content: value || '' })}
                  preview="edit"
                  height={400}
                />
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={handleUpdatePage}
                  className="flex-1 justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditingPage(false)}
                  className="flex-1 justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Coupon Modal */}
      {isAddingCoupon && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add New Coupon</h2>
              <button onClick={() => setIsAddingCoupon(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Coupon Code</label>
                <input
                  type="text"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter coupon code"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Discount Percentage</label>
                <input
                  type="number"
                  value={newCoupon.discount_percentage}
                  onChange={(e) => setNewCoupon({ ...newCoupon, discount_percentage: parseInt(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter discount percentage"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Maximum Uses</label>
                <input
                  type="number"
                  value={newCoupon.max_uses}
                  onChange={(e) => setNewCoupon({ ...newCoupon, max_uses: parseInt(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter maximum number of uses"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                <input
                  type="date"
                  value={newCoupon.expires_at}
                  onChange={(e) => setNewCoupon({ ...newCoupon, expires_at: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={handleAddCoupon}
                  className="flex-1 justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Add Coupon
                </button>
                <button
                  onClick={() => setIsAddingCoupon(false)}
                  className="flex-1 justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Credentials Modal */}
      {isAddingCredentials && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add New Credentials</h2>
              <button onClick={() => setIsAddingCredentials(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Service</label>
                <select
                  value={newCredentials.service_id}
                  onChange={(e) => setNewCredentials({ ...newCredentials, service_id: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select a service</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>{service.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={newCredentials.email}
                  onChange={(e) => setNewCredentials({ ...newCredentials, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="text"
                  value={newCredentials.password}
                  onChange={(e) => setNewCredentials({ ...newCredentials, password: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">2FA Key (Optional)</label>
                <input
                  type="text"
                  value={newCredentials.two_factor_key}
                  onChange={(e) => setNewCredentials({ ...newCredentials, two_factor_key: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter 2FA key"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Logo URL (Optional)</label>
                <input
                  type="url"
                  value={newCredentials.logo_url}
                  onChange={(e) => setNewCredentials({ ...newCredentials, logo_url: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter logo URL"
                />
                {newCredentials.logo_url && (
                  <div className="mt-2">
                    <img
                      src={newCredentials.logo_url}
                      alt="Preview"
                      className="h-16 w-16 object-contain rounded border"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/150';
                      }}
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                <textarea
                  value={newCredentials.description}
                  onChange={(e) => setNewCredentials({ ...newCredentials, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter additional information"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Coupon Code (Optional)</label>
                <input
                  type="text"
                  value={newCredentials.coupon_code}
                  onChange={(e) => setNewCredentials({ ...newCredentials, coupon_code: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter coupon code"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={handleAddCredentials}
                  className="flex-1 justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Add Credentials
                </button>
                <button
                  onClick={() => setIsAddingCredentials(false)}
                  className="flex-1 justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Service Modal */}
      {isEditingService && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Service</h2>
              <button onClick={() => {
                setIsEditingService(false);
                setSelectedService(null);
              }}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={selectedService.name}
                  onChange={(e) => setSelectedService({ ...selectedService, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={selectedService.description}
                  onChange={(e) => setSelectedService({ ...selectedService, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <input
                  type="text"
                  value={selectedService.type}
                  onChange={(e) => setSelectedService({ ...selectedService, type: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Logo URL</label>
                <input
                  type="url"
                  value={selectedService.logo_url}
                  onChange={(e) => setSelectedService({ ...selectedService, logo_url: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Price</label>
                <input
                  type="number"
                  value={selectedService.price}
                  onChange={(e) => setSelectedService({ ...selectedService, price: parseFloat(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Stock Count</label>
                <input
                  type="number"
                  value={selectedService.stock_count}
                  onChange={(e) => setSelectedService({ ...selectedService, stock_count: parseInt(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="edit_is_available"
                  checked={selectedService.is_available}
                  onChange={(e) => setSelectedService({ ...selectedService, is_available: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="edit_is_available" className="ml-2 block text-sm text-gray-900">
                  Available for Purchase
                </label>
              </div>
              <button
                onClick={handleEditService}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Update Service
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditingUser && selectedUserForEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit User</h2>
              <button onClick={() => {
                setIsEditingUser(false);
                setSelectedUserForEdit(null);
              }}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  value={selectedUserForEdit.full_name}
                  onChange={(e) => setSelectedUserForEdit({ ...selectedUserForEdit, full_name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={selectedUserForEdit.email}
                  onChange={(e) => setSelectedUserForEdit({ ...selectedUserForEdit, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Telegram ID</label>
                <input
                  type="text"
                  value={selectedUserForEdit.telegram_id}
                  onChange={(e) => setSelectedUserForEdit({ ...selectedUserForEdit, telegram_id: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleEditUser}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Update User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {isBulkUploading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Bulk Upload Credentials</h2>
              <button onClick={() => {
                setIsBulkUploading(false);
                setBulkUploadFile(null);
              }}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Service</label>
                <select
                  value={newCredentials.service_id}
                  onChange={(e) => setNewCredentials({ ...newCredentials, service_id: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select a service</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>{service.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Credentials File</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          accept=".txt"
                          className="sr-only"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.type !== 'text/plain') {
                                toast.error('Please upload a text file');
                                return;
                              }
                              setBulkUploadFile(file);
                            }
                          }}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      TXT file with credentials in format:<br />
                      email:password:2fa_key:coupon_code<br />
                      email:password:2fa_key:coupon_code
                    </p>
                  </div>
                </div>
                {bulkUploadFile && (
                  <p className="mt-2 text-sm text-gray-500">
                    Selected file: {bulkUploadFile.name}
                  </p>
                )}
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={handleBulkUpload}
                  className="flex-1 justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Upload Credentials
                </button>
                <button
                  onClick={() => {
                    setIsBulkUploading(false);
                    setBulkUploadFile(null);
                  }}
                  className="flex-1 justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;