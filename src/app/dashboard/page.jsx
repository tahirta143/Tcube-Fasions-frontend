'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { User, ClipboardList, Settings, MapPin, RefreshCw, ChevronDown, ChevronUp, Package, Clock, CheckCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function UserDashboard() {
  const { user, token, updateProfile } = useAuth();
  const router = useRouter();

  // Navigation state
  const [activeTab, setActiveTab] = useState('orders'); // orders, profile

  // Form State
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: ''
  });

  // Orders State
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  // Profile Update Statuses
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateMessage, setUpdateMessage] = useState({ type: '', text: '' });

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/auth?redirect=dashboard');
    } else {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        password: '',
        confirmPassword: ''
      });
    }
  }, [user]);

  // Fetch orders
  const fetchMyOrders = async () => {
    if (!token) return;
    setLoadingOrders(true);
    try {
      const res = await axios.get(`${API_URL}/api/orders/myorders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch (err) {
      console.warn('Could not fetch orders from DB, using mock records:', err);
      // Fallback mock orders
      setOrders([
        {
          id: 101,
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          total_amount: 18700,
          payment_method: 'easypaisa',
          payment_status: 'paid',
          order_status: 'shipped',
          transaction_id: '827364519283',
          sender_account: '0300-1122334',
          items: [
            { id: 1, product_name: 'Classic Linen Trench Coat', price: 11900, quantity: 1, size: 'M', color: 'Beige' },
            { id: 3, product_name: 'Merino Wool Mockneck Sweater', price: 6800, quantity: 1, size: 'L', color: 'Oatmeal' }
          ]
        },
        {
          id: 102,
          created_at: new Date().toISOString(),
          total_amount: 9800,
          payment_method: 'cod',
          payment_status: 'pending',
          order_status: 'pending',
          items: [
            { id: 2, product_name: 'Minimalist Silk Slip Dress', price: 9800, quantity: 1, size: 'S', color: 'Charcoal' }
          ]
        }
      ]);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchMyOrders();
  }, [token]);

  if (!user) {
    return null;
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setUpdateMessage({ type: '', text: '' });
    
    if (profileForm.password) {
      if (profileForm.password.length < 6) {
        setUpdateMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
        return;
      }
      if (profileForm.password !== profileForm.confirmPassword) {
        setUpdateMessage({ type: 'error', text: 'Passwords do not match.' });
        return;
      }
    }

    setUpdateLoading(true);
    
    const { confirmPassword, ...submitData } = profileForm;
    const res = await updateProfile(submitData);
    if (res.success) {
      setUpdateMessage({ type: 'success', text: 'Profile details saved successfully.' });
      setProfileForm(prev => ({ ...prev, password: '', confirmPassword: '' }));
    } else {
      setUpdateMessage({ type: 'error', text: res.message });
    }
    setUpdateLoading(false);
  };

  const toggleExpandOrder = async (orderId) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
      return;
    }

    setExpandedOrderId(orderId);

    // Fetch details for that specific order if items don't exist yet
    const targetIdx = orders.findIndex((o) => o.id === orderId);
    if (targetIdx > -1 && !orders[targetIdx].items) {
      try {
        const res = await axios.get(`${API_URL}/api/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const updatedOrders = [...orders];
        updatedOrders[targetIdx] = res.data;
        setOrders(updatedOrders);
      } catch (err) {
        console.error('Error fetching order items:', err);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
      
      {/* Sidebar Controls */}
      <div className="lg:col-span-1 space-y-6">
        {/* User Card */}
        <div className="glass-card p-6 flex flex-col items-center text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-sand-200 border border-sand-300 flex items-center justify-center text-primary font-bold text-lg uppercase shadow-inner">
            {user.name.charAt(0)}
          </div>
          <div>
            <h2 className="font-serif text-lg font-bold text-primary">{user.name}</h2>
            <span className="text-[10px] text-primary/40 uppercase tracking-widest font-semibold">{user.email}</span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-widest px-3 py-1 bg-sand-100 rounded-full border text-secondary border-sand-200">
            {user.role} member
          </span>
        </div>

        {/* Tab Links */}
        <div className="bg-white/60 p-3 rounded-2xl border border-sand-200/50 shadow-sm flex flex-col space-y-1">
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 transition-colors ${activeTab === 'orders' ? 'bg-primary text-white' : 'text-primary/70 hover:bg-sand-100 hover:text-primary'}`}
          >
            <ClipboardList size={16} />
            My Orders
          </button>
          
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 transition-colors ${activeTab === 'profile' ? 'bg-primary text-white' : 'text-primary/70 hover:bg-sand-100 hover:text-primary'}`}
          >
            <Settings size={16} />
            Profile Settings
          </button>
        </div>
      </div>

      {/* Main Panel Content */}
      <div className="lg:col-span-3 space-y-6">
        
        {/* 1. ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-sand-200 pb-3 flex justify-between items-center">
              <h2 className="font-serif text-2xl font-bold text-primary">Order History</h2>
              <button onClick={fetchMyOrders} className="p-2 border border-sand-200 rounded hover:bg-sand-100 transition-colors" title="Reload orders list">
                <RefreshCw size={14} className={loadingOrders ? 'animate-spin' : ''} />
              </button>
            </div>

            {loadingOrders ? (
              <div className="space-y-4">
                {[1, 2].map((n) => (
                  <div key={n} className="h-32 bg-sand-100 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-20 bg-white/40 border border-dashed border-sand-200 rounded-2xl">
                <p className="text-sm text-primary/40 uppercase tracking-widest font-bold">No orders logged yet</p>
                <button onClick={() => router.push('/shop')} className="mt-4 text-xs font-bold text-secondary uppercase tracking-widest hover:underline">
                  Browse Store
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const isExpanded = expandedOrderId === order.id;
                  const date = new Date(order.created_at).toLocaleDateString(undefined, {
                    year: 'numeric', month: 'long', day: 'numeric'
                  });

                  // Delivery tracker classes
                  const statusColors = {
                    pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
                    shipped: 'bg-blue-50 text-blue-700 border-blue-200',
                    delivered: 'bg-green-50 text-green-700 border-green-200'
                  };

                  return (
                    <div key={order.id} className="glass-card overflow-hidden transition-all duration-300">
                      {/* Order Header Summary Row */}
                      <div
                        onClick={() => toggleExpandOrder(order.id)}
                        className="p-5 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-sand-50/50 select-none"
                      >
                        <div className="space-y-1">
                          <span className="text-[10px] text-primary/40 uppercase font-bold tracking-widest">Order ID</span>
                          <h4 className="text-xs font-bold text-primary">#{order.id}</h4>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] text-primary/40 uppercase font-bold tracking-widest">Order Date</span>
                          <h4 className="text-xs font-medium text-primary/70">{date}</h4>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] text-primary/40 uppercase font-bold tracking-widest">Payment ({order.payment_method.toUpperCase()})</span>
                          <h4 className="text-xs font-bold text-primary capitalize">{order.payment_status}</h4>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] text-primary/40 uppercase font-bold tracking-widest">Total Price</span>
                          <h4 className="text-xs font-bold text-secondary">Rs. {Math.round(parseFloat(order.total_amount))}</h4>
                        </div>

                        <div className="flex items-center space-x-3">
                          <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 border rounded-full ${statusColors[order.order_status] || 'bg-sand-100'}`}>
                            {order.order_status}
                          </span>
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                      </div>

                      {/* Expanded Order Items Row */}
                      {isExpanded && (
                        <div className="px-5 pb-5 border-t border-sand-200/50 bg-sand-50/20 space-y-6 pt-5 animate-fade-in">
                          {/* Visual Delivery Status Bar */}
                          <div className="space-y-2">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-primary/40">Shipment Status</span>
                            <div className="grid grid-cols-3 gap-1 text-center text-[10px] font-bold uppercase tracking-wider">
                              <div className="flex flex-col items-center gap-1">
                                <Clock size={16} className="text-yellow-600" />
                                <span className="text-yellow-700">1. Pending Approval</span>
                                <div className="h-1.5 w-full bg-yellow-500 rounded-full mt-1.5" />
                              </div>
                              <div className="flex flex-col items-center gap-1">
                                <Package size={16} className={['shipped', 'delivered'].includes(order.order_status) ? 'text-blue-600' : 'text-primary/20'} />
                                <span className={['shipped', 'delivered'].includes(order.order_status) ? 'text-blue-700' : 'text-primary/30'}>2. Shipped</span>
                                <div className={`h-1.5 w-full rounded-full mt-1.5 ${['shipped', 'delivered'].includes(order.order_status) ? 'bg-blue-500' : 'bg-sand-200'}`} />
                              </div>
                              <div className="flex flex-col items-center gap-1">
                                <CheckCircle size={16} className={order.order_status === 'delivered' ? 'text-green-600' : 'text-primary/20'} />
                                <span className={order.order_status === 'delivered' ? 'text-green-700' : 'text-primary/30'}>3. Delivered</span>
                                <div className={`h-1.5 w-full rounded-full mt-1.5 ${order.order_status === 'delivered' ? 'bg-green-500' : 'bg-sand-200'}`} />
                              </div>
                            </div>
                          </div>

                          {/* Items listing */}
                          <div className="space-y-3 pt-3 border-t border-sand-200/50">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-primary/40">Ordered Garments</span>
                            {order.items?.map((item, index) => (
                              <div key={index} className="flex justify-between items-center bg-white border border-sand-200 p-3.5 rounded-xl text-xs shadow-inner">
                                <div className="space-y-0.5">
                                  <h5 className="font-serif font-bold text-primary">{item.product_name || `Product ID: ${item.product_id}`}</h5>
                                  <span className="text-[10px] text-primary/50 font-semibold uppercase tracking-wider">
                                    Quantity: {item.quantity} {item.size ? `| Size: ${item.size}` : ''} {item.color ? `| Color: ${item.color}` : ''}
                                  </span>
                                </div>
                                <span className="font-bold text-primary">Rs. {Math.round(parseFloat(item.price) * item.quantity)}</span>
                              </div>
                            ))}
                          </div>

                          {/* Reference Receipt details */}
                          {(order.transaction_id || order.sender_account) && (
                            <div className="bg-sand-100/55 p-3 rounded-lg border border-sand-200 text-[10px] text-primary/60 font-semibold space-y-1">
                              {order.transaction_id && <p>TRANSACTION REFERENCE ID: {order.transaction_id}</p>}
                              {order.sender_account && <p>SENDER MOBILE ACCOUNT: {order.sender_account}</p>}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 2. PROFILE SETTINGS TAB */}
        {activeTab === 'profile' && (
          <div className="glass-card p-6 space-y-6 animate-fade-in">
            <div className="border-b border-sand-200 pb-3">
              <h2 className="font-serif text-2xl font-bold text-primary">Profile Details</h2>
              <p className="text-xs text-primary/40 uppercase tracking-wider font-semibold mt-1">Keep shipping address updated for quick ordering</p>
            </div>

            {updateMessage.text && (
              <div className={`p-3.5 rounded-lg border text-xs font-semibold ${updateMessage.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                {updateMessage.text}
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="flex flex-col space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-widest text-primary/50">Full Name</label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="text-xs border border-sand-200 p-3 rounded-lg focus:outline-none focus:border-secondary bg-white"
                />
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-widest text-primary/50">Contact Phone</label>
                <input
                  type="text"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  placeholder="e.g. 03001234567"
                  className="text-xs border border-sand-200 p-3 rounded-lg focus:outline-none focus:border-secondary bg-white"
                />
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-widest text-primary/50">Primary Shipping Address</label>
                <textarea
                  rows={4}
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  placeholder="Enter house, street, area, and city details..."
                  className="text-xs border border-sand-200 p-3 rounded-lg focus:outline-none focus:border-secondary bg-white"
                />
              </div>

              <div className="border-t border-sand-200/50 pt-4 mt-2">
                <span className="block text-xs font-bold uppercase tracking-wider text-primary/60 mb-3">Change Password (Optional)</span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-primary/50">New Password</label>
                    <input
                      type="password"
                      placeholder="Leave blank to keep current"
                      value={profileForm.password}
                      onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                      className="text-xs border border-sand-200 p-3 rounded-lg focus:outline-none focus:border-secondary bg-white"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-primary/50">Confirm New Password</label>
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      value={profileForm.confirmPassword}
                      onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                      className="text-xs border border-sand-200 p-3 rounded-lg focus:outline-none focus:border-secondary bg-white"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={updateLoading}
                className="w-full py-4 bg-primary hover:bg-secondary text-white font-semibold uppercase tracking-wider text-xs rounded-lg flex items-center justify-center gap-2 transition-all duration-300 shadow-md"
              >
                {updateLoading ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <>
                    <MapPin size={14} />
                    Save Updates
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
